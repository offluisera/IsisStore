-- ====================================================================
-- ISIS STORE — MIGRATION: PEDIDO EXPRESSO VIA WHATSAPP (RPC)
-- Versão: 20260930000003_quick_whatsapp_order_rpc.sql
-- ====================================================================

-- 1. Permitir que pedidos expressos de visitantes/anônimos tenham customer_id nulo
ALTER TABLE public.orders 
ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Função RPC segura com SECURITY DEFINER para geração rápida de pedido WhatsApp
CREATE OR REPLACE FUNCTION public.create_quick_whatsapp_order(
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_gw_active BOOLEAN;
  v_gw_settings JSONB;
  v_product RECORD;
  v_qty INTEGER;
  v_unit_price_cents INTEGER;
  v_total_cents INTEGER;
  v_customer_id UUID;
  v_profile RECORD;
  v_recipient_name TEXT;
  v_recipient_phone TEXT;
  v_order_number TEXT;
  v_order_id UUID;
  v_shipping_address JSONB;
  v_phone TEXT;
  v_template TEXT;
  v_clean_phone TEXT;
  v_random_suffix TEXT;
BEGIN
  -- 2.1 Validar quantidade
  v_qty := GREATEST(1, COALESCE(p_quantity, 1));

  -- 2.2 Validar se gateway WhatsApp está ativo
  SELECT is_active, settings 
  INTO v_gw_active, v_gw_settings
  FROM public.payment_gateways
  WHERE name = 'whatsapp';

  IF v_gw_active IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'O atendimento de pedidos via WhatsApp está desativado no momento.'
    );
  END IF;

  -- 2.3 Buscar produto
  SELECT id, name, sku, price_cents, sale_price_cents, stock, status
  INTO v_product
  FROM public.products
  WHERE id = p_product_id;

  IF v_product.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Produto não encontrado.'
    );
  END IF;

  IF v_product.status != 'published' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Produto indisponível para compra.'
    );
  END IF;

  IF v_product.stock < v_qty THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Quantidade solicitada indisponível no estoque.'
    );
  END IF;

  -- 2.4 Calcular valores (não deduz estoque; baixa manual pelo admin)
  v_unit_price_cents := COALESCE(v_product.sale_price_cents, v_product.price_cents);
  v_total_cents := v_unit_price_cents * v_qty;

  -- 2.5 Identificar cliente (sessão atual ou anônimo)
  v_customer_id := auth.uid();
  
  IF v_customer_id IS NOT NULL THEN
    SELECT full_name, phone INTO v_profile FROM public.profiles WHERE id = v_customer_id;
    v_recipient_name := COALESCE(NULLIF(trim(p_customer_name), ''), v_profile.full_name, 'Cliente Isis Store');
    v_recipient_phone := COALESCE(NULLIF(trim(p_customer_phone), ''), v_profile.phone, '');
  ELSE
    v_recipient_name := COALESCE(NULLIF(trim(p_customer_name), ''), 'Cliente WhatsApp');
    v_recipient_phone := COALESCE(NULLIF(trim(p_customer_phone), ''), '');
  END IF;

  -- 2.6 Gerar número exclusivo do pedido
  v_random_suffix := lpad(floor(random() * 9000 + 1000)::text, 4, '0');
  v_order_number := 'ISIS-' || to_char(now(), 'YYMMDD') || '-' || v_random_suffix;

  -- Snapshot de endereço para WhatsApp
  v_shipping_address := jsonb_build_object(
    'recipient_name', v_recipient_name,
    'phone', v_recipient_phone,
    'street', 'A combinar via WhatsApp',
    'number', 'S/N',
    'neighborhood', 'A combinar',
    'city', 'A combinar',
    'state', 'SP',
    'postal_code', '00000000',
    'shipping_method', 'pac',
    'payment_method', 'whatsapp'
  );

  -- 2.7 Inserir registro em orders
  INSERT INTO public.orders (
    customer_id,
    order_number,
    status,
    subtotal_cents,
    shipping_cents,
    discount_cents,
    total_cents,
    shipping_address,
    notes
  ) VALUES (
    v_customer_id,
    v_order_number,
    'pending_payment',
    v_total_cents,
    0,
    0,
    v_total_cents,
    v_shipping_address,
    'Pedido Direto pelo WhatsApp (Baixa Manual)'
  ) RETURNING id INTO v_order_id;

  -- 2.8 Inserir registro em order_items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    sku,
    quantity,
    unit_price_cents,
    subtotal_cents
  ) VALUES (
    v_order_id,
    v_product.id,
    v_product.name,
    v_product.sku,
    v_qty,
    v_unit_price_cents,
    v_total_cents
  );

  -- 2.9 Inserir registro em payments
  INSERT INTO public.payments (
    order_id,
    gateway,
    gateway_payment_id,
    amount_cents,
    payment_method,
    status
  ) VALUES (
    v_order_id,
    'whatsapp',
    'wa_' || v_order_number,
    v_total_cents,
    'whatsapp',
    'pending'
  );

  -- 2.10 Configuração de contato e mensagem
  v_phone := COALESCE(v_gw_settings->>'phone', '5511999998888');
  v_template := COALESCE(
    v_gw_settings->>'message_template', 
    'Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação'
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'product_name', v_product.name,
    'total_cents', v_total_cents,
    'phone', v_phone,
    'message_template', v_template
  );
END;
$$;

-- 3. Liberar execução para anônimos (visitantes) e autenticados
GRANT EXECUTE ON FUNCTION public.create_quick_whatsapp_order(UUID, INTEGER, TEXT, TEXT) TO anon, authenticated;

-- 4. Garantir permissões de INSERT para clientes autenticados no fluxo de checkout padrão
CREATE POLICY "Orders: Clientes criam seus pedidos" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Order Items: Clientes criam itens de seus pedidos" ON public.order_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Payments: Clientes criam pagamentos de seus pedidos" ON public.payments 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

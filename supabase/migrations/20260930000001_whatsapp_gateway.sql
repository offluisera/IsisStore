-- ====================================================================
-- ISIS STORE — MIGRATION: CONFIGURAÇÃO DE GATEWAY WHATSAPP
-- Versão: 20260930000001_whatsapp_gateway.sql
-- ====================================================================

-- 1. Inserir Gateway de WhatsApp em payment_gateways
INSERT INTO public.payment_gateways (name, is_active, is_default, settings)
VALUES (
  'whatsapp',
  true,
  false,
  '{
    "name": "Pedido & Pagamento via WhatsApp",
    "phone": "5511999998888",
    "message_template": "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação",
    "instructions": "O cliente será redirecionado para o WhatsApp com os dados do pedido. A confirmação de pagamento e baixa do estoque serão manuais no painel.",
    "auto_redirect": true
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = now();

-- 2. Garantir permissões de leitura pública para payment_gateways ativos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payment_gateways' AND policyname = 'Payment Gateways: Leitura de ativos'
  ) THEN
    CREATE POLICY "Payment Gateways: Leitura de ativos"
    ON public.payment_gateways
    FOR SELECT
    TO public, anon, authenticated
    USING (is_active = true OR is_admin());
  END IF;
END $$;

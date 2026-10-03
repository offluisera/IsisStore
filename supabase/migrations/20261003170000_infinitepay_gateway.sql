-- ====================================================================
-- ISIS STORE — MIGRATION: CONFIGURAÇÃO DE GATEWAY INFINITEPAY
-- Versão: 20261003170000_infinitepay_gateway.sql
-- ====================================================================

-- 1. Inserir Gateway InfinitePay em payment_gateways (se não existir)
INSERT INTO public.payment_gateways (id, name, is_active, is_default, settings)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'infinitepay',
  false,
  false,
  '{
    "name": "InfinitePay Checkout Integrado",
    "handle": "isisstore",
    "mode": "production",
    "client_id": "",
    "masked_client_secret": "",
    "encrypted_client_secret": "",
    "max_installments": 12,
    "has_credentials": false,
    "auto_redirect": true
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  settings = COALESCE(payment_gateways.settings, EXCLUDED.settings),
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

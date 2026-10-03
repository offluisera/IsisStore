-- Migration: 20261003220000_coupons_system.sql
-- Sistema completo de cupons funcionais (tabela coupons, índices, RLS e seed inicial).

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (min_subtotal_cents >= 0),
    max_discount_cents INTEGER CHECK (max_discount_cents IS NULL OR max_discount_cents > 0),
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(UPPER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Coupons: Admins can do anything" ON coupons
        FOR ALL USING (public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Coupons: Public can view active coupons" ON coupons
        FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

INSERT INTO coupons (code, description, discount_type, discount_value, min_subtotal_cents, is_active)
VALUES
  ('ISIS10', 'Cupom Oficial de Boas-Vindas 10% OFF em todo o catálogo', 'percentage', 10, 0, true),
  ('PRIMEIRACOMPRA', '15% de desconto especial na primeira compra acima de R$ 150', 'percentage', 15, 15000, true),
  ('PRESENTES20', 'R$ 20,00 de desconto fixo em compras acima de R$ 120', 'fixed', 2000, 12000, true)
ON CONFLICT (code) DO NOTHING;

-- Migration: Configurações de Ofertas do Dia (Daily Deals)
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS daily_deals_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS daily_deals_discount_percent INTEGER NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS daily_deals_product_limit INTEGER NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS daily_deals_title TEXT DEFAULT 'Ofertas do dia';

-- Migration: 20261016200000_daily_deals_mode_and_crafting_notice.sql
-- Adiciona suporte a seleção manual vs automática de Ofertas do Dia (Daily Deals)
-- e observação configurável sobre prazo de confecção e entrega na página de produtos.

ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS daily_deals_mode TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS daily_deals_product_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS crafting_delivery_notice TEXT DEFAULT 'Peças personalizadas ou sob encomenda possuem prazo de confecção de 3 a 5 dias úteis após a aprovação do pagamento, além do prazo de transporte.',
ADD COLUMN IF NOT EXISTS crafting_days_text TEXT DEFAULT '3 a 5 dias úteis';

COMMENT ON COLUMN store_settings.daily_deals_mode IS 'Modo de seleção das ofertas do dia: "auto" para sorteio determinístico ou "manual" para produtos escolhidos manualmente';
COMMENT ON COLUMN store_settings.daily_deals_product_ids IS 'Lista de IDs dos produtos selecionados manualmente para as ofertas do dia';
COMMENT ON COLUMN store_settings.crafting_delivery_notice IS 'Observação e aviso sobre prazo de confecção artesanal e transporte exibido nas páginas de produto';
COMMENT ON COLUMN store_settings.crafting_days_text IS 'Tempo médio estimado de confecção artesanal (ex: 3 a 5 dias úteis)';

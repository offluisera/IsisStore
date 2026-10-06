-- Migration: Configurações editáveis das Páginas Institucionais (Contato, Termos e Privacidade)
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS contact_page_settings JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS terms_page_settings JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS privacy_page_settings JSONB DEFAULT NULL;

COMMENT ON COLUMN store_settings.contact_page_settings IS 'Configurações de textos, canais, FAQ e campos da página de Contato';
COMMENT ON COLUMN store_settings.terms_page_settings IS 'Configurações de cláusulas, tópicos do CDC e seções dos Termos de Uso';
COMMENT ON COLUMN store_settings.privacy_page_settings IS 'Configurações de cláusulas da LGPD, direitos do titular e DPO da Política de Privacidade';

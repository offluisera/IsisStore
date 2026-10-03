-- Migration: 20261003210000_editorial_banner_settings.sql
-- Adiciona suporte a edição completa do Banner Editorial de Presentes & Cupom na Home pelo painel Admin.

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS editorial_banner_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS editorial_banner_badge text DEFAULT 'Experiência Exclusiva de Compra',
ADD COLUMN IF NOT EXISTS editorial_banner_title text DEFAULT 'A Arte de Presentear quem você mais Ama',
ADD COLUMN IF NOT EXISTS editorial_banner_description text DEFAULT 'Seja para um aniversário, data marcante ou simplesmente um gesto de carinho, a Isis Store cuida de cada detalhe: personalizamos o cartão de dedicatória e enviamos na embalagem de luxo pronta para encantar.',
ADD COLUMN IF NOT EXISTS editorial_banner_coupon_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS editorial_banner_coupon_code text DEFAULT 'ISIS10',
ADD COLUMN IF NOT EXISTS editorial_banner_coupon_text text DEFAULT '10% OFF em todo o catálogo',
ADD COLUMN IF NOT EXISTS editorial_banner_button_text text DEFAULT 'Explorar Coleção Completa',
ADD COLUMN IF NOT EXISTS editorial_banner_button_link text DEFAULT '/produtos',
ADD COLUMN IF NOT EXISTS editorial_banner_whatsapp_button_text text DEFAULT 'Personal Shopper no WhatsApp',
ADD COLUMN IF NOT EXISTS editorial_banner_image_url text DEFAULT '/images/products/colar-coracao-delicado-ouro-rosa.jpg',
ADD COLUMN IF NOT EXISTS editorial_banner_image_tag text DEFAULT 'Destaque da Coleção',
ADD COLUMN IF NOT EXISTS editorial_banner_image_title text DEFAULT 'Colar Coração Delicado',
ADD COLUMN IF NOT EXISTS editorial_banner_image_subtitle text DEFAULT 'Banho em Ouro Rosa com Zircônias';

COMMENT ON COLUMN store_settings.editorial_banner_active IS 'Controla se o banner editorial de presentes é exibido na home';
COMMENT ON COLUMN store_settings.editorial_banner_badge IS 'Tag ou badge destacado do banner';
COMMENT ON COLUMN store_settings.editorial_banner_title IS 'Título principal do banner editorial';
COMMENT ON COLUMN store_settings.editorial_banner_description IS 'Texto descritivo do banner editorial';
COMMENT ON COLUMN store_settings.editorial_banner_coupon_active IS 'Se o cupom de primeira compra está ativo e visível no banner';
COMMENT ON COLUMN store_settings.editorial_banner_coupon_code IS 'Código do cupom (ex: ISIS10)';
COMMENT ON COLUMN store_settings.editorial_banner_coupon_text IS 'Texto descritivo do benefício do cupom (ex: 10% OFF em todo o catálogo)';
COMMENT ON COLUMN store_settings.editorial_banner_button_text IS 'Texto do botão principal de ação';
COMMENT ON COLUMN store_settings.editorial_banner_button_link IS 'URL de destino do botão principal';
COMMENT ON COLUMN store_settings.editorial_banner_whatsapp_button_text IS 'Texto do botão de WhatsApp para personal shopper';
COMMENT ON COLUMN store_settings.editorial_banner_image_url IS 'URL da imagem do produto/destaque no card lateral';
COMMENT ON COLUMN store_settings.editorial_banner_image_tag IS 'Tag sobreposta na imagem (ex: Destaque da Coleção)';
COMMENT ON COLUMN store_settings.editorial_banner_image_title IS 'Título sobreposto na imagem (ex: Colar Coração Delicado)';
COMMENT ON COLUMN store_settings.editorial_banner_image_subtitle IS 'Subtítulo sobreposto na imagem (ex: Banho em Ouro Rosa com Zircônias)';

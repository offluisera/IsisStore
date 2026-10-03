-- Migration: 20261003200000_footer_cnpj_and_deals_color.sql
-- Adiciona suporte a edição do CNPJ, horários de atendimento, texto institucional do rodapé (Footer)
-- e customização de cor de fundo da faixa de Ofertas do Dia.

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS cnpj text DEFAULT '58.123.456/0001-78',
ADD COLUMN IF NOT EXISTS support_hours text DEFAULT 'Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h',
ADD COLUMN IF NOT EXISTS footer_text text DEFAULT 'Isis Store — Semijoias, Brinquedos e Presentes Finos. Envio para todo o Brasil.',
ADD COLUMN IF NOT EXISTS daily_deals_bg_color text DEFAULT '#D9480F';

-- Comentários das novas colunas
COMMENT ON COLUMN store_settings.cnpj IS 'CNPJ oficial da loja exibido no rodapé';
COMMENT ON COLUMN store_settings.support_hours IS 'Horário de atendimento ao cliente exibido no rodapé';
COMMENT ON COLUMN store_settings.footer_text IS 'Texto institucional ou endereço exibido no rodapé';
COMMENT ON COLUMN store_settings.daily_deals_bg_color IS 'Cor de fundo hexadecimal da faixa de Ofertas do Dia';

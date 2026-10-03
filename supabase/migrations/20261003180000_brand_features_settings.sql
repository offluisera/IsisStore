-- Migration: Adicionar campos dos Diferenciais de Excelência (Brand Features) em store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS brand_features_badge TEXT DEFAULT 'Padrão de Excelência',
ADD COLUMN IF NOT EXISTS brand_features_title TEXT DEFAULT 'Por que escolher a Isis Store?',
ADD COLUMN IF NOT EXISTS brand_features_subtitle TEXT DEFAULT 'Cada semijoia e presente especial é produzido com carinho, durabilidade e acabamento impecável.',
ADD COLUMN IF NOT EXISTS brand_features_cards JSONB DEFAULT '[
  {
    "id": "1",
    "title": "Banhos Nobres 18k & Prata",
    "description": "Camadas generosas de ouro 18k e prata 925 com verniz de proteção suíço para brilho intenso.",
    "badge_text": "Alta Durabilidade",
    "badge_variant": "success",
    "icon": "gem"
  },
  {
    "id": "2",
    "title": "100% Hipoalergênicas",
    "description": "Livre de níquel e metais pesados. Total conforto e segurança, inclusive para peles sensíveis.",
    "badge_text": "Níquel Free",
    "badge_variant": "default",
    "icon": "shield"
  },
  {
    "id": "3",
    "title": "Embalagem de Presente",
    "description": "Caixa rígida exclusiva com laço de cetim e nosso aroma autoral. Experiência de unboxing mágica.",
    "badge_text": "Pronto p/ Presentear",
    "badge_variant": "warning",
    "icon": "gift"
  },
  {
    "id": "4",
    "title": "Garantia de 1 Ano",
    "description": "Todas as semijoias acompanham certificado de garantia de 1 ano no banho e suporte humanizado.",
    "badge_text": "Certificado Oficial",
    "badge_variant": "discount",
    "icon": "award"
  }
]'::jsonb;

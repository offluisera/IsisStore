-- Migration: Home Slides (Slides do Carrossel Principal da Loja - Estilo Magazine Luiza)
CREATE TABLE IF NOT EXISTS public.home_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_highlight TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  badge_text TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  slide_type TEXT NOT NULL DEFAULT 'editorial', -- 'editorial' | 'full_banner'
  primary_button_text TEXT DEFAULT '',
  primary_button_url TEXT DEFAULT '',
  secondary_button_text TEXT DEFAULT '',
  secondary_button_url TEXT DEFAULT '',
  bg_theme TEXT NOT NULL DEFAULT 'default', -- 'default' | 'dark_rose' | 'soft_pink' | 'gold_luxury' | 'deep_wine'
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'home_slides' AND policyname = 'Home Slides: Leitura pública'
  ) THEN
    CREATE POLICY "Home Slides: Leitura pública" ON public.home_slides
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'home_slides' AND policyname = 'Home Slides: Admins gerenciam'
  ) THEN
    CREATE POLICY "Home Slides: Admins gerenciam" ON public.home_slides
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Inserir os slides iniciais oficiais
INSERT INTO public.home_slides (
  id, title, title_highlight, subtitle, badge_text, image_url, slide_type,
  primary_button_text, primary_button_url, secondary_button_text, secondary_button_url,
  bg_theme, is_active, sort_order
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Produtos que fazem',
  'você sorrir! ♡',
  'Beleza, estilo, conforto e muito afeto para o seu dia a dia. Conheça nossa seleção de mimos pensados com amor em cada detalhe.',
  'Coleção Especial',
  '/images/banner-rosto.jpeg',
  'editorial',
  'Ver Coleção',
  '#produtos-destaque',
  'Nossa História',
  '/sobre',
  'default',
  true,
  1
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Semijoias Banhadas a Ouro',
  'Brilho e Elegância ✨',
  'Colares, brincos e pulseiras delicadas com acabamento de alta joalheria, antialérgicos e com garantia.',
  'Lançamento Exclusivo',
  '/images/products/colar-coracao-delicado-ouro-rosa.jpg',
  'editorial',
  'Explorar Semijoias',
  '#produtos-destaque',
  'Presentes',
  '/produtos',
  'gold_luxury',
  true,
  2
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Mimos & Presentes Especiais',
  'com Afeto Único ♡',
  'Acessórios e mimos pensados para surpreender quem você ama. Embalagens presenteáveis com cartão personalizado.',
  'Frete Grátis acima de R$ 199',
  '/images/products/ursinho-de-pelucia-carinho.jpg',
  'editorial',
  'Conhecer Mimos',
  '#produtos-destaque',
  'Ver Catálogo',
  '/produtos',
  'dark_rose',
  true,
  3
)
ON CONFLICT (id) DO NOTHING;

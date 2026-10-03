-- Migration: Store Settings (Configurações Gerais da Loja)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'Isis Store',
  store_tagline TEXT DEFAULT 'Semijoias & Presentes Especiais',
  store_description TEXT DEFAULT 'Loja online oficial Isis Store. Moda, acessórios e semijoias com acabamento impecável.',
  logo_url TEXT DEFAULT '/images/logo/logo.jpeg',
  favicon_url TEXT DEFAULT '/favicon.ico',
  meta_title TEXT DEFAULT 'Isis Store — E-commerce Feminino & Presenteável',
  meta_description TEXT DEFAULT 'Loja online oficial Isis Store. Moda, acessórios e presentes especiais com carinho, elegância e acabamento impecável.',
  seo_keywords TEXT DEFAULT 'semijoias, colares, brincos, pulseiras, anéis, ouro 18k, prata 925, presentes femininos, moda',
  og_image_url TEXT DEFAULT '/images/logo/logo.jpeg',
  canonical_url TEXT DEFAULT 'https://isisstore.com.br',
  support_email TEXT DEFAULT 'contato@isisstore.com.br',
  support_phone TEXT DEFAULT '5517992495308',
  instagram_handle TEXT DEFAULT '@isisstoreoficial',
  announcement_banner_text TEXT DEFAULT 'Frete Grátis para todo o Brasil acima de R$ 199,00',
  announcement_banner_active BOOLEAN NOT NULL DEFAULT true,
  free_shipping_threshold_cents INTEGER NOT NULL DEFAULT 19900,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT DEFAULT 'Estamos preparando novidades incríveis para você. Voltamos em breve!',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir registro inicial
INSERT INTO public.store_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Store Settings: Leitura pública'
  ) THEN
    CREATE POLICY "Store Settings: Leitura pública" ON public.store_settings
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Store Settings: Admins atualizam'
  ) THEN
    CREATE POLICY "Store Settings: Admins atualizam" ON public.store_settings
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

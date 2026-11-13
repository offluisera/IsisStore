-- Migration: 20261104200000_qr_homenagens.sql
-- Módulo Completo de QR Codes Personalizados para Presentes e Estamparia (Sublimação, Canecas, Copos, Etiquetas)

CREATE TABLE IF NOT EXISTS public.qr_homenagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash_acesso TEXT NOT NULL UNIQUE,
    chave_seguranca TEXT NOT NULL,
    identificacao_pedido TEXT NOT NULL,
    titulo_homenagem TEXT NOT NULL DEFAULT 'Para Sempre em Nossos Corações',
    nome_homenageado TEXT NOT NULL,
    mensagem_texto TEXT NOT NULL,
    foto_principal TEXT,
    galeria_fotos JSONB NOT NULL DEFAULT '[]'::jsonb,
    arquivo_video TEXT,
    arquivo_audio TEXT,
    estilo_icone_qr TEXT NOT NULL DEFAULT 'coracao' CHECK (estilo_icone_qr IN ('coracao', 'estrela', 'logo', 'nenhum')),
    cor_qr TEXT NOT NULL DEFAULT '#000000',
    visualizacoes INTEGER NOT NULL DEFAULT 0 CHECK (visualizacoes >= 0),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_qr_homenagens_hash_acesso ON public.qr_homenagens(hash_acesso);
CREATE INDEX IF NOT EXISTS idx_qr_homenagens_criado_em ON public.qr_homenagens(criado_em DESC);

ALTER TABLE public.qr_homenagens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "QR Homenagens: Admins gerenciam tudo" ON public.qr_homenagens
        FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "QR Homenagens: Leitura publica validada por aplicacao" ON public.qr_homenagens
        FOR SELECT TO anon, authenticated
        USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Função segura (SECURITY DEFINER) para incrementar visualizações apenas quando hash e chave_seguranca conferem
CREATE OR REPLACE FUNCTION public.increment_qr_homenagem_views(
    p_hash_acesso TEXT,
    p_chave_seguranca TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_views INTEGER;
BEGIN
    UPDATE public.qr_homenagens
    SET visualizacoes = visualizacoes + 1,
        atualizado_em = timezone('utc'::text, now())
    WHERE hash_acesso = p_hash_acesso
      AND chave_seguranca = p_chave_seguranca
    RETURNING visualizacoes INTO v_new_views;

    RETURN COALESCE(v_new_views, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_qr_homenagem_views(TEXT, TEXT) TO anon, authenticated;

-- Bucket de Storage para mídias das homenagens (fotos, vídeos .mp4 e áudios .mp3)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homenagens',
    'homenagens',
    true,
    52428800, -- 50MB para suportar vídeos .mp4 e áudios .mp3
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/x-m4a'
    ]
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Homenagens Storage: Leitura Publica" ON storage.objects
        FOR SELECT USING (bucket_id = 'homenagens');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Homenagens Storage: Upload Admin" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'homenagens' AND public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Homenagens Storage: Delete Admin" ON storage.objects
        FOR DELETE USING (bucket_id = 'homenagens' AND public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


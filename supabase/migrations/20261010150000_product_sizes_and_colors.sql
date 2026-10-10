-- Migration: Suporte a tamanhos e cores em produtos
-- Data: 2026-10-10

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_sizes BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_colors BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.products.has_sizes IS 'Indica se o produto possui opções de tamanhos';
COMMENT ON COLUMN public.products.sizes IS 'Lista de tamanhos disponíveis (ex: P, M, G, GG, 36, 38)';
COMMENT ON COLUMN public.products.has_colors IS 'Indica se o produto possui opções de cores';
COMMENT ON COLUMN public.products.colors IS 'Lista de cores disponíveis (ex: Rosa, Dourado, Prata, Preto)';

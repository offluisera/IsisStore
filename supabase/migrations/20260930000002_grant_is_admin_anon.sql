-- Migration: Permitir que usuários anônimos executem is_admin() para avaliação de RLS pública
-- Sem essa permissão, consultas públicas a tabelas protegidas por RLS que usam is_admin() falham com erro 42501 (permission denied).

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

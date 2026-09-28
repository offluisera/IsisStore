-- =========================================================================
-- ISIS STORE — FASE 13: HARDENING DE SEGURANÇA (AUDITORIA E BLINDAGEM)
-- =========================================================================

-- 1. Revogar permissão pública de execução na função de trigger interna
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 2. Revogar execução anônima de is_admin() mantendo apenas para authenticated (RLS)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Comentário explicativo de auditoria
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger interna acionada exclusivamente pelo Supabase Auth. Execução direta bloqueada.';
COMMENT ON FUNCTION public.is_admin() IS 'Função interna de verificação RLS para usuários autenticados.';

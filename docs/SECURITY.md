# SEGURANÇA & AUDITORIA — ISIS STORE

> **Documento:** `docs/SECURITY.md`  
> **Status:** Ativo e Auditado  
> **Última Atualização:** 2026-09-27  

Este documento detalha os princípios, políticas e mecanismos de segurança implementados na Isis Store para garantir integridade financeira, privacidade de dados e proteção contra ameaças web.

---

## 1. Gestão de Segredos e Chaves de API

- **Zero Secrets no Client-Side:** Todas as credenciais de alta permissão (`SUPABASE_SERVICE_ROLE_KEY`, `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`) são de uso estritamente restrito a Server Components, Server Actions e rotas de API (`/api/webhooks/*`).
- **Sanitização de Repositório:** O arquivo `.gitignore` bloqueia explicitamente `.env*.local`, mantendo apenas `.env.example` versionado com valores de exemplo sem segredos reais.
- **Assinatura de Webhooks:** Requisições provenientes de gateways de pagamento são validadas criptograficamente utilizando HMAC SHA-256 com chave secreta dedicada.

---

## 2. Hardening Web & Cabeçalhos HTTP

Configurados em `next.config.ts`:

| Cabeçalho | Valor | Propósito |
| :--- | :--- | :--- |
| `X-Frame-Options` | `DENY` | Prevenção contra Clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevenção contra ataques de interpretação de tipo MIME |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controle rigoroso de vazamento de URLs no cabeçalho Referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Bloqueio de sensores e hardware desnecessários |

---

## 3. Mitigação contra Open Redirect

Implementada em `src/app/auth/callback/route.ts` e `src/lib/supabase/middleware.ts`:
- O parâmetro `next` de redirecionamento pós-autenticação é submetido a sanitização rigorosa.
- Bloqueio explícito de protocolos relativos (`//evil.com`), barras invertidas (`/\evil.com`) e domínios absolutos externos.
- Caso o destino não seja um caminho relativo seguro iniciando com barra simples (`/`), o usuário é redirecionado com segurança para `/` ou `/conta`.

---

## 4. Banco de Dados & Row Level Security (RLS)

- **100% das Tabelas Públicas com RLS:** Todas as 13 tabelas da base possuem `rowsecurity = true`.
- **Isolamento de Dados do Cliente:**
  - `profiles`: Usuários comuns só podem ler e atualizar seu próprio registro (`id = (select auth.uid())`).
  - `addresses`: Clientes apenas leem e editam seus próprios endereços vinculados.
  - `orders`, `order_items`, `payments`: Clientes só possuem visibilidade dos pedidos onde `customer_id = (select auth.uid())`.
  - `carts`, `cart_items`: Isolamento total por sessão/perfil de usuário.
- **Hardening de Funções SECURITY DEFINER:**
  - `handle_new_user()` e `is_admin()` tiveram privilégios de execução pública e anônima revogados via migration `supabase/migrations/20260927000001_security_hardening.sql`.

---

## 5. Integridade Financeira & Antifraude

- **Recálculo Compulsório Server-Side:** O frontend nunca envia preços ou totais financeiros para gravação direta. No checkout, o backend consulta a tabela `products` diretamente, aplicando regras oficiais de desconto e frete.
- **Snapshot Imutável:** Ao fechar o pedido, os preços unitários são gravados de forma imutável em `order_items` para preservar histórico fiscal e legal contra alterações posteriores no catálogo.
- **Idempotência Financeira:** Webhooks duplicados são registrados com chave única na tabela `payment_events`, impedindo processamento duplo de créditos ou baixas repetidas de estoque.
- **Reversão de Estoque:** Pedidos cancelados, rejeitados ou estornados disparam a devolução automática das quantidades ao estoque.

---

## 6. Controle de Acesso Baseado em Funções (RBAC)

- Usuários possuem papéis `customer` ou `admin`.
- Todas as Server Actions administrativas em `src/features/admin/actions.ts` verificam se o perfil autenticado possui `role === 'admin'`.
- Proteção contra auto-rebaixamento: o sistema impede que um administrador remova seu próprio privilégio ou desative o último administrador do sistema.
- Todas as mutações administrativas gravam trilha de auditoria detalhada em `admin_audit_logs`.

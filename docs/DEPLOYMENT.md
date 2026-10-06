# GUIA DE IMPLANTAÇÃO EM PRODUÇÃO & GO-LIVE — ISIS STORE

> **Documento:** `DEPLOYMENT.md`  
> **Fase:** 18 — Produção & Go-Live  
> **Projeto:** Isis Store — E-commerce de Semijoias e Acessórios  
> **Status:** Homologado e Pronto para Produção  

---

## 1. Visão Geral da Infraestrutura de Produção

A Isis Store foi arquitetada para operação em ambiente de alta disponibilidade, segurança e performance:

```text
               [ Usuários / Compradores ]
                           │ (HTTPS / TLS 1.3)
                           ▼
              [ CDN / Edge / Vercel / Cloudflare ]
                           │ (Next.js App Router 16 + Turbopack)
                           ▼
          ┌───────────────────────────────────┐
          │      Aplicação Isis Store         │
          │   (Server Actions + Next Server)  │
          └─────┬───────────────────────┬─────┘
                │                       │
      (SSL Pooling / RLS)         (REST / Webhooks HMAC)
                ▼                       ▼
     [ Supabase Cloud (Prod) ]    [ Gateways de Pagamento ]
     - PostgreSQL 15              - Mercado Pago (Produção)
     - Row Level Security         - InfinitePay (Live)
     - Supabase Auth              - WhatsApp Checkout
     - Supabase Storage (WebP)
```

---

## 2. Checklist Pré-Deploy (Hardening & Banco)

Antes de realizar o primeiro deploy público em produção:

- [x] **Migrations do PostgreSQL Aplicadas:** Todas as migrações em `supabase/migrations/` aplicadas no projeto Supabase de produção.
- [x] **Row Level Security (RLS) Ativo:** 100% das 13 tabelas com RLS habilitado e políticas estritas isolando dados de clientes.
- [x] **Funções `SECURITY DEFINER` Protegidas:** Revogação de permissões públicas para RPCs administrativas e controle de privilégios RBAC.
- [x] **Bucket de Imagens Criado:** Bucket `products` configurado com visibilidade pública para leitura de assets e upload restrito a administradores autenticados.
- [x] **Usuário Administrador Criado:** Conta com privilégio `role: admin` na tabela `profiles`.
- [x] **Integridade do Build:** Build Turbopack estático e dinâmico validado sem erros (`npm run build`).
- [x] **Typecheck e Lint Aprovados:** `tsc --noEmit` e `eslint` executados com 0 erros.
- [x] **Suites de Testes 100% Aprovadas:** Todos os fluxos críticos e regras comerciais validados via `npm test`.

---

## 3. Matriz de Variáveis de Ambiente de Produção

Configure as seguintes variáveis no painel de hospedagem (Vercel, Railway, Coolify ou VPS):

| Variável | Escopo | Descrição | Exemplo de Produção |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Servidor | Ambiente de execução | `production` |
| `NEXT_PUBLIC_SITE_URL` | Público | Domínio canônico para SEO e Sitemap | `https://isisstore.com.br` |
| `NEXT_PUBLIC_APP_URL` | Público | URL base da aplicação para redirecionamentos | `https://isisstore.com.br` |
| `NEXT_PUBLIC_SUPABASE_URL` | Público | Endpoint da API REST do Supabase | `https://[project-id].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Público | Chave anônima para requisições com RLS | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreto (Servidor)** | Chave master de infraestrutura (NUNCA expor no client) | `eyJhbGciOi...` |
| `MERCADOPAGO_ACCESS_TOKEN` | **Secreto (Servidor)** | Token de produção do Mercado Pago (`APP_USR-...`) | `APP_USR-789012...` |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Público | Chave pública do Mercado Pago para SDK/Checkout | `APP_USR-xxxx...` |
| `MERCADOPAGO_WEBHOOK_SECRET` | **Secreto (Servidor)** | Segredo HMAC SHA-256 para autenticar notificações | `9e4f2...` |
| `ADMIN_MASTER_PASSWORD` | **Secreto (Servidor)** | Senha mestra de segurança para alteração de gateways no admin | `SenhaForteAdmin2026!@#` |

> [!CAUTION]
> A chave `SUPABASE_SERVICE_ROLE_KEY` possui permissão irrestrita de bypass do RLS. Ela jamais deve possuir o prefixo `NEXT_PUBLIC_` ou ser referenciada em componentes client-side.

---

## 4. Configuração dos Gateways de Pagamento em Produção

### 4.1. Mercado Pago
1. Acesse o [Portal de Desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers).
2. Vá em **Suas Aplicações** -> Selecione a aplicação da Isis Store -> **Credenciais de Produção**.
3. Copie o `Access Token` (iniciando em `APP_USR-`) e a `Public Key`.
4. Configure a URL de Webhooks de produção:
   - **URL:** `https://isisstore.com.br/api/webhooks/mercadopago`
   - **Eventos escutados:** `payment` (`payment.created`, `payment.updated`).
   - Obtenha a chave secreta de assinatura HMAC e preencha em `MERCADOPAGO_WEBHOOK_SECRET`.
5. No painel administrativo `/admin/gateways`:
   - Alterne o modo do Mercado Pago para **Produção**.
   - Defina o status como **Ativo**.

### 4.2. InfinitePay (Opcional)
1. Caso utilize a InfinitePay, acesse o painel de desenvolvedor InfinitePay e obtenha a Handle, Client ID e Client Secret de produção.
2. No painel `/admin/gateways`, insira a Senha Mestra (`ADMIN_MASTER_PASSWORD`), informe as credenciais de produção e ative o gateway.

### 4.3. WhatsApp Checkout
1. No painel `/admin/gateways`, configure o número comercial com DDI e DDD (ex: `5511999998888`).
2. Ajuste o template de mensagem automática com variáveis `{produto}`, `{pedido}` e `{valor}`.

---

## 5. Domínio, DNS & Certificado SSL

Para apontar o domínio próprio (ex: `isisstore.com.br`):

1. **Entradas DNS Recomendadas:**
   - **Tipo A:** Apontar para o IP do servidor de produção (ex: `76.76.21.21` na Vercel).
   - **Tipo CNAME:** `www` apontando para `cname.vercel-dns.com` ou equivalente do provedor.
2. **HTTPS / TLS:**
   - Os certificados SSL Let's Encrypt / Cloudflare são provisionados automaticamente.
   - Forçar HTTPS obrigatório em todas as conexões (HSTS ativo).

---

## 6. SEO, Robots & Sitemap

A aplicação possui geração automatizada e otimizada de SEO em produção:

- **Robots (`/robots.txt`):**
  - Permite indexação de vitrines, produtos e categorias (`/`, `/produtos`, `/categorias`).
  - Bloqueia estritamente áreas privadas e rotas autenticadas (`/admin`, `/conta`, `/checkout`, `/api`, `/auth`).
- **Sitemap Dinâmico (`/sitemap.xml`):**
  - Mapeia automaticamente todas as URLs públicas, incluindo slugs dinâmicos de categorias ativas e produtos publicados.
  - Atualizado dinamicamente em conformidade com o catálogo.

---

## 7. Monitoramento & Health Check

Para aferir a saúde do sistema sem expor dados confidenciais:

- **Endpoint de Uptime:** `GET https://isisstore.com.br/api/health`
- **Resposta Esperada (HTTP 200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-06T20:15:00.000Z",
  "uptime_seconds": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "connected",
      "latency_ms": 18
    }
  },
  "total_response_ms": 22
}
```
- Recomenda-se configurar este endpoint em serviços como **UptimeRobot**, **BetterStack** ou **Pingdom** com alerta para status diferente de `200`.

---

## 8. Política de Backup e Recuperação (Disaster Recovery)

1. **Backups Automáticos do Banco:**
   - O Supabase realiza backups diários automáticos com Point-in-Time Recovery (PITR) em planos Pro/Enterprise.
   - Recomenda-se export diário das tabelas críticas (`orders`, `order_items`, `payment_events`, `products`, `profiles`) via pg_dump ou cron job automatizado.
2. **Storage de Imagens:**
   - As imagens originais convertidas em `.webp` permanecem no Supabase Storage com redundância de storage.
3. **Plano de Rollback:**
   - No caso de indisponibilidade após deploy de versão, execute rollback instantâneo de commit no painel de hosting (Instant Rollback Vercel/Git).

---

## 9. Runbook de Go-Live (Checklist de Lançamento)

Execute os seguintes passos no momento exato da abertura da loja ao público:

1. [ ] Subir as variáveis de produção no servidor e disparar deploy de produção.
2. [ ] Validar status `healthy` em `/api/health`.
3. [ ] Acessar a home da loja no domínio oficial e certificar carregamento de vitrines e imagens.
4. [ ] Realizar um pedido de compra teste de ponta a ponta com Pix de R$ 1,00 para validação do gateway real.
5. [ ] Confirmar o recebimento do Webhook e transição para status `paid`.
6. [ ] Acessar o painel administrativo em `/admin/pedidos` e certificar visualização do pedido.
7. [ ] Estornar/reembolsar o pedido teste no painel do gateway e certificar reversão de status.
8. [ ] Loja 100% pronta para vendas e atendimento ao público!

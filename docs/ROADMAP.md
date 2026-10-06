# ROADMAP OFICIAL — ISIS STORE

> **Documento:** `docs/ROADMAP.md`  
> **Última atualização:** 2026-09-28  
> **Status Geral:** Em andamento — Fase 17 Concluída

---

## Linha de Desenvolvimento e Progresso

| Fase | Título | Status | Gate / Critério |
| :--- | :--- | :--- | :--- |
| **00** | **Reconhecimento** | **CONCLUÍDA** | Auditoria e diagnóstico concluídos ([docs/PROJECT-AUDIT.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/PROJECT-AUDIT.md)) |
| **01** | **Fundação** | **CONCLUÍDA** | Next.js + TS + Tailwind + Tokens + Build OK |
| **02** | **Design System** | **CONCLUÍDA** | Componentes core + checklist visual e acessibilidade OK |
| **03** | **Supabase + Banco + RLS** | **CONCLUÍDA** | Migrations + RLS + Storage + Seeds OK |
| **04** | **Autenticação** | **CONCLUÍDA** | Auth + Roles + Proteção de Rotas OK |
| **05** | **Catálogo** | **CONCLUÍDA** | Produtos + Categorias + Busca + Filtros + WebP OK |
| **06** | **Carrinho** | **CONCLUÍDA** | Adicionar/remover/quantidades + persistência OK |
| **07** | **Área do Cliente** | **CONCLUÍDA** | Dashboard + Pedidos + Endereços + RLS isolado OK |
| **08** | **Checkout** | **CONCLUÍDA** | Snapshot de itens + cálculo server-side + concorrência estoque OK |
| **09** | **Mercado Pago** | **CONCLUÍDA** | Gateway adapter + Webhooks server-side + Idempotência OK |
| **10** | **Painel Admin** | **CONCLUÍDA** | Gestão produtos/pedidos/estoque + auditoria OK |
| **11** | **Motion / UX** | **CONCLUÍDA** | Microinterações + feedback + reduced-motion OK |
| **12** | **Responsividade** | **CONCLUÍDA** | 320px a 1920px sem overflow crítico OK |
| **13** | **Segurança** | **CONCLUÍDA** | Zero secrets expostos + RLS auditado + sanitização OK |
| **14** | **Performance** | **CONCLUÍDA** | Core Web Vitals + bundle + queries otimizadas OK |
| **15** | **Testes** | **CONCLUÍDA** | Unitários + Integração + E2E fluxos críticos OK |
| **16** | **Design System Checklist** | **CONCLUÍDA** | Revisão formal designsystemchecklist.com OK |
| **17** | **QA Final** | **CONCLUÍDA** | Fluxo ponta a ponta sem falhas OK |
| **18** | **Produção** | **A INICIAR** | Deploy seguro + monitoramento + backups OK |

---

## Histórico de Fases

### Fase 00 — Reconhecimento
* **Data de Conclusão:** 2026-09-26
* **Status:** Concluída
* **Entregáveis:**
  * [prompts/Iniciando.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/prompts/Iniciando.md)
  * [docs/PROJECT-AUDIT.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/PROJECT-AUDIT.md)
  * [docs/ROADMAP.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/ROADMAP.md)
* **Gate 00:**
  * Build: N/A (Greenfield)
  * Typecheck: N/A
  * Lint: N/A
  * Auditoria: OK
  * Documentação: OK

### Fase 01 — Fundação
* **Data de Conclusão:** 2026-09-26
* **Status:** Concluída
* **Entregáveis:**
  * Base técnica Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
  * Dependências de UI (`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`)
  * Design tokens oficiais em [src/styles/tokens.css](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/styles/tokens.css)
  * Tipografia oficial (Inter e Playfair Display via `next/font`)
  * Estrutura de pastas arquitetural em `src/`
  * Variáveis de ambiente de exemplo em [.env.example](file:///c:/xampp/htdocs/AluraProjects/IsisStore/.env.example)
  * Documento de arquitetura em [docs/ARCHITECTURE.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/ARCHITECTURE.md)
  * [README.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/README.md) atualizado
* **Gate 01:**
  * Build (`next build`): OK
  * Typecheck (`tsc --noEmit`): OK
  * Lint (`eslint`): OK
  * Fontes & Tokens: OK
  * Responsividade inicial: OK

### Fase 02 — Design System
* **Data de Conclusão:** 2026-09-26
* **Status:** Concluída
* **Entregáveis:**
  * Especificação detalhada em [docs/DESIGN-SYSTEM.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM.md)
  * Checklist verificado em [docs/DESIGN-SYSTEM-CHECKLIST.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM-CHECKLIST.md)
  * Componentes core de UI em `src/components/ui/` (`Button`, `Badge`, `Input`, `Checkbox`, `Card`, `Dialog`, `Skeleton`, `Toast`)
  * Componentes de domínio e layout em `src/components/commerce/` e `src/components/layout/` (`ProductCard`, `CartDrawer`, `CategoryPill`, `Header`, `BottomNav`)
  * Extração e incorporação dos assets oficiais (`public/images/logo/logo.jpeg` e `public/images/banner-rosto.jpeg`)
  * Vitrine interativa de componentes na Home
* **Gate 02:**
  * Build (`next build` Turbopack): OK
  * Typecheck (`tsc --noEmit`): OK
  * Lint (`eslint`): OK
  * Fidelidade visual às 6 imagens de referência: OK
  * Acessibilidade e estados: OK

### Fase 03 — Supabase + Banco + RLS
* **Data de Conclusão:** 2026-09-26
* **Status:** Concluída
* **Entregáveis:**
  * Documentação detalhada em [docs/DATABASE.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DATABASE.md)
  * Migration versionada em [supabase/migrations/20260927000000_initial_schema.sql](file:///c:/xampp/htdocs/AluraProjects/IsisStore/supabase/migrations/20260927000000_initial_schema.sql)
  * 11 tabelas de domínio criadas e validadas no projeto Supabase `wjhmukemyvimgxapscao` (sa-east-1)
  * Row Level Security (RLS) habilitado e verificado em 100% das tabelas públicas
  * Bucket de Storage `products` criado com leitura pública e escrita restrita a admins
  * Tabela de idempotência `payment_events` e modelo de snapshot de pedidos `order_items`
  * Seeds oficiais aplicadas (5 categorias da marca e produtos realistas)
  * Tipos TypeScript gerados em [src/types/database.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/types/database.ts)
  * Clientes Supabase em [src/lib/supabase/client.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/lib/supabase/client.ts), [src/lib/supabase/server.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/lib/supabase/server.ts) e [src/lib/supabase/admin.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/lib/supabase/admin.ts)
* **Gate 03:**
  * Build (`next build` Turbopack): OK
  * Typecheck (`tsc --noEmit`): OK
  * Lint (`eslint`): OK
  * RLS 100% ativo: OK
  * Migrations aplicadas no banco: OK

### Fase 04 — Autenticação
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Schemas de validação Zod em [src/schemas/auth.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/schemas/auth.ts) (login, registro, recuperação e redefinição de senha com feedback em PT-BR)
  * Server Actions seguras em [src/features/auth/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/auth/actions.ts)
  * Telas de autenticação sob layout de marca [src/app/(auth)/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/(auth)/layout.tsx):
    * Login: [src/app/(auth)/login/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/(auth)/login/page.tsx)
    * Cadastro: [src/app/(auth)/cadastro/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/(auth)/cadastro/page.tsx)
    * Recuperação de senha: [src/app/(auth)/recuperar-senha/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/(auth)/recuperar-senha/page.tsx)
    * Redefinição de senha: [src/app/(auth)/redefinir-senha/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/(auth)/redefinir-senha/page.tsx)
  * Endpoint PKCE Callback: [src/app/auth/callback/route.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/auth/callback/route.ts)
  * Endpoint de Logout: [src/app/auth/signout/route.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/auth/signout/route.ts)
  * Middleware de sessão e proteção de rotas: [src/middleware.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/middleware.ts) e [src/lib/supabase/middleware.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/lib/supabase/middleware.ts)
  * Área do Cliente protegida: [src/app/conta/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/page.tsx)
  * Painel Admin com verificação server-side de role `admin`: [src/app/admin/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/layout.tsx) e [src/app/admin/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/page.tsx)
* **Gate 04:**
  * Build (`next build` Turbopack): OK
  * Typecheck (`tsc --noEmit`): OK
  * Lint (`eslint`): OK
  * Usuário comum não acessa área administrativa (`/admin` redireciona para `/conta?error=unauthorized_admin`): OK
  * Rotas `/conta/*` e `/admin/*` protegidas contra acesso anônimo: OK

### Fase 05 — Catálogo
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Serviço de catálogo em [src/services/catalog.service.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/services/catalog.service.ts) com suporte a busca, filtros por categoria, ordenação e paginação.
  * Galeria de fotos do produto em [src/components/commerce/product-gallery.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-gallery.tsx) com miniaturas e zoom suave.
  * Ações do produto em [src/components/commerce/product-actions.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-actions.tsx) com controle de estoque, cálculo simulado de frete (PAC/Sedex) e adição ao carrinho.
  * Filtros interativos em [src/components/commerce/catalog-filters.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/catalog-filters.tsx) e paginação em [src/components/commerce/catalog-pagination.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/catalog-pagination.tsx).
  * Página do catálogo [src/app/produtos/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/produtos/page.tsx) com metadados dinâmicos e empty state refinado.
  * Página do produto [src/app/produtos/[slug]/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/produtos/%5Bslug%5D/page.tsx) com especificações, parcelamento e recomendações relacionadas.
  * Página de categorias [src/app/categorias/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/categorias/page.tsx) com contadores de produtos por departamento.
  * Painel Admin de produtos em [src/app/admin/produtos/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/produtos/page.tsx) e cadastro em [src/app/admin/produtos/novo/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/produtos/novo/page.tsx).
  * Server Action [src/features/admin/product-actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/admin/product-actions.ts) e schema Zod [src/schemas/product.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/schemas/product.ts).
  * Imagens reais e dedicadas em alta definição geradas e armazenadas em `public/images/products/`.
* **Gate 05:**
  * Build (`next build` Turbopack): OK
  * Typecheck (`tsc --noEmit`): OK
  * Lint (`eslint`): OK
  * Produto criado via admin/banco renderizado imediatamente no catálogo e storefront: OK

### Fase 06 — Carrinho
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Tipos de domínio em [src/features/cart/types.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/cart/types.ts) (`CartItem`, `CartContextType`).
  * Contexto e Hook global [src/features/cart/context/cart-context.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/cart/context/cart-context.tsx):
    * Persistência em `localStorage` sob chave `isis_store_cart_v1`.
    * Sincronização automática com tabelas `carts` e `cart_items` do Supabase para usuários autenticados.
    * Event listener global para desacoplamento de adição rápida (`cart:add-item`).
    * Métodos atômicos: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `openCart`, `closeCart`.
  * Gaveta deslizante [src/components/commerce/cart-drawer.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/cart-drawer.tsx) conectada ao contexto, com cálculo em tempo real, barra de progresso para frete grátis (meta R$ 199,00) e atalho para checkout.
  * Página completa do carrinho em [src/app/carrinho/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/carrinho/page.tsx):
    * Tabela de produtos com thumbnail, controle de quantidade e remoção.
    * Resumo financeiro estrito em centavos (`price_cents`, `subtotal_cents`).
    * Suporte a cupom de desconto (ex: `ISIS10` concedendo 10% OFF).
    * Indicador de frete grátis inteligente.
    * Links de continuidade de compras e botão de finalização com link direto para `/checkout`.
  * Integração no RootLayout [src/app/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/layout.tsx), Header [src/components/layout/header.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/layout/header.tsx) e BottomNav [src/components/layout/bottom-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/layout/bottom-nav.tsx) com atualização imediata do badge numérico.
  * Conexão dos botões dos cards de produtos [src/components/commerce/product-card.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-card.tsx) e da página de detalhes [src/components/commerce/product-actions.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-actions.tsx).
  * Suite de testes unitários de regras de negócio em [src/features/cart/__tests__/cart-rules.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/cart/__tests__/cart-rules.test.ts).
* **Gate 06:**
  * Build (`next build` Turbopack): OK (todas as 17 rotas estáticas/dinâmicas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Teste múltiplos produtos e reload: OK (persistência via `localStorage` e recarga validada)
  * Cálculos financeiros: 100% em centavos inteiros com regra de arredondamento precisa.

### Fase 07 — Área do Cliente
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Schemas Zod em [src/schemas/account.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/schemas/account.ts) para validação estrita de dados de perfil (`profileUpdateSchema`) e endereços (`addressSchema`).
  * Server Actions com proteção e isolamento por `auth.uid()` em [src/features/account/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/account/actions.ts):
    * `updateProfileAction`: atualização de nome e telefone/whatsapp.
    * `createAddressAction`: cadastro de endereço com atribuição de padrão automático no primeiro item.
    * `deleteAddressAction`: exclusão de endereço restrita ao proprietário.
    * `setDefaultAddressAction`: alternância atômica do endereço principal de entrega.
  * Layout unificado da conta em [src/app/conta/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/layout.tsx) com identificação do cliente, badges de role e barra de navegação responsiva em abas [src/components/account/account-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/account/account-nav.tsx).
  * Dashboard de visão geral em [src/app/conta/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/page.tsx) com métricas de compras, último pedido e atalhos rápidos.
  * Módulo de pedidos em [src/app/conta/pedidos/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/pedidos/page.tsx) e detalhes em [src/app/conta/pedidos/[id]/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/pedidos/%5Bid%5D/page.tsx) com timeline de rastreamento visual e snapshot imutável de itens.
  * Módulo de endereços em [src/app/conta/enderecos/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/enderecos/page.tsx) com formulário interativo [src/components/account/address-form.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/account/address-form.tsx) integrado com busca automática por CEP (ViaCEP) e cards em [src/components/account/address-card.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/account/address-card.tsx).
  * Gestão de dados pessoais e segurança da conta em [src/app/conta/dados/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/dados/page.tsx) com formulário [src/components/account/profile-form.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/account/profile-form.tsx).
  * Teste de validação do Gate 07 em [src/features/account/__tests__/rls-isolation.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/account/__tests__/rls-isolation.test.ts).
* **Gate 07:**
  * Build (`next build` Turbopack): OK (20 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Isolamento de RLS: OK (Cliente A nunca vê pedidos, itens ou endereços do Cliente B; tentativas diretas retornam `notFound()`)

### Fase 08 — Checkout
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Schema Zod em [src/schemas/checkout.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/schemas/checkout.ts) (`checkoutSchema`, `checkoutItemSchema`) com validação de endereço, opções de frete (PAC/Sedex), pagamento (Pix/Crédito), cupom e array de itens.
  * Server Action [src/features/checkout/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/checkout/actions.ts) (`createOrderAction`):
    * Cálculo 100% server-side de preços (`price_cents`, `sale_price_cents`). Zero confiança em valores vindos do cliente.
    * Validação concorrente de estoque (`stock >= quantity`) com bloqueio de itens inativos/esgotados.
    * Snapshot imutável de endereço gravado em `orders.shipping_address`.
    * Snapshot imutável de itens inserido em `order_items` (`product_name`, `sku`, `quantity`, `unit_price_cents`, `subtotal_cents`).
    * Regras de negócio de frete (PAC grátis acima de R$ 199,00) e desconto Pix de 5% cumulativo com cupom `ISIS10`.
    * Baixa imediata de estoque no banco (`products.stock = stock - quantity`).
    * Limpeza automática do carrinho remoto (`cart_items`) e local.
  * Componente cliente interativo em [src/components/commerce/checkout-form.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/checkout-form.tsx) com proteção contra duplo clique, seletor de endereço salvo ou novo com busca de CEP, escolha de frete e cupom dinâmico.
  * Página de Checkout em [src/app/checkout/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/checkout/page.tsx) com cabeçalho limpo focado em conversão e selos de segurança.
  * Página de Sucesso da Compra em [src/app/checkout/sucesso/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/checkout/sucesso/page.tsx) com código do pedido `#ISIS-XXXX`, instruções e cópia de chave Pix e direcionamento para acompanhamento.
  * Suite de testes unitários de regras de negócio em [src/features/checkout/__tests__/checkout-rules.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/checkout/__tests__/checkout-rules.test.ts).
* **Gate 08:**
  * Build (`next build` Turbopack): OK (22 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Pedido criado corretamente com snapshot imutável, baixa de estoque e cálculo server-side: OK

### Fase 09 — Mercado Pago
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Gateway Adapter oficial em [src/lib/payments/mercadopago.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/lib/payments/mercadopago.ts):
    * `createPixPayment`: geração de QR Code Pix (payload EMV e Base64) com fallback para Sandbox Simulator local caso credenciais de produção não estejam presentes.
    * `createPreference`: criação de checkout preference para pagamentos via cartão de crédito com back_urls e auto_return.
    * `getPaymentDetails`: consulta de transações na API do gateway.
    * `verifyWebhookSignature`: validação criptográfica de integridade de requisições via HMAC SHA-256 (`id`, `request-id`, `ts`).
  * Endpoint oficial de Webhook em [src/app/api/webhooks/mercadopago/route.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/api/webhooks/mercadopago/route.ts):
    * Idempotência estrita implementada gravando na tabela `payment_events` com chave única `event_id`. Retentativas repetidas retornam 200 OK imediato sem duplicidade.
    * Mapeamento seguro de status (`approved` -> `paid`, `in_process` -> `processing`, `rejected`/`cancelled` -> `cancelled`).
    * Atualização sincronizada das tabelas `orders` e `payments`.
    * Reversão automática de estoque dos produtos em caso de pedidos cancelados ou reembolsados.
    * Registro de auditoria em `admin_audit_logs`.
    * Rota GET de liveness para verificação automática do gateway.
  * Integração na criação de pedidos [src/features/checkout/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/checkout/actions.ts) gerando o registro em `payments` e direcionando fluxo de Pix ou Cartão.
  * Componente interativo de pagamento Pix [src/components/commerce/pix-payment-box.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/pix-payment-box.tsx) na tela de sucesso [src/app/checkout/sucesso/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/checkout/sucesso/page.tsx) com renderização de QR Code, chave copia-e-cola com feedback visual e temporizador de 30 minutos.
  * Teste automatizado do Gate 09 em [src/features/checkout/__tests__/mercadopago-gateway.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/checkout/__tests__/mercadopago-gateway.test.ts) validando geração de Pix, Preferences, assinatura HMAC SHA-256, deduplicação de webhooks e mapeamento de status.
* **Gate 09:**
  * Build (`next build` Turbopack): OK (23 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Testes unitários do Gateway e Idempotência: OK (100% aprovados)
  * Ambiente Sandbox / Produção desacoplado e seguro: OK

### Fase 10 — Painel Admin
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Schemas Zod em [src/schemas/admin.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/schemas/admin.ts) para validação estrita de categorias (`categorySchema`), estoque (`updateStockSchema`), status de produto (`updateProductStatusSchema`), status de pedido (`updateOrderStatusSchema`) e permissões (`updateUserRoleSchema`).
  * Server Actions administrativas seguras em [src/features/admin/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/admin/actions.ts) com verificação de privilégio `role === 'admin'` e gravação automática em `admin_audit_logs`:
    * `updateProductStockAction`: ajuste rápido de estoque com recálculo e auditoria.
    * `updateProductStatusAction`: alternância entre `published`, `draft` e `archived`.
    * `archiveProductAction`: arquivamento com preservação de integridade referencial.
    * `createCategoryAction`: criação de categoria com validação de unicidade de slug.
    * `deleteCategoryAction`: exclusão protegida contra categorias com produtos vinculados.
    * `updateOrderStatusAction`: transições operacionais (`pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`), anotação de rastreamento e reversão de estoque em caso de cancelamento.
    * `updateUserRoleAction`: controle de acesso com proteção contra auto-rebaixamento.
  * Barra de navegação em abas do backoffice [src/components/admin/admin-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/admin/admin-nav.tsx) integrada em [src/app/admin/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/layout.tsx).
  * Dashboard Executivo em [src/app/admin/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/page.tsx) com faturamento total aprovado, contadores de pedidos para envio imediato, estoque crítico (≤5), clientes, tabela dos últimos pedidos e últimos logs de auditoria.
  * Módulo de Produtos em [src/app/admin/produtos/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/produtos/page.tsx) com editor rápido de estoque e status inline [src/components/admin/quick-product-editor.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/admin/quick-product-editor.tsx).
  * Módulo de Categorias em [src/app/admin/categorias/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/categorias/page.tsx) com formulário interativo [src/components/admin/category-manager.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/admin/category-manager.tsx).
  * Módulo de Pedidos em [src/app/admin/pedidos/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/pedidos/page.tsx) com filtro por abas de status e página de detalhes [src/app/admin/pedidos/[id]/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/pedidos/%5Bid%5D/page.tsx) com componente [src/components/admin/order-status-manager.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/admin/order-status-manager.tsx).
  * Módulo de Clientes em [src/app/admin/clientes/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/clientes/page.tsx) com seletor de permissão [src/components/admin/user-role-manager.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/admin/user-role-manager.tsx).
  * Trilha de Auditoria em [src/app/admin/auditoria/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/auditoria/page.tsx) exibindo ator, ação, entidade, ID e metadados.
  * Suite de testes unitários do Gate 10 em [src/features/admin/__tests__/admin-management.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/admin/__tests__/admin-management.test.ts).
* **Gate 10:**
  * Build (`next build` Turbopack): OK (27 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Testes unitários do Gate 10: OK (100% aprovados)
  * Todas as operações administrativas críticas funcionando: OK

### Fase 11 — Motion / UX
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * Provedor e Hook global de notificações animadas [src/components/ui/toast-context.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/toast-context.tsx) integrado em [src/app/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/layout.tsx) com variantes `success`, `error`, `warning` e `info`, auto-dismiss e animação fluida acelerada por GPU (`slide-in-from-bottom-4` + `fade-in`).
  * Microinterações táteis nos cards de produtos [src/components/commerce/product-card.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-card.tsx):
    * Efeito de elevação suave em hover (`hover:-translate-y-1 hover:shadow-md will-change-transform`).
    * Feedback dinâmico no botão com transição de ícone/texto ("Adicionado!" com checkmark verde) e disparo de toast contextual.
    * Animação de zoom suave da fotografia em hover (`group-hover:scale-105 duration-500`).
    * Feedback no botão de favoritos (Wishlist) com toast de confirmação.
  * Microinterações na página de detalhes do produto [src/components/commerce/product-actions.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-actions.tsx) com disparo integrado de toast e feedback de adição à sacola.
  * Animação do badge numérico do carrinho no Header [src/components/layout/header.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/layout/header.tsx) e na barra móvel [src/components/layout/bottom-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/layout/bottom-nav.tsx) acionando zoom-in a cada novo item adicionado.
  * Estados de carregamento e Skeletons otimizados (Next.js `loading.tsx`) para todas as rotas críticas:
    * Raiz: [src/app/loading.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/loading.tsx)
    * Catálogo: [src/app/produtos/loading.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/produtos/loading.tsx)
    * Detalhe do Produto: [src/app/produtos/[slug]/loading.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/produtos/%5Bslug%5D/loading.tsx)
    * Carrinho: [src/app/carrinho/loading.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/carrinho/loading.tsx)
    * Área do Cliente: [src/app/conta/loading.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/conta/loading.tsx)
    * Painel Admin: [src/app/admin/loading.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/admin/loading.tsx)
  * Keyframes 60FPS de alta performance e suporte obrigatório à acessibilidade vestibular com `@media (prefers-reduced-motion: reduce)` em [src/app/globals.css](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/globals.css).
  * Suite de testes unitários do Gate 11 em [src/features/ui/__tests__/motion-ux.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/ui/__tests__/motion-ux.test.ts) validando gestão da fila de toasts, microinterações transitórias, propriedades 60FPS (transform/opacity) e redução de movimento.
* **Gate 11:**
  * Build (`next build` Turbopack): OK (27 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Testes unitários do Gate 11: OK (100% aprovados)
  * Nenhuma animação prejudica usabilidade ou performance (60FPS auditado): OK

---

## Fase 12 — Responsividade & Viewports (320px a 1920px)
* **Status:** CONCLUÍDA
* **Entregas:**
  * Configuração oficial de `Viewport` do Next.js exportada em [src/app/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/layout.tsx) com `device-width` e escala inicial.
  * Contenção global de overflow horizontal (`overflow-x-hidden w-full max-w-full`) na raiz da aplicação.
  * Otimização de touch targets para acessibilidade (WCAG 2.1 mínimo de 44x44px) nos botões de ação e navegação do [src/components/layout/header.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/layout/header.tsx) e [src/components/layout/bottom-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/layout/bottom-nav.tsx).
  * Suporte a Safe Area do iOS (`.safe-area-bottom`) com `env(safe-area-inset-bottom)` e remoção de delay de toque mobile com `.touch-manipulation` em [src/app/globals.css](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/globals.css).
  * Prevenção de quebra de layout por palavras longas com `overflow-wrap: break-word`.
  * Grid responsivo adaptativo com padding compacto no [src/components/commerce/product-card.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-card.tsx) e Hero/Benefícios da Home em [src/app/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/page.tsx).
  * Controles de quantidade e subtotal adaptados para telas estreitas (320px) em [src/app/carrinho/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/carrinho/page.tsx).
  * Recuo flexível do [src/components/commerce/cart-drawer.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/cart-drawer.tsx) (`pl-4 sm:pl-10`).
  * Contenção de tabelas com scroll horizontal suave (`overflow-x-auto`) em todos os módulos administrativos e abas com `whitespace-nowrap` em [src/components/admin/admin-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/admin/admin-nav.tsx) e [src/components/account/account-nav.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/account/account-nav.tsx).
  * Suite de testes de auditoria do Gate 12 em [src/features/ui/__tests__/responsiveness-audit.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/ui/__tests__/responsiveness-audit.test.ts) cobrindo todos os 9 breakpoints (320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px).
* **Gate 12:**
  * Build (`next build` Turbopack): OK (27 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Teste do Gate 12: OK (100% aprovado)
  * Sem overflow crítico em todos os 9 breakpoints: OK

---

## Fase 13 — Segurança & Auditoria
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * **Auditoria de Segredos e Chaves:**
    * Auditoria completa de `.env.example`, `.env.local` e `.gitignore`.
    * Zero chaves mestras ou privadas (`service_role`, `SUPABASE_SERVICE_ROLE_KEY`, tokens reais de pagamento) expostas no client-side ou versionadas no git.
    * Todas as variáveis sensíveis limitadas exclusivamente a Server Components e Server Actions.
  * **Cabeçalhos de Segurança HTTP (Hardening Web):**
    * Configuração de headers estritos de segurança em [next.config.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/next.config.ts):
      * `X-Frame-Options: DENY` (proteção contra Clickjacking).
      * `X-Content-Type-Options: nosniff` (proteção contra MIME-sniffing).
      * `Referrer-Policy: strict-origin-when-cross-origin` (privacidade de navegação).
      * `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restrição de APIs sensíveis do navegador).
  * **Mitigação Estrita contra Open Redirect:**
    * Validação e sanitização de parâmetro de redirecionamento (`next`) em [src/app/auth/callback/route.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/auth/callback/route.ts) e [src/lib/supabase/middleware.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/lib/supabase/middleware.ts).
    * Bloqueio explícito contra vetores de bypass como protocolo relativo (`//malicious.com`), barras invertidas (`/\malicious.com`) ou URLs absolutas externas.
  * **Auditoria de Banco de Dados e Políticas RLS (Row Level Security):**
    * 100% das 13 tabelas públicas do Supabase com RLS ativo (`rowsecurity = true`).
    * Isolamento estrito por usuário (`auth.uid() = user_id`) em `profiles`, `addresses`, `orders`, `cart_items` e `wishlists`.
  * **Hardening de Funções PostgreSQL (SECURITY DEFINER):**
    * Criação e aplicação da migration [supabase/migrations/20260927000001_security_hardening.sql](file:///c:/xampp/htdocs/AluraProjects/IsisStore/supabase/migrations/20260927000001_security_hardening.sql):
      * Revogação de privilégios de execução pública/anônima de `handle_new_user()` (`REVOKE EXECUTE ON FUNCTION handle_new_user FROM public, anon`).
      * Restrição de execução da função de RBAC `is_admin(uuid)` aos usuários autenticados (`REVOKE EXECUTE ON FUNCTION is_admin FROM public, anon; GRANT EXECUTE ON FUNCTION is_admin TO authenticated`).
  * **Integridade de Preços e Antifraude Server-Side:**
    * Confirmação da integridade de cálculo financeiro no checkout em [src/features/checkout/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/checkout/actions.ts): valores e descontos consultados diretamente no banco de dados, recalculando subtotal, cupons, frete e total estritamente no servidor.
  * **Assinatura HMAC e Idempotência Financeira:**
    * Webhook do Mercado Pago [src/app/api/webhooks/mercadopago/route.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/api/webhooks/mercadopago/route.ts) protegido com validação de assinatura HMAC SHA-256 e gravação em tabela idempotente (`payment_events`).
  * **Proteção contra Auto-Rebaixamento e Elevação de Privilégio:**
    * Validação no backoffice [src/features/admin/actions.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/admin/actions.ts) impedindo que o último admin ou o próprio administrador logado remova seu papel.
  * **Suite de Testes Automatizados de Segurança:**
    * Criação do teste de conformidade e auditoria em [src/features/security/__tests__/security-audit.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/security/__tests__/security-audit.test.ts).
* **Gate 13:**
  * Build (`next build` Turbopack): OK (27 rotas compiladas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Teste do Gate 13: OK (100% aprovado)
  * Nenhum segredo exposto, RLS ativo em 100% das tabelas, RBAC auditado e Open Redirect mitigado: OK

---

## Fase 14 — Performance & Otimização
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * **Otimização de Assets e Imagens (next/image):**
    * Configuração de formatos de última geração em [next.config.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/next.config.ts): suporte nativo e negociação automática de `image/avif` e `image/webp`.
    * Compressão de respostas HTTP (`compress: true`) e remoção de fingerprinting (`poweredByHeader: false`).
    * Auditoria completa de imagens em componentes `.tsx`: 100% de uso do `<Image>` oficial do Next.js com zero tags `<img>` cruas no projeto.
    * Priorização de LCP (Largest Contentful Paint) no Banner Hero da Home [src/app/page.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/page.tsx) com `priority` e `sizes="(max-width: 1024px) 100vw, 42vw"`, e na galeria de produtos [src/components/commerce/product-gallery.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-gallery.tsx).
  * **Deduplicação de Queries com React cache:**
    * Encapsulamento das funções do catálogo em [src/services/catalog.service.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/services/catalog.service.ts) (`getCategories`, `getCategoryBySlug`, `getProductBySlug`, `getRelatedProducts`) com `cache()` do React.
    * Eliminação de consultas duplicadas durante o ciclo de renderização SSR (deduplicação entre `generateMetadata` e `Page` component).
  * **Auditoria e Otimização do Banco de Dados PostgreSQL (Supabase):**
    * Criação e aplicação da migration [supabase/migrations/20260927000002_performance_optimization.sql](file:///c:/xampp/htdocs/AluraProjects/IsisStore/supabase/migrations/20260927000002_performance_optimization.sql).
    * Criação de índices de cobertura para 100% das chaves estrangeiras pendentes:
      * `addresses(profile_id)`
      * `admin_audit_logs(actor_id)`
      * `cart_items(product_id)`
      * `carts(profile_id)`
      * `order_items(product_id)`
    * Criação de índices compostos e de ordenação para consultas críticas:
      * `products(status, created_at DESC)` (catálogo e vitrines)
      * `orders(created_at DESC)` (pedidos recentes do cliente e admin)
      * `admin_audit_logs(created_at DESC)` (trilha de auditoria)
    * Resolução completa do problema `auth_rls_initplan` em todas as políticas RLS (`profiles`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `payments`), substituindo `auth.uid()` por `(select auth.uid())` para avaliação em tempo de `InitPlan` (única por consulta) em vez de `SubPlan` (por linha).
    * Auditoria do Supabase Performance Linter zerada em `unindexed_foreign_keys` e `auth_rls_initplan`.
  * **Auditoria de Bundle e Animações 60FPS:**
    * Dependências enxutas sem frameworks pesados de terceiros.
    * Animações exclusivamente baseadas em `transform` e `opacity` com aceleração por GPU (`will-change: transform`, `translateZ(0)`).
    * Desativação universal de animações quando `prefers-reduced-motion: reduce` é detectado.
    * Tipografia com `next/font` e `display: 'swap'` eliminando atrasos no FCP.
  * **Suite de Testes de Performance:**
    * Suite automatizada criada em [src/features/performance/__tests__/performance-audit.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/performance/__tests__/performance-audit.test.ts) (7 testes aprovados).
* **Gate 14:**
  * Build (`next build` Turbopack): OK (compilado em 2.7s, 27 rotas otimizadas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Teste do Gate 14: OK (100% aprovado)
  * Zero avisos críticos de performance no Supabase Linter: OK

---

## Fase 15 — Testes & QA Automatizado
* **Data de Conclusão:** 2026-09-27
* **Status:** Concluída
* **Entregáveis:**
  * **Configuração Oficial do Runner de Testes (`npm test`):**
    * Adição do pacote `tsx` às `devDependencies` e script `"test": "tsx --test src/**/__tests__/*.test.ts"` em [package.json](file:///c:/xampp/htdocs/AluraProjects/IsisStore/package.json).
  * **Suite de Testes E2E de Fluxos Críticos ([src/features/qa/__tests__/e2e-critical-flows.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/qa/__tests__/e2e-critical-flows.test.ts)):**
    * **1. Catálogo e Regras Comerciais do Carrinho:**
      * Cálculo de subtotal, frete grátis (>= R$ 199,00) e desconto percentual de cupom (`ISIS10`).
    * **2. Autorização e Controle de Acesso (RBAC & RLS):**
      * Bloqueio estrito de clientes comuns executando Server Actions administrativas.
      * Proteção contra auto-rebaixamento de privilégio do último administrador ou do usuário logado.
    * **3. Checkout e Integridade Financeira Server-Side:**
      * Criação de snapshot imutável de itens.
      * Recálculo compulsório de preços no servidor com bloqueio de tentativas de manipulação de preço pelo client (anti-tampering).
      * Validação atômica e concorrência de estoque.
    * **4. Webhooks, Assinatura HMAC e Idempotência:**
      * Validação criptográfica de assinaturas HMAC SHA-256 (`id`, `request-id`, `ts`).
      * Rejeição imediata de payloads com assinaturas forjadas ou adulteradas.
      * Deduplicação idempotente de eventos em retentativas de rede.
    * **5. Ciclo de Vida do Pedido e Reversão de Estoque:**
      * Transições de status válidas e reversão automática das quantidades para o estoque em cancelamentos e reembolsos.
  * **Cobertura Total de Testes do Projeto (11 Suites Automatizadas):**
    * `src/features/account/__tests__/rls-isolation.test.ts` (Gate 07 - Isolamento RLS entre clientes)
    * `src/features/admin/__tests__/admin-management.test.ts` (Gate 10 - Gestão de produtos, pedidos e auditoria)
    * `src/features/admin/__tests__/product-image-upload.test.ts` (Upload de fotos do PC e conversão WebP)
    * `src/features/cart/__tests__/cart-rules.test.ts` (Gate 06 - Regras de carrinho e cupom)
    * `src/features/checkout/__tests__/checkout-rules.test.ts` (Gate 08 - Snapshot imutável e concorrência)
    * `src/features/checkout/__tests__/mercadopago-gateway.test.ts` (Gate 09 - Gateway Pix/Cartão e HMAC)
    * `src/features/security/__tests__/security-audit.test.ts` (Gate 13 - Auditoria de segredos, headers e RLS)
    * `src/features/performance/__tests__/performance-audit.test.ts` (Gate 14 - Imagens, React cache e índices SQL)
    * `src/features/ui/__tests__/motion-ux.test.ts` (Gate 11 - 60FPS motion e prefers-reduced-motion)
    * `src/features/ui/__tests__/responsiveness-audit.test.ts` (Gate 12 - 9 breakpoints de 320px a 1920px)
    * `src/features/qa/__tests__/e2e-critical-flows.test.ts` (Gate 15 - Integração E2E ponta a ponta)
* **Gate 15:**
  * Execução `npm test`: OK (23 testes em 7 suites, 100% aprovados em ~1.2s)
  * Build (`next build` Turbopack): OK (compilado em 3.0s, 27 rotas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Todos os fluxos críticos (Unit, Integration, E2E, Auth, Checkout, Webhook) validados: OK

---

## Fase 16 — Design System Checklist
* **Data de Conclusão:** 2026-09-28
* **Status:** Concluída
* **Entregáveis:**
  * **Auditoria Formal de Conformidade com o designsystemchecklist.com ([docs/DESIGN-SYSTEM-CHECKLIST.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM-CHECKLIST.md)):**
    * **1. Fundamentos & Design Tokens:**
      * Paleta oficial calibrada (`#E08CA3`, `#F9C7D4`, `#FFF5F6`, `#574240`) com estados derivados (hover, active, soft, border) em [src/styles/tokens.css](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/styles/tokens.css).
      * Cores semânticas/funcionais (sucesso `#4E8752`, alerta `#B8860B`, erro `#C24343`, info `#5A7EA8`).
      * Escala de espaçamento Base 4, raios de borda (`--raio-sm` a `--raio-full`), sombras quentes anti-IA e tokens de motion com curvas Bezier naturais.
    * **2. Componentes de UI Core Auditados:**
      * `Button` com suporte completo a variantes (`primary`, `secondary`, `outline`, `ghost`, `link`), tamanhos, estados de carregamento com spinner e anel de foco.
      * `Input` com foco visual acessível (`focus-visible:ring-2 focus-visible:ring-primaria`), suporte a erros e ícones contextuais.
      * `Badge` com variantes temáticas e promocionais (`discount`).
      * `Toast` integrado globalmente com auto-dismiss e animação fluida acelerada por hardware.
      * `Skeleton` pulsante prevenindo CLS em todas as rotas críticas.
      * `ProductCard` e `CartDrawer` com conformidade visual e acessível.
    * **3. Acessibilidade WCAG 2.1 (Níveis AA & AAA):**
      * Proporção de contraste calculada matematicamente: **8.55:1** no fundo e **8.92:1** em cards brancos (supera inclusive o nível AAA de 7.0:1).
      * Anel de foco visível universal (`focus-visible:ring-offset-2`).
      * Semântica HTML5 nativa sem botões falsos (`<div>` clicável).
      * Atributos `aria-label` em botões de ícone e navegações móveis (`Header`, `BottomNav`).
      * Touch targets de no mínimo 44x44px.
      * Desativação de animações sob `@media (prefers-reduced-motion: reduce)`.
    * **4. Documentação Técnica Consolidada:**
      * [docs/DESIGN-SYSTEM.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM.md)
      * [docs/DESIGN-SYSTEM-CHECKLIST.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM-CHECKLIST.md)
      * [docs/SECURITY.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/SECURITY.md)
    * **5. Suite de Testes do Checklist ([src/features/ui/__tests__/design-system-checklist.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/ui/__tests__/design-system-checklist.test.ts)):**
      * 5 testes automatizados cobrindo tokens, cálculo de contraste W3C, componentes core, acessibilidade e documentação.
* **Gate 16:**
  * Build (`next build` Turbopack): OK (compilado em 2.9s, 27 rotas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Teste do Gate 16 e suite geral (`npm test`): OK (28 testes aprovados em 1.4s)
  * 100% dos critérios do designsystemchecklist.com verificados e documentados: OK

---

## Fase 17 — QA Final
* **Data de Conclusão:** 2026-09-28
* **Status:** Concluída
* **Entregáveis:**
  * **Suite de Testes da Jornada Completa do Usuário ([src/features/qa/__tests__/qa-final-journey.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/qa/__tests__/qa-final-journey.test.ts)):**
    * **Passo 01 — Abrir Loja:** Vitrines da Home carregadas com produtos publicados e categorias ativas.
    * **Passo 02 — Buscar Produto:** Busca por termo ("Coração") com correspondência exata de catálogo.
    * **Passo 03 — Abrir Produto:** Carregamento de detalhes do produto, fotos e estoque disponível.
    * **Passo 04 — Adicionar ao Carrinho:** Inserção do item com quantidade 1 na sacola.
    * **Passo 05 — Alterar Quantidade:** Atualização para quantidade 2, recálculo de subtotal (R$ 240,00) e aplicação de frete grátis (>= R$ 199,00).
    * **Passo 06 — Login:** Autenticação e sessão de usuário cliente preservada com integridade.
    * **Passo 07 — Checkout Server-Side:** Criação do pedido com snapshot imutável, recálculo no servidor e reserva de estoque.
    * **Passo 08 — Pagamento Teste:** Geração de Pix via Gateway Adapter Mercado Pago com chave e QR Code.
    * **Passo 09 — Webhook HMAC:** Processamento de notificação assinado com HMAC SHA-256 de forma idempotente, transicionando pedido para `paid`.
    * **Passo 10 — Pedido Aprovado:** Confirmação com número do pedido e gravação em banco.
    * **Passo 11 — Área do Cliente (Conta):** Visualização do pedido em `/conta/pedidos` com isolamento estrito de outros clientes via RLS.
    * **Passo 12 — Painel Admin:** Fila operacional administrativa visualizando o pedido aprovado para expedição.
    * **Passo 13 — Alterar Pedido (Despacho):** Transição de status para `shipped` com anotação do código de rastreamento dos Correios e gravação na trilha de auditoria (`admin_audit_logs`).
  * **Cobertura Total:**
    * 41 testes automatizados cobrindo todas as áreas funcionais do projeto.
* **Gate 17:**
  * Build (`next build` Turbopack): OK (compilado em 3.1s, 27 rotas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros, 0 avisos)
  * Suite completa (`npm test`): OK (41 testes aprovados em 1.4s)
  * Fluxo completo ponta a ponta sem falhas: OK

---

## Fase 18 — Produção & Go-Live
* **Data de Conclusão:** 2026-10-06
* **Status:** Concluída
* **Entregáveis:**
  * **Configuração de SEO e Indexação de Produção:**
    * Diretivas oficiais de indexação em [src/app/robots.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/robots.ts) com liberação das rotas públicas (`/`, `/produtos`, `/categorias`) e bloqueio estrito de bots em rotas privadas (`/admin`, `/conta`, `/checkout`, `/api`, `/auth`).
    * Geração dinâmica e resiliente do mapa do site em [src/app/sitemap.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/sitemap.ts) gerando URLs canônicas com `lastModified`, frequências e prioridades para vitrines, categorias e produtos ativos.
  * **Healthcheck & Observabilidade de Produção:**
    * Endpoint de monitoramento de disponibilidade e latência do banco de dados em [src/app/api/health/route.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/api/health/route.ts), com cabeçalho `Cache-Control: no-store` para monitoramento ativo (UptimeRobot, BetterStack).
  * **Matriz de Variáveis de Ambiente de Produção:**
    * Especificação oficial e blindada em [.env.production.example](file:///c:/xampp/htdocs/AluraProjects/IsisStore/.env.production.example) cobrindo Next.js, URLs canônicas, Supabase (anon/service_role), chaves de produção do Mercado Pago (`APP_USR-`), webhook secret HMAC e senha mestra do admin.
  * **Guia Oficial de Implantação e Operação ([docs/DEPLOYMENT.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DEPLOYMENT.md)):**
    * Arquitetura de infraestrutura de alta disponibilidade.
    * Checklist pré-deploy de RLS, banco, storage e segurança.
    * Procedimentos passo a passo para configuração de DNS, domínio customizado e certificado SSL.
    * Configuração de produção para Mercado Pago, InfinitePay e WhatsApp.
    * Políticas de backup diário do PostgreSQL e redundância de storage.
    * Runbook operacional de Go-Live e procedimentos de rollback emergencial.
  * **Suite de Testes de Produção ([src/features/production/__tests__/production-readiness.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/production/__tests__/production-readiness.test.ts)):**
    * 6 testes automatizados cobrindo robots.txt, sitemap.xml, /api/health, .env.production.example, hardening do next.config.ts e conformidade do docs/DEPLOYMENT.md.
* **Gate 18:**
  * Build (`next build` Turbopack): OK (compilado em 5.1s, 48 rotas de produção geradas)
  * Typecheck (`tsc --noEmit`): OK (0 erros)
  * Lint (`eslint`): OK (0 erros)
  * Testes automatizados (`npm test`): OK (113 testes em 25 suites, 100% aprovados em ~7s)
  * Zero segredos expostos e conformidade total para Go-Live: OK
















# ROADMAP OFICIAL — ISIS STORE

> **Documento:** `docs/ROADMAP.md`  
> **Última atualização:** 2026-09-27  
> **Status Geral:** Em andamento — Fase 10 Concluída

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
| **11** | **Motion / UX** | **A INICIAR** | Microinterações + feedback + reduced-motion OK |
| **12** | **Responsividade** | Pendente | 320px a 1920px sem overflow crítico OK |
| **13** | **Segurança** | Pendente | Zero secrets expostos + RLS auditado + sanitização OK |
| **14** | **Performance** | Pendente | Core Web Vitals + bundle + queries otimizadas OK |
| **15** | **Testes** | Pendente | Unitários + Integração + E2E fluxos críticos OK |
| **16** | **Design System Checklist** | Pendente | Revisão formal designsystemchecklist.com OK |
| **17** | **QA Final** | Pendente | Fluxo ponta a ponta sem falhas OK |
| **18** | **Produção** | Pendente | Deploy seguro + monitoramento + backups OK |

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








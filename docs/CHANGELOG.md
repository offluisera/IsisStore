# CHANGELOG — ISIS STORE

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## 2026-09-27

### Added
- Conclusão da **Fase 10 — Painel Admin**:
  - Implementação de schemas Zod em `src/schemas/admin.ts` para categorias, ajuste de estoque, status de produto, status de pedido e papéis de usuário.
  - Criação de Server Actions administrativas em `src/features/admin/actions.ts` com validação de perfil `admin` e gravação de logs em `admin_audit_logs` (`updateProductStockAction`, `updateProductStatusAction`, `archiveProductAction`, `createCategoryAction`, `deleteCategoryAction`, `updateOrderStatusAction`, `updateUserRoleAction`).
  - Implementação de barra de navegação em abas `AdminNav` em `src/components/admin/admin-nav.tsx` conectada ao layout principal.
  - Dashboard gerencial consolidado em `src/app/admin/page.tsx` com métricas em tempo real de faturamento aprovado, despachos pendentes, estoque crítico (≤5), contagem de clientes e listas dos últimos pedidos e auditoria.
  - Módulo de produtos `/admin/produtos` enriquecido com miniaturas fotográficas e componente cliente de alteração rápida de estoque e status `QuickProductEditor`.
  - Módulo de categorias `/admin/categorias` com formulário interativo de criação e exclusão com proteção `CategoryManager`.
  - Módulo de pedidos `/admin/pedidos` com filtros por status e página de detalhes `/admin/pedidos/[id]` com gestão operacional de despacho e código de rastreamento `OrderStatusManager`.
  - Módulo de clientes `/admin/clientes` com controle e alternância de permissões `UserRoleManager` com proteção anti-autorebaixamento.
  - Trilha de auditoria `/admin/auditoria` com histórico detalhado e metadados das ações administrativas.
  - Suite de testes do Gate 10 em `src/features/admin/__tests__/admin-management.test.ts`.
  - Aprovação no **Gate 10**: Todas as operações administrativas funcionando com 27 rotas compiladas no build de produção, 0 erros no typecheck e 0 erros no lint.
- Conclusão da **Fase 09 — Mercado Pago**:
  - Implementação do Gateway Adapter oficial em `src/lib/payments/mercadopago.ts` com funções `createPixPayment`, `createPreference`, `getPaymentDetails` e `verifyWebhookSignature` (validação HMAC SHA-256 e fallback para Sandbox Simulator local).
  - Criação do endpoint oficial de Webhook em `src/app/api/webhooks/mercadopago/route.ts` com idempotência financeira na tabela `payment_events`, mapeamento de status (`approved` -> `paid`, `cancelled` -> `cancelled`), reversão de estoque em caso de cancelamento e auditoria em `admin_audit_logs`.
  - Conexão do fluxo de pagamento na criação de pedidos em `src/features/checkout/actions.ts` registrando em `payments`.
  - Componente de exibição Pix `PixPaymentBox` em `src/components/commerce/pix-payment-box.tsx` integrado à página de sucesso `/checkout/sucesso` com QR Code visual, cópia da chave Pix em um clique e contador de expiração.
  - Suite de testes automatizados do gateway e webhooks em `src/features/checkout/__tests__/mercadopago-gateway.test.ts`.
  - Aprovação no **Gate 09**: Testes de assinatura, geração de Pix, idempotência e mapeamento de status aprovados com 23 rotas compiladas e typecheck 100% limpo.
- Conclusão da **Fase 08 — Checkout**:
  - Implementação do schema Zod em `src/schemas/checkout.ts` (`checkoutSchema`, `checkoutItemSchema`).
  - Criação da Server Action `createOrderAction` em `src/features/checkout/actions.ts` com cálculo 100% server-side de preços (`price_cents`, `sale_price_cents`), validação de estoque concorrente, criação de pedido `#ISIS-XXXX` em status `pending_payment`, snapshot imutável em `order_items` e baixa automática de estoque.
  - Construção do componente de checkout `CheckoutForm` em `src/components/commerce/checkout-form.tsx` com seleção de endereço existente ou cadastro inline, frete dinâmico (PAC grátis acima de R$ 199,00 / Sedex), desconto Pix de 5%, cupom promocional e proteção contra submissão duplicada.
  - Criação da página `/checkout` em `src/app/checkout/page.tsx` com design clean de alta conversão e selos de criptografia e proteção de dados.
  - Implementação da página de confirmação `/checkout/sucesso` em `src/app/checkout/sucesso/page.tsx` com código de rastreamento do pedido e chave Pix gerada para pagamento.
  - Suite de testes de integridade em `src/features/checkout/__tests__/checkout-rules.test.ts`.
  - Aprovação no **Gate 08**: Pedido criado com snapshot imutável, cálculo server-side, concorrência de estoque e 22 rotas compiladas.
- Conclusão da **Fase 07 — Área do Cliente**:
  - Schemas Zod em `src/schemas/account.ts` (`profileUpdateSchema`, `addressSchema`).
  - Server Actions em `src/features/account/actions.ts` (`updateProfileAction`, `createAddressAction`, `deleteAddressAction`, `setDefaultAddressAction`) com isolamento por `auth.uid()`.
  - Layout da conta em `src/app/conta/layout.tsx` e abas de navegação responsiva `AccountNav` em `src/components/account/account-nav.tsx`.
  - Dashboard geral em `src/app/conta/page.tsx` com métricas de pedidos, endereço padrão e atalhos rápidos.
  - Página de histórico de pedidos em `src/app/conta/pedidos/page.tsx` e tela de detalhes do pedido em `src/app/conta/pedidos/[id]/page.tsx` com timeline de rastreio e snapshot de itens.
  - Gestão de endereços em `src/app/conta/enderecos/page.tsx` com formulário `AddressForm` com autopreenchimento de CEP (ViaCEP) e `AddressCard`.
  - Página de dados cadastrais e segurança da conta em `src/app/conta/dados/page.tsx` com formulário `ProfileForm`.
  - Suite de testes de isolamento de RLS em `src/features/account/__tests__/rls-isolation.test.ts`.
  - Aprovação no **Gate 07**: Isolamento estrito de dados entre clientes A e B aprovado, rotas protegidas e 20 páginas compiladas.
- Conclusão da **Fase 06 — Carrinho**:
  - Modelagem de tipos de domínio em `src/features/cart/types.ts` (`CartItem`, `CartContextType`).
  - Implementação do `CartContext` e hook `useCart()` em `src/features/cart/context/cart-context.tsx` com persistência em `localStorage` (`isis_store_cart_v1`), sincronização automática com Supabase (`carts`/`cart_items`) para clientes logados e listener de evento global `cart:add-item`.
  - Construção da gaveta deslizante `CartDrawer` em `src/components/commerce/cart-drawer.tsx` com progresso dinâmico de frete grátis (meta R$ 199,00) e atalho para checkout.
  - Implementação da página completa de carrinho em `src/app/carrinho/page.tsx` com controle de quantidade, remoção, cálculo seguro em centavos e aplicação de cupom promocional (`ISIS10`).
  - Conexão global no `RootLayout`, `Header`, `BottomNav`, cards de catálogo `ProductCard` e na página de detalhes `ProductActions`.
  - Suite de testes de regras financeiras em `src/features/cart/__tests__/cart-rules.test.ts`.
  - Aprovação no **Gate 06**: Persistência após reload da página, suporte a múltiplos produtos e cálculos em centavos validados.
- Conclusão da **Fase 05 — Catálogo**:
  - Implementação do serviço de catálogo em `src/services/catalog.service.ts` com filtros, busca textual, ordenação por preço/relevância e paginação eficiente.
  - Criação da página de listagem em `src/app/produtos/page.tsx` com componente de filtros `CatalogFilters` e paginação `CatalogPagination`.
  - Construção da página de detalhes do produto `src/app/produtos/[slug]/page.tsx` com galeria interativa `ProductGallery`, simulador de frete, opções de parcelamento e produtos relacionados.
  - Implementação da página de categorias `src/app/categorias/page.tsx` com contagem em tempo real de itens por departamento.
  - Módulo administrativo de catálogo com listagem em `src/app/admin/produtos/page.tsx`, cadastro em `src/app/admin/produtos/novo/page.tsx` e Server Action em `src/features/admin/product-actions.ts`.
  - Produção e incorporação de fotografias de produtos em alta definição em `public/images/products/`.
  - Aprovação no **Gate 05**: Produto cadastrado no banco/admin visível instantaneamente no storefront.
- Conclusão da **Fase 04 — Autenticação**:
  - Instalação e integração do `zod` com schemas estritos em `src/schemas/auth.ts`.
  - Implementação de Server Actions seguras em `src/features/auth/actions.ts` para login, cadastro, recuperação e redefinição de senha.
  - Construção do layout de autenticação `src/app/(auth)/layout.tsx` e páginas dedicadas:
    - `/login` com alternância de visibilidade de senha, feedback de erro e redirecionamento dinâmico.
    - `/cadastro` com validação de termos de uso e complexidade de senha.
    - `/recuperar-senha` e `/redefinir-senha` integrados ao fluxo do Supabase Auth.
  - Implementação do endpoint de callback PKCE em `src/app/auth/callback/route.ts` e encerramento de sessão em `src/app/auth/signout/route.ts`.
  - Criação de `middleware.ts` com `@supabase/ssr` para sincronização contínua de cookies de sessão e proteção contra acessos não autorizados.
  - Implementação da Área do Cliente em `src/app/conta/page.tsx` com hub de navegação e exibição de perfil.
  - Implementação do Painel Admin em `src/app/admin/layout.tsx` e `src/app/admin/page.tsx` com dupla barreira de autorização baseada em RBAC (`role === 'admin'`).
  - Aprovação no **Gate 04**: Usuário comum não acessa `/admin`, redirecionamento seguro para `/conta` com aviso de restrição.

---

## 2026-09-26

### Added
- Inicialização do projeto e governança oficial com `ANTIGRAVITY-RULES.md` e `MASTER-PROMPT.md`.
- Registro de diálogo inicial em `prompts/Iniciando.md`.
- Conclusão da **Fase 00 — Reconhecimento** com geração de `docs/PROJECT-AUDIT.md`.
- Criação do roadmap oficial em `docs/ROADMAP.md`.
- Criação da estrutura de documentação em `docs/`.
- Conclusão da **Fase 01 — Fundação**:
  - Setup do Next.js 16 (App Router), TypeScript e Tailwind CSS v4.
  - Instalação de `clsx`, `tailwind-merge`, `class-variance-authority` e `lucide-react`.
  - Configuração dos Design Tokens oficiais em `src/styles/tokens.css` com paleta Isis Store.
  - Configuração de tipografia oficial (Inter e Playfair Display) no RootLayout.
  - Criação da árvore de pastas arquitetural em `src/`.
  - Criação do arquivo de ambiente `.env.example`.
  - Documentação da arquitetura em `docs/ARCHITECTURE.md`.
  - Implementação da tela inicial da fundação e validação 100% nos gates de build, lint e typecheck.
- Conclusão da **Fase 02 — Design System**:
  - Análise aprofundada de todas as referências visuais oficiais (`design-1.png`, `design-2.png`, `tela.png`, `login.png`, `cliente.png`, `logo.jpeg`, `banner-rosto.jpeg`).
  - Criação da documentação completa em `docs/DESIGN-SYSTEM.md` e `docs/DESIGN-SYSTEM-CHECKLIST.md`.
  - Construção de componentes atômicos: `Button`, `Badge`, `Input`, `Checkbox`, `Card`, `Dialog`, `Skeleton`, `Toast`.
  - Construção de componentes de domínio e layout: `ProductCard`, `CartDrawer` (com barra de frete grátis), `CategoryPill` (5 categorias oficiais), `Header` (com top bar e busca), `BottomNav` (mobile).
  - Vitrine viva integrada na Home Page com fidelidade total à identidade visual Isis Store.
  - Aprovação em 100% dos gates de build, typecheck e lint.
- Conclusão da **Fase 03 — Supabase + Banco + RLS**:
  - Modelagem e aplicação de schema no PostgreSQL do Supabase (`wjhmukemyvimgxapscao` em sa-east-1).
  - 11 tabelas de domínio criadas com constraints de integridade (`stock >= 0`, `price_cents >= 0`, snapshots imutáveis).
  - 100% das tabelas protegidas por Row Level Security (RLS) para visitantes, clientes e administradores.
  - Bucket `products` provisionado no Supabase Storage com políticas de acesso.
  - Geração de tipos TypeScript automáticos em `src/types/database.ts`.
  - Instalação do SDK oficial `@supabase/supabase-js` e `@supabase/ssr` com clientes em `src/lib/supabase/`.
  - Documentação completa em `docs/DATABASE.md`.



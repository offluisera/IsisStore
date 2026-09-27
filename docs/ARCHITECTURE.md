# ARQUITETURA TÉCNICA — ISIS STORE

> **Documento:** `docs/ARCHITECTURE.md`  
> **Fase:** 01 — Fundação  
> **Data:** 2026-09-26  
> **Status:** Ativo  
> **Autor:** Antigravity (SuperAgente / Full-Stack Senior Architect)

---

## 1. Visão Geral da Arquitetura

O **Isis Store** é arquitetado como uma aplicação web moderna full-stack utilizando **Next.js (App Router)** com **TypeScript** e **Supabase** como plataforma de persistência (BaaS).

A aplicação segue a divisão em camadas para garantir que a interface, a lógica de negócio, o acesso a dados e os serviços externos (gateways) permaneçam desacoplados e testáveis.

```text
┌─────────────────────────────────────────────────────────┐
│                  Next.js App Router                     │
│  (Storefront, Área do Cliente, Painel Administrativo)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Components & Design System UI                │
│    (Tokens CSS, Tailwind CSS, shadcn/ui, ReUI)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Features & Services Layer                 │
│   (Auth, Products, Cart, Orders, Checkout, Customers)   │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌─────────────────────────────┐  ┌────────────────────────┐
│      Payment Gateway        │  │    Supabase Client     │
│   Adapter (Mercado Pago)    │  │  (Postgres, Auth, RLS, │
│    + Webhook Idempotente    │  │   Storage via WebP)    │
└─────────────────────────────┘  └────────────────────────┘
```

---

## 2. Estrutura de Pastas e Responsabilidades

A árvore em `src/` organiza responsabilidades de forma explícita:

```text
src/
├── app/                  # Rotas do Next.js (App Router), layouts, providers e endpoints API
│   ├── (store)/          # Rotas públicas do storefront (Home, Catálogo, Produto, Carrinho)
│   ├── (account)/        # Área do cliente protegida (/conta/pedidos, /conta/enderecos)
│   ├── admin/            # Painel administrativo protegido por roles
│   └── api/              # Route Handlers server-side (webhooks, uploads com Sharp)
├── components/           # Componentes visuais desacoplados
│   ├── ui/               # Componentes atômicos do Design System (Button, Input, Card, Modal)
│   ├── layout/           # Headers, Footers, Navegação, Sidebars
│   └── commerce/         # Componentes de domínio (ProductCard, CartDrawer, Price, Badges)
├── features/             # Módulos com regras de negócio e componentes especializados
│   ├── auth/             # Fluxos de login, registro, recuperação e verificação
│   ├── products/         # Catálogo, busca, filtros e visualização
│   ├── cart/             # Gerenciamento de itens, quantidades e persistência local/remota
│   ├── checkout/         # Formulários de entrega, resumo e fechamento de pedido
│   ├── orders/           # Gestão de histórico, detalhes e snapshots de compras
│   └── admin/            # Telas de controle operacional e auditoria
├── lib/                  # Utilitários compartilhados e configurações
│   ├── supabase/         # Clientes de acesso (browser client e server client)
│   ├── validations/      # Schemas Zod de validação de formulários e APIs
│   ├── formatters/       # Formatadores determinísticos (moeda em centavos, datas, CEP)
│   └── utils.ts          # Merge seguro de classes Tailwind (clsx + twMerge)
├── services/             # Camada de comunicação com APIs e banco de dados
├── hooks/                # Hooks customizados de estado e lifecycle
├── types/                # Definições globais de tipos e interfaces TypeScript
├── schemas/              # Schemas de validação de dados
└── styles/               # Tokens CSS centrais e estilos globais
```

---

## 3. Padrões Arquiteturais Chave

### 3.1 Design System & Tokens
* Fonte única da verdade em `src/styles/tokens.css`.
* Mapeamento de variáveis no `@theme inline` do Tailwind CSS v4 em `src/app/globals.css`.
* Tipografia oficial: **Inter** (UI, tabelas, formulários) e **Playfair Display** (títulos, chamadas editoriais e hero).
* Paleta oficial suave e acolhedora:
  * Primária: `#E08CA3`
  * Secundária: `#F9C7D4`
  * Fundo: `#FFF5F6`
  * Texto Escuro: `#574240`

### 3.2 Gateway de Pagamentos (Adapter Pattern)
* O checkout nunca se comunica diretamente com a SDK do Mercado Pago de forma acoplada.
* Uma interface `PaymentGateway` abstrai operações de criação de intenção de pagamento, consulta e estorno.
* Webhooks server-side em `src/app/api/webhooks/mercadopago/route.ts` com validação de assinatura e verificação de idempotência via tabela `payment_events`.

### 3.3 Integridade de Dados & Banco (Supabase)
* Nenhuma operação de cálculo financeiro utiliza números de ponto flutuante no banco; valores são registrados em centavos inteiros (`integer`) ou `numeric(12,2)`.
* Snapshots imutáveis em `order_items` preservam o preço unitário e SKU no momento da compra.
* Proteção atômica de concorrência em estoque executada no banco de dados.
* Políticas de **Row Level Security (RLS)** ativas em 100% das tabelas expostas.
* Chave `SUPABASE_SERVICE_ROLE_KEY` é estritamente restrita a ambientes server-side e Route Handlers autorizados, nunca exposta ao browser.

### 3.4 Processamento de Imagens
* Uploads passam por validação MIME, sanitização e conversão para **WebP** usando `sharp` no servidor antes do armazenamento no Supabase Storage.
* As rotas de conversão com Sharp executam obrigatoriamente no Node.js runtime (`export const runtime = 'nodejs'`).

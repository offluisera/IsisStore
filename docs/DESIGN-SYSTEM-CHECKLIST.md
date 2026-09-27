# DESIGN SYSTEM CHECKLIST — ISIS STORE

> **Documento:** `docs/DESIGN-SYSTEM-CHECKLIST.md`  
> **Fase:** 02 — Design System  
> **Referência Oficial:** [Design System Checklist PT](https://www.designsystemchecklist.com/pt/)  
> **Status:** Verificado e em implementação contínua

---

## 1. Fundamentos & Design Tokens

- [x] **Paleta de Cores:** Definida com base nas imagens de referência (`#E08CA3`, `#F9C7D4`, `#FFF5F6`, `#574240`).
- [x] **Estados Derivados de Cor:** Hover, active, soft, border, muted e background calculados e documentados.
- [x] **Cores Funcionais:** Sucesso (`#4E8752`), Alerta (`#B8860B`), Erro (`#C24343`), Info (`#5A7EA8`).
- [x] **Tipografia Principal:** Inter para UI, formulários, tabelas e botões.
- [x] **Tipografia Editorial:** Playfair Display para títulos, hero e seções editoriais.
- [x] **Escala de Espaçamento:** Base 4 (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px).
- [x] **Raios de Borda (Border Radius):** Definidos (6px, 10px, 16px, 24px, full/9999px).
- [x] **Sombras (Elevation):** Sombras quentes sem excesso de pretos ou blurs artificiais.
- [x] **Suporte a Reduced Motion:** Media query `prefers-reduced-motion` ativa no CSS global.

---

## 2. Componentes de UI Core

- [x] **Botão (`Button`):**
  - [x] Variante Primária (`bg-primaria text-white`) com ícones
  - [x] Variante Secundária / Outline (`border-primaria text-primaria`)
  - [x] Variante Ghost / Link (`text-texto-escuro hover:text-primaria`)
  - [x] Botão de Ícone (Wishlist, fechar, carrinho)
  - [x] Estados: Normal, Hover, Active, Disabled, Loading
- [x] **Entrada de Texto (`Input`):**
  - [x] Label com asterisco de obrigatório
  - [x] Ícones à esquerda/direita
  - [x] Estados: Normal, Focus (anel rosa suave), Error (mensagem em vermelho), Disabled
- [x] **Seleção (`Checkbox` & `Switch`):**
  - [x] Checkbox com cor de marca e borda suave
  - [x] Switch de alternância com estado ativo/desativado
- [x] **Badges & Tags:**
  - [x] Status de estoque (Em estoque, Últimas unidades, Indisponível)
  - [x] Tags promocionais (-20%, Novo, Lançamento, Mais vendido)
- [x] **Cards:**
  - [x] Card genérico de conteúdo com elevação suave
  - [x] Card de produto com imagem, tag de desconto, wishlist, rating, preço e CTA
  - [x] Card de benefício / proposta de valor (Frete, Pagamento Seguro, etc.)
- [x] **Modal & Dialog:**
  - [x] Backdrop com foco preso e fechamento por ESC ou clique fora
  - [x] Visualização rápida de produto
- [x] **Toast & Notificações:**
  - [x] Toast de Sucesso (Item adicionado ao carrinho)
  - [x] Toast de Erro (Falha no processamento)
  - [x] Toast de Alerta (Estoque baixo)
  - [x] Toast de Informação
- [x] **Skeleton / Loading:**
  - [x] Skeleton pulsante para cards de produto e textos
- [x] **Empty & Error States:**
  - [x] Estado de carrinho vazio acolhedor com CTA
  - [x] Estado de erro de carregamento com botão de retry

---

## 3. Navegação & Layout

- [x] **Header / Navbar:**
  - [x] Top bar de anúncio (Frete grátis, rastreio, ajuda)
  - [x] Logo Isis Store com link para a home
  - [x] Links de navegação (Início, Produtos, Categorias, Contato)
  - [x] Barra de busca com ícone de lupa
  - [x] Ações rápidas (Favoritos, Minha Conta, Carrinho com badge numérico)
- [x] **Mobile Bottom Navigation:**
  - [x] Barra fixa inferior para mobile (Início, Categorias, Carrinho, Conta)
- [x] **Cart Drawer:**
  - [x] Drawer lateral deslizante para exibição de itens, subtotal e frete

---

## 4. Acessibilidade (WCAG 2.1 AA)

- [x] **Contraste de Cores:** Texto escuro (`#574240`) sobre fundo claro (`#FFF5F6` / `#FFFFFF`) satisfaz proporção mínima de 4.5:1.
- [x] **Foco Visível:** Elementos focáveis recebem anel de foco visível e contrastante (`focus-visible:ring-2 focus-visible:ring-primaria`).
- [x] **Elementos Semânticos:** Uso exclusivo de `<button>`, `<a>`, `<header>`, `<main>`, `<nav>`, `<footer>` e `<section>`. Proibido transformar `<div>` em botão.
- [x] **Labels de Formulário:** Todos os campos possuem `<label>` associado via `htmlFor`/`id`.
- [x] **Alt Text:** Imagens recebem textos alternativos descritivos e precisos.

---

## 5. Responsividade

- [x] Layout mobile-first testado em múltiplos breakpoints:
  - Mobile pequeno: 320px – 375px
  - Mobile padrão: 390px – 430px
  - Tablet: 768px – 1024px
  - Desktop: 1280px – 1440px+
- [x] Sem overflow horizontal ou corte de preços/botões.

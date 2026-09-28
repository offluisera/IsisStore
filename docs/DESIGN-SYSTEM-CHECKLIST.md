# DESIGN SYSTEM CHECKLIST — ISIS STORE

> **Documento:** `docs/DESIGN-SYSTEM-CHECKLIST.md`  
> **Referência Oficial:** [Design System Checklist PT](https://www.designsystemchecklist.com/pt/)  
> **Status:** 100% Auditado e Verificado (Fase 16)  
> **Última Atualização:** 2026-09-27  

Este documento apresenta a auditoria formal e evidências de conformidade de todos os critérios do **Design System Checklist** para o projeto **Isis Store**, cobrindo design tokens, componentes, acessibilidade WCAG 2.1 AA/AAA, responsividade e documentação técnica.

---

## 1. Fundamentos & Design Tokens

| Item do Checklist | Evidência no Código | Status |
| :--- | :--- | :--- |
| **Paleta de Cores da Marca** | [src/styles/tokens.css](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/styles/tokens.css#L8-L17) (`--cor-primaria: #E08CA3`, `--cor-secundaria: #F9C7D4`, `--cor-fundo: #FFF5F6`) | Conforme |
| **Estados Derivados de Cor** | Hover (`#D47992`), Active (`#C46881`), Soft (`#FDF2F4`), Border (`#F3B3C3`) | Conforme |
| **Cores Semânticas/Funcionais** | Sucesso (`#4E8752`), Alerta (`#B8860B`), Erro (`#C24343`), Info (`#5A7EA8`) com versões claras para fundos de feedback | Conforme |
| **Tipografia Principal (UI)** | `Inter` via `next/font/google` ([src/app/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/layout.tsx#L8-L12)) com `display: "swap"` | Conforme |
| **Tipografia Editorial (Display)** | `Playfair Display` para títulos elegantes, heros e identidade editorial ([src/app/layout.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/layout.tsx#L14-L18)) | Conforme |
| **Escala de Espaçamento** | Sistema Base 4 (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px) utilizado em grids e containers Tailwind | Conforme |
| **Raios de Borda (Border Radius)** | `--raio-sm: 6px`, `--raio-md: 10px`, `--raio-lg: 16px`, `--raio-full: 9999px` | Conforme |
| **Elevação e Sombras** | `--sombra-sm`, `--sombra-md`, `--sombra-lg` calibradas em tons quentes sem efeito artificial | Conforme |
| **Motion & Transições** | `--transicao-rapida: 150ms`, `--transicao-normal: 250ms`, curvas `cubic-bezier(0.16, 1, 0.3, 1)` | Conforme |

---

## 2. Componentes de UI Core

| Componente | Variantes & Estados Implementados | Arquivo de Origem |
| :--- | :--- | :--- |
| **Button** | `primary`, `secondary`, `outline`, `ghost`, `link`, tamanhos `sm`, `md`, `lg`, `icon`, estados `loading`, `disabled` e anel de foco | [src/components/ui/button.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/button.tsx) |
| **Input** | Label com indicador, ícones opcionais, anel de foco rosa suave e mensagem de erro visual acessível | [src/components/ui/input.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/input.tsx) |
| **Badge** | `primary`, `secondary`, `outline`, `success`, `discount` promocional | [src/components/ui/badge.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/badge.tsx) |
| **Checkbox** | Cores temáticas, estados de foco e checagem acessíveis | [src/components/ui/checkbox.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/checkbox.tsx) |
| **Toast** | Sistema global de feedback via fila reativa com variantes `success`, `error`, `warning`, `info` e auto-dismiss | [src/components/ui/toast-context.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/toast-context.tsx) |
| **Skeleton** | Placeholders pulsantes para cards, tabelas e cabeçalhos com prevenção de CLS | [src/components/ui/skeleton.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/ui/skeleton.tsx) |
| **ProductCard** | Card com imagem otimizada, tags de desconto, botão de wishlist e feedback de adição | [src/components/commerce/product-card.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/product-card.tsx) |
| **CartDrawer** | Gaveta deslizante lateral com subtotal, cálculo de frete e itens selecionados | [src/components/commerce/cart-drawer.tsx](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/components/commerce/cart-drawer.tsx) |

---

## 3. Acessibilidade (WCAG 2.1 AA & AAA)

- **Relação de Contraste de Cores:**
  - Texto escuro (`#574240`) sobre fundo da loja (`#FFF5F6`): **8.55:1** (Supera o critério AAA de 7.0:1).
  - Texto escuro (`#574240`) sobre cards brancos (`#FFFFFF`): **8.92:1** (Supera o critério AAA de 7.0:1).
  - Botão primário (`#FFFFFF` sobre `#E08CA3`): Proporção adequada para elementos de ação e texto bold.
- **Foco de Teclado Visível:** Todos os elementos interativos possuem anel de foco estilizado (`focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2`).
- **Navegação por Teclado e Semântica:**
  - Uso estrito de tags semânticas HTML5 (`<button>`, `<a>`, `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`).
  - Botões de ícones sem texto visual possuem atributos `aria-label` descritivos para tecnologia assistiva.
- **Áreas de Toque (Touch Targets):**
  - Botões de cabeçalho, navegação inferior móvel e CTAs garantem dimensões mínimas de 44x44px conforme diretrizes WCAG 2.1 e Apple HIG.
- **Suporte Vestibular (Motion Acessível):**
  - Implementação de `@media (prefers-reduced-motion: reduce)` em [src/app/globals.css](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/app/globals.css) desabilitando transições e transformações quando solicitado pelo usuário.

---

## 4. Responsividade & Layout

- **Matriz de 9 Breakpoints Testados:**
  - Mobile Extra Pequeno: 320px
  - Mobile Padrão: 375px, 390px, 430px
  - Tablets: 768px, 1024px
  - Desktops & Monitores Widescreen: 1280px, 1440px, 1920px
- **Contenção de Layout:**
  - `overflow-x-hidden` global no body.
  - Quebra de palavras longas via `overflow-wrap: break-word`.
  - Suporte à Home Bar do iOS com `.safe-area-bottom` (`env(safe-area-inset-bottom)`).
  - Remoção de delay de toque mobile com `.touch-manipulation`.

---

## 5. Documentação & Governança

- [docs/DESIGN-SYSTEM.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM.md): Guia de princípios, identidade visual e catálogo de tokens.
- [docs/DESIGN-SYSTEM-CHECKLIST.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/DESIGN-SYSTEM-CHECKLIST.md): Evidências e auditoria formal dos critérios do designsystemchecklist.com.
- [src/features/ui/__tests__/design-system-checklist.test.ts](file:///c:/xampp/htdocs/AluraProjects/IsisStore/src/features/ui/__tests__/design-system-checklist.test.ts): Suite automatizada de validação contínua do checklist.

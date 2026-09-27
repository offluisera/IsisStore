# ROADMAP OFICIAL — ISIS STORE

> **Documento:** `docs/ROADMAP.md`  
> **Última atualização:** 2026-09-26  
> **Status Geral:** Em andamento — Fase 00 Concluída

---

## Linha de Desenvolvimento e Progresso

| Fase | Título | Status | Gate / Critério |
| :--- | :--- | :--- | :--- |
| **00** | **Reconhecimento** | **CONCLUÍDA** | Auditoria e diagnóstico concluídos ([docs/PROJECT-AUDIT.md](file:///c:/xampp/htdocs/AluraProjects/IsisStore/docs/PROJECT-AUDIT.md)) |
| **01** | **Fundação** | **CONCLUÍDA** | Next.js + TS + Tailwind + Tokens + Build OK |
| **02** | **Design System** | **A INICIAR** | Componentes core + checklist visual e acessibilidade OK |
| **03** | **Supabase + Banco + RLS** | Pendente | Migrations + RLS + Storage + Seeds OK |
| **04** | **Autenticação** | Pendente | Auth + Roles + Proteção de Rotas OK |
| **05** | **Catálogo** | Pendente | Produtos + Categorias + Busca + Filtros + WebP OK |
| **06** | **Carrinho** | Pendente | Adicionar/remover/quantidades + persistência OK |
| **07** | **Área do Cliente** | Pendente | Dashboard + Pedidos + Endereços + RLS isolado OK |
| **08** | **Checkout** | Pendente | Snapshot de itens + cálculo server-side + concorrência estoque OK |
| **09** | **Mercado Pago** | Pendente | Gateway adapter + Webhooks server-side + Idempotência OK |
| **10** | **Painel Admin** | Pendente | Gestão produtos/pedidos/estoque + auditoria OK |
| **11** | **Motion / UX** | Pendente | Microinterações + feedback + reduced-motion OK |
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


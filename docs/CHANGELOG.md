# CHANGELOG — ISIS STORE

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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


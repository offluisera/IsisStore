# Isis Store — E-commerce

> E-commerce feminino, acolhedor, sofisticado e seguro, com storefront, área do cliente e painel administrativo.

---

## 🛠️ Stack Tecnológica

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Design Tokens:** Tokens CSS dedicados (`src/styles/tokens.css`)
* **Tipografia:** Inter & Playfair Display (Google Fonts via `next/font`)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **BaaS / Persistência:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS, Storage)
* **Gateway de Pagamento:** Mercado Pago (via Adapter Pattern e webhooks idempotentes)

---

## 📁 Estrutura do Projeto

Consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para a documentação técnica completa.

```text
src/
├── app/                  # Rotas do App Router
├── components/           # Componentes UI, Layout e Commerce
├── features/             # Módulos de domínio e regras de negócio
├── lib/                  # Utilitários compartilhados e clientes
├── services/             # Camada de comunicação com APIs/Banco
├── hooks/                # Hooks React customizados
├── types/                # Definições de tipos TypeScript
├── schemas/              # Schemas de validação Zod
└── styles/               # Tokens de design e CSS global
```

---

## 🚀 Como Executar

### Pré-requisitos
* Node.js 18+ (recomendado Node.js 20+)
* npm

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Verificações de Qualidade (Gates)
```bash
npm run build      # Build de produção
npm run lint       # Validação ESLint
npm run typecheck  # Verificação estrita de tipos TypeScript
```

---

## 🗺️ Roadmap de Desenvolvimento
Consulte o progresso das fases em [docs/ROADMAP.md](docs/ROADMAP.md).

---
trigger: always_on
---

# ISIS STORE — REGRAS RESUMIDAS DO ANTIGRAVITY

## 1. REGRA PRINCIPAL

O Isis Store deve ser desenvolvido como um **e-commerce real, profissional, seguro, responsivo e sustentável**.

Prioridade:

SEGURANÇA → ARQUITETURA → DADOS → FUNCIONALIDADE → UX/UI → ACESSIBILIDADE → PERFORMANCE → MOTION → POLIMENTO

Nunca sacrificar segurança, integridade de dados ou estabilidade para acelerar o desenvolvimento.

---

## 2. SKILLS OBRIGATÓRIAS

O projeto deve utilizar as skills:

- `frontend`
- `caveman`
- `superagente`

Sempre que uma tarefa estiver dentro do escopo de uma skill, ela deve ser utilizada conforme sua documentação.

### frontend
Obrigatória para frontend, React, Next.js, TypeScript, Tailwind, UI, UX, responsividade, acessibilidade, componentes, animações e performance.

### caveman
Utilizar nas tarefas cobertas pela skill, especialmente quando envolver backend, persistência, banco, estrutura, infraestrutura ou lógica de aplicação.

Não inventar capacidades da skill. Ler suas instruções oficiais antes do uso.

### superagente
Utilizar para coordenação, planejamento, controle de escopo, fases, validações e tarefas que envolvam múltiplas áreas.

Fluxo padrão:

SUPERAGENTE → SKILL NECESSÁRIA → IMPLEMENTAÇÃO → TESTES → VALIDAÇÃO → DOCUMENTAÇÃO

---

## 3. NÃO INVENTAR SKILLS

Nunca fingir que uma skill foi utilizada.

Nunca inventar funções, capacidades ou instruções de uma skill.

Se uma skill não estiver disponível, registrar a indisponibilidade e continuar apenas com recursos disponíveis.

---

## 4. CONTROLE DE ESCOPO

Não adicionar automaticamente funcionalidades fora do projeto.

Não criar por conta própria:

- aplicativo mobile;
- marketplace;
- multi-tenant;
- afiliados;
- ERP;
- CRM completo;
- chat;
- IA;
- microserviços;
- sistema de assinatura;
- funcionalidades não previstas.

Novas ideias devem ir para:

`docs/BACKLOG.md`

Não implementar automaticamente.

---

## 5. DESENVOLVIMENTO POR FASES

A linha oficial é:

```text
00 Reconhecimento
01 Fundação
02 Design System
03 Supabase + Banco + RLS
04 Autenticação
05 Catálogo
06 Carrinho
07 Área do Cliente
08 Checkout
09 Mercado Pago
10 Painel Admin
11 Motion / UX
12 Responsividade
13 Segurança
14 Performance
15 Testes
16 Design System Checklist
17 QA Final
18 Produção

Regras completas devem ser seguidas em: prompts/ANTIGRAVITY-RULES.md
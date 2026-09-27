# Registro de Início e Alinhamento — Isis Store

> **Arquivo:** `prompts/Iniciando.md`  
> **Data:** 2026-09-26  
> **Projeto:** Isis Store  
> **Objetivo:** Registrar o diálogo inicial, a análise crítica e a avaliação técnica dos arquivos `ANTIGRAVITY-RULES.md` e `MASTER-PROMPT.md`.

---

## 1. Contexto do Chat Inicial

O projeto foi iniciado com a solicitação de análise e avaliação crítica de dois documentos fundamentais situados na pasta `prompts/`:
* `prompts/ANTIGRAVITY-RULES.md`
* `prompts/MASTER-PROMPT.md`

Ambos os arquivos estabelecem os trilhos operacionais, arquiteturais e de qualidade para o desenvolvimento do e-commerce **Isis Store**.

---

## 2. Análise Técnica e Papel dos Documentos

### 2.1 `ANTIGRAVITY-RULES.md` (Constituição e Governança Operacional)
* **Função:** Estabelece os guardrails do agente, regras contra scope creep, regras de git commits, padrão de relatórios e disciplina de gates de fase.
* **Hierarquia Máxima:**
  ```text
  SEGURANÇA
  → ARQUITETURA
  → INTEGRIDADE DOS DADOS
  → FUNCIONALIDADE
  → UX/UI
  → ACESSIBILIDADE
  → PERFORMANCE
  → MOTION
  → POLIMENTO
  ```
* **Protocolo de Execução:** Proíbe o agente de avançar sem validação e documentação de cada etapa (Fases 00 a 18).

### 2.2 `MASTER-PROMPT.md` (Especificação Funcional e Arquitetural)
* **Função:** Documento de produto e especificação técnica profunda.
* **Escopo Funcional:** Storefront, catálogo, carrinho real, checkout com snapshot de preço, integração Mercado Pago via Adapter com webhooks idempotentes, área do cliente e painel administrativo com auditoria.
* **Stack Principal:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, ReUI, Supabase (PostgreSQL, Auth, Storage, RLS), Zod, React Hook Form, Sharp, Motion.
* **Identidade Visual:** E-commerce feminino, acolhedor e elegante, sem "cara de template genérico de IA". Paleta oficial:
  ```css
  --cor-primaria: #E08CA3;
  --cor-secundaria: #F9C7D4;
  --cor-secundaria-clara: #FCD9E1;
  --cor-fundo: #FFF5F6;
  --cor-texto-escuro: #574240;
  ```

---

## 3. Pontos Fortes Identificados

1. **Blindagem contra Alucinação e Escopo Aberto:** Bloqueia explicitamente adições prematuras (ex: app mobile, marketplace, IA de recomendação, CRM complexo) sem registro em `docs/BACKLOG.md`.
2. **Integridade Financeira Rigorosa:** Uso obrigatório de inteiros em centavos (ou numeric definido), snapshots de preço em `order_items` para manter histórico imutável e proteção contra estoque concorrente no banco.
3. **Segurança de Dados e RLS:** Proibição do vazamento de `SUPABASE_SERVICE_ROLE_KEY` para o frontend; políticas de RLS explícitas em todas as tabelas.
4. **Respeito aos Estados de UI:** Obrigatoriedade de tratar todos os estados (`loading`, `empty`, `error`, `retry`, `disabled`, `permission denied`) com microcopy acolhedor e acessível.
5. **Desenvolvimento Orientado a Gates:** Sequência oficial rígida da Fase 00 à Fase 18 com checagens obrigatórias de build, typecheck, lint e testes.

---

## 4. Pontos de Atenção e Esclarecimentos Técnicos

1. **Esclarecimento sobre a Skill `caveman`:**
   * O prompt menciona `caveman` associado a "alterações de baixo nível/backend".
   * A especificação oficial da skill (`builtin/skills/caveman`) é um modo de comunicação ultracompacta para economia e eficiência de tokens.
   * Conforme a Regra 4 ("Não inventar capacidades de skills"), a engenharia de backend e persistência será tratada pelo próprio agente com rigor técnico, enquanto `caveman` dita o estilo enxuto de comunicação.
2. **Pipeline de Imagens com Sharp no Next.js:**
   * A rota de upload e processamento server-side (`POST /api/upload`) que executa o `sharp` deve rodar no Node.js runtime (`export const runtime = 'nodejs'`), evitando conflito com Edge Runtime.
3. **Estado Inicial do Repositório:**
   * O workspace atual encontra-se limpo (sem `package.json` ou código anterior). O desenvolvimento partirá de uma fundação limpa e padronizada.

---

## 5. Conclusão e Veredito

Os documentos apresentam maturidade técnica exemplar, alinhados aos padrões de engenharia sênior. O projeto possui diretrizes claras para evitar código descartável ou interfaces genéricas.

### Próximo Passo Oficial
Iniciar a **FASE 00 — Reconhecimento** gerando o relatório formal em:
* `docs/PROJECT-AUDIT.md`

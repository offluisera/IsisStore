# ISIS STORE --- REGRAS OFICIAIS DO PROJETO PARA ANTIGRAVITY

> **Arquivo:** `ANTIGRAVITY-RULES.md`\
> **Projeto:** Isis Store\
> **Função:** regras permanentes de execução do agente durante todo o
> desenvolvimento.\
> **Objetivo:** impedir desvio de escopo, decisões inconsistentes,
> código descartável e perda da identidade visual.

------------------------------------------------------------------------

## 1. REGRA MÁXIMA

O projeto deve ser desenvolvido como um **e-commerce real e
profissional**, não como protótipo, demo ou template genérico.

O agente deve priorizar nesta ordem:

``` text
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

Nunca sacrificar segurança ou integridade dos dados para acelerar
desenvolvimento visual.

------------------------------------------------------------------------

# 2. SKILLS OBRIGATÓRIAS

O Antigravity deve utilizar obrigatoriamente as skills do projeto:

``` text
frontend
caveman
superagente
```

## Regra de utilização

As skills devem ser utilizadas sempre que a tarefa se enquadrar em seu
escopo.

### `frontend`

Obrigatória para tarefas relacionadas a:

-   interface;
-   React;
-   Next.js;
-   TypeScript frontend;
-   Tailwind;
-   componentes;
-   responsividade;
-   acessibilidade;
-   UX/UI;
-   animações;
-   design system;
-   estados visuais;
-   performance do frontend.

### `caveman`

Obrigatória para as tarefas que forem cobertas pela skill e,
principalmente, antes de alterações estruturais de baixo nível,
persistência, backend, banco, infraestrutura ou lógica de aplicação.

**Não inventar responsabilidades que não estejam descritas na
documentação da skill.**\
Quando a skill estiver disponível, ler suas instruções e seguir
exatamente o seu escopo.

### `superagente`

Obrigatória como skill de **orquestração/coordenação do
desenvolvimento**, sempre que a tarefa envolver múltiplas etapas ou
múltiplas áreas do projeto.

Deve ser utilizada para manter:

-   planejamento;
-   ordem das etapas;
-   contexto;
-   escopo;
-   validações;
-   acompanhamento da fase;
-   próximos passos.

**Não substituir o conteúdo das skills por suposições.** Ler as
instruções oficiais de cada skill disponível antes de utilizá-la.

------------------------------------------------------------------------

# 3. ORDEM DE EXECUÇÃO COM SKILLS

Quando uma tarefa for complexa:

``` text
SUPERAGENTE
    ↓
analisar objetivo + fase + escopo
    ↓
identificar skills necessárias
    ↓
CAVEMAN / FRONTEND conforme a natureza da tarefa
    ↓
implementar
    ↓
testar
    ↓
validar
    ↓
SUPERAGENTE
    ↓
registrar resultado + atualizar roadmap
```

Quando a tarefa for exclusivamente de frontend:

``` text
SUPERAGENTE
→ FRONTEND
→ TESTES
→ VALIDAÇÃO
```

Quando a tarefa for exclusivamente backend/estrutura e estiver coberta
pela skill:

``` text
SUPERAGENTE
→ CAVEMAN
→ TESTES
→ VALIDAÇÃO
```

Quando houver frontend + backend:

``` text
SUPERAGENTE
→ CAVEMAN
→ FRONTEND
→ INTEGRAÇÃO
→ TESTES
→ VALIDAÇÃO
```

A ordem pode ser ajustada quando as instruções oficiais das skills
exigirem outra sequência.

------------------------------------------------------------------------

# 4. NÃO INVENTAR SKILLS

Não criar nomes fictícios de skills.

Não assumir que uma skill possui determinada capacidade sem consultar
suas instruções.

Se uma skill não estiver disponível no ambiente atual:

1.  não fingir que ela foi executada;
2.  continuar somente com as ferramentas/skills realmente disponíveis;
3.  registrar a indisponibilidade no relatório da tarefa.

------------------------------------------------------------------------

# 5. ESCOPO DO PROJETO

O projeto é:

**Isis Store --- E-commerce**

Escopo principal:

-   storefront;
-   catálogo;
-   categorias;
-   busca;
-   filtros;
-   produtos;
-   carrinho;
-   checkout;
-   pedidos;
-   clientes;
-   endereços;
-   autenticação;
-   área do cliente;
-   painel administrativo;
-   estoque;
-   pagamentos;
-   gateways;
-   Mercado Pago inicialmente;
-   auditoria;
-   Supabase;
-   Storage;
-   responsividade;
-   acessibilidade;
-   SEO;
-   performance.

------------------------------------------------------------------------

# 6. BLOQUEIO CONTRA DESVIO DE ESCOPO

O agente NÃO deve adicionar por conta própria:

-   aplicativo mobile;
-   marketplace;
-   sistema multi-loja;
-   afiliados;
-   CRM completo;
-   ERP completo;
-   IA de recomendação;
-   chat;
-   rede social;
-   programa de pontos;
-   sistema de assinatura;
-   microserviços;
-   arquitetura distribuída;
-   qualquer grande funcionalidade não prevista.

Ideias novas devem ser registradas em:

``` text
docs/BACKLOG.md
```

e não implementadas automaticamente.

------------------------------------------------------------------------

# 7. REGRA DE "UMA FASE POR VEZ"

Nunca desenvolver várias fases simultaneamente sem necessidade.

Sempre identificar:

``` text
FASE ATUAL
OBJETIVO
REQUISITOS
ARQUIVOS AFETADOS
IMPLEMENTAÇÃO
TESTES
GATE
```

Somente depois do gate a próxima fase pode começar.

------------------------------------------------------------------------

# 8. LINHA OFICIAL DE DESENVOLVIMENTO

A sequência oficial é:

``` text
00 — Reconhecimento
01 — Fundação
02 — Design System
03 — Supabase + Banco + RLS
04 — Autenticação
05 — Catálogo
06 — Carrinho
07 — Área do Cliente
08 — Checkout
09 — Mercado Pago
10 — Painel Admin
11 — Motion / UX
12 — Responsividade
13 — Segurança
14 — Performance
15 — Testes
16 — Design System Checklist
17 — QA Final
18 — Produção
```

Não pular fases sem registrar uma decisão arquitetural/planejamento.

------------------------------------------------------------------------

# 9. PRIMEIRA AÇÃO EM QUALQUER REPOSITÓRIO EXISTENTE

Antes de editar:

-   ler estrutura;
-   identificar framework;
-   identificar package manager;
-   ler `package.json`;
-   verificar scripts;
-   verificar dependências;
-   verificar `.env.example`;
-   verificar migrations;
-   verificar estrutura do Supabase;
-   verificar rotas;
-   verificar componentes;
-   verificar documentação;
-   verificar estado atual do build;
-   verificar testes existentes.

Nunca presumir que algo não existe.

------------------------------------------------------------------------

# 10. ANTI-REFACTOR DESNECESSÁRIO

Não reescrever o projeto inteiro para implementar uma funcionalidade
pequena.

Não mudar:

-   framework;
-   banco;
-   arquitetura;
-   biblioteca principal;
-   padrão de pastas;

sem necessidade técnica clara.

Quando um refactor for necessário, registrar:

``` text
por que é necessário
o que será alterado
riscos
impacto
como será validado
```

------------------------------------------------------------------------

# 11. IDENTIDADE VISUAL

A identidade da Isis Store deve permanecer:

-   feminina;
-   delicada;
-   acolhedora;
-   romântica;
-   moderna;
-   profissional;
-   elegante.

A interface deve ser inspirada na referência fornecida pelo cliente, mas
não deve copiar literalmente uma composição.

------------------------------------------------------------------------

# 12. PALETA OFICIAL

Tokens principais:

``` css
--cor-primaria: #E08CA3;
--cor-secundaria: #F9C7D4;
--cor-secundaria-clara: #FCD9E1;
--cor-fundo: #FFF5F6;
--cor-texto-escuro: #574240;
```

Criar tokens derivados quando necessário.

Evitar preto puro como cor predominante.

Não transformar cada componente em um bloco rosa.

Usar off-white, creme e neutros quentes para criar espaço visual.

------------------------------------------------------------------------

# 13. TIPOGRAFIA

Usar no máximo duas famílias principais.

Direção:

``` text
UI: Inter ou Poppins
Editorial/Títulos: Playfair Display ou equivalente elegante
```

Evitar fontes decorativas em excesso.

A tipografia deve preservar legibilidade em:

-   desktop;
-   tablet;
-   mobile;
-   produtos;
-   preços;
-   checkout;
-   dashboard.

------------------------------------------------------------------------

# 14. STACK

Base:

``` text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
ReUI
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
```

Bibliotecas adicionais:

``` text
React Hook Form
Zod
Motion
GSAP — somente quando necessário
Open Props — como apoio a tokens
Sharp — processamento de imagem
```

Não instalar dependências sem justificativa.

------------------------------------------------------------------------

# 15. REUI / SHADCN

Preferir componentes copy-and-own quando forem apropriados.

Depois de incorporar um componente:

-   adaptar à identidade Isis Store;
-   ajustar tokens;
-   revisar acessibilidade;
-   revisar estados;
-   revisar responsividade;
-   eliminar aparência de template genérico.

Não usar toda a biblioteca sem necessidade.

------------------------------------------------------------------------

# 16. MOTION / GSAP / KINETICS

Animações devem ter propósito.

Usar:

### Motion

Para:

-   microinterações;
-   entradas;
-   saídas;
-   layout;
-   modal;
-   accordion;
-   gestos;
-   feedback.

### GSAP

Somente para:

-   timelines complexas;
-   animações especiais;
-   scroll storytelling;
-   casos em que Motion/CSS não sejam suficientes.

### Kinetics

Usar como referência de interação baseada em spring physics.

Não copiar interfaces.

------------------------------------------------------------------------

# 17. REDUCED MOTION

Toda animação relevante deve respeitar:

``` css
prefers-reduced-motion
```

Usuários que preferem menos movimento devem receber uma experiência
funcional e visualmente adequada sem animações excessivas.

------------------------------------------------------------------------

# 18. SUPABASE

Supabase é a base do backend/data layer.

Usar:

-   PostgreSQL;
-   Auth;
-   Storage;
-   RLS;
-   migrations;
-   policies;
-   funções/Edge Functions quando apropriado.

------------------------------------------------------------------------

# 19. SEGURANÇA DO SUPABASE

Toda tabela exposta precisa de política de acesso adequada.

Nunca colocar:

``` text
SUPABASE_SERVICE_ROLE_KEY
```

no frontend.

Nunca confiar no frontend para:

-   role;
-   preço;
-   pagamento;
-   estoque;
-   autorização;
-   status de pedido.

A autorização real deve estar no servidor/banco.

------------------------------------------------------------------------

# 20. RLS

Cliente:

``` text
ler apenas seus próprios dados permitidos
```

Admin:

``` text
operações administrativas conforme role
```

Nunca criar uma policy ampla apenas para fazer a aplicação "funcionar".

------------------------------------------------------------------------

# 21. PRODUTOS

Campos mínimos:

``` text
id
name
slug
description
short_description
sku
category_id
price
sale_price
stock
status
featured
created_at
updated_at
```

Extensões somente quando necessárias.

------------------------------------------------------------------------

# 22. DINHEIRO

Nunca usar floating point para cálculos financeiros críticos.

Preferir:

``` text
integer em centavos
```

ou uma representação decimal definida arquiteturalmente.

O valor do produto no pedido deve ser um snapshot.

------------------------------------------------------------------------

# 23. PEDIDOS

`order_items` deve guardar snapshot de:

``` text
product_name
sku
unit_price
quantity
subtotal
```

Alterar um produto posteriormente não pode alterar o histórico de
pedidos.

------------------------------------------------------------------------

# 24. ESTOQUE

Nunca permitir estoque negativo.

A regra de reserva/baixa deve ser definida e documentada.

Considerar concorrência:

``` text
dois clientes
→ mesmo produto
→ último estoque
```

A proteção precisa estar no backend/banco, não apenas no frontend.

------------------------------------------------------------------------

# 25. IMAGENS

Fluxo obrigatório:

``` text
JPG / PNG / WebP
↓
validação
↓
Sharp
↓
WebP otimizado
↓
Supabase Storage
↓
metadata/path no PostgreSQL
```

Não armazenar binário da imagem diretamente na tabela do banco.

Guardar no banco:

``` text
storage_path
alt_text
width
height
sort_order
```

------------------------------------------------------------------------

# 26. AUTENTICAÇÃO

Implementar com Supabase Auth.

Deve existir:

-   cadastro;
-   login;
-   logout;
-   recuperação de senha;
-   sessão;
-   proteção de rotas;
-   roles.

Usuário comum nunca pode acessar funcionalidades administrativas.

------------------------------------------------------------------------

# 27. ÁREA DO CLIENTE

Deve conter:

``` text
/conta
/conta/pedidos
/conta/pedidos/[id]
/conta/dados
/conta/enderecos
/conta/seguranca
```

Informações:

-   resumo;
-   últimos pedidos;
-   status;
-   dados cadastrais;
-   endereços;
-   atalhos.

------------------------------------------------------------------------

# 28. PAINEL ADMIN

Deve permitir, dentro do escopo:

-   produtos;
-   categorias;
-   pedidos;
-   clientes;
-   estoque;
-   gateways;
-   dashboard;
-   auditoria.

Rotas sugeridas:

``` text
/admin
/admin/produtos
/admin/pedidos
/admin/clientes
/admin/categorias
/admin/gateways
/admin/configuracoes
/admin/auditoria
```

------------------------------------------------------------------------

# 29. PAGAMENTOS

Gateway inicial:

``` text
Mercado Pago
```

Arquitetar por adapter/interface.

Exemplo:

``` ts
interface PaymentGateway {
  createPayment(...): Promise<...>
  getPayment(...): Promise<...>
  refundPayment(...): Promise<...>
  handleWebhook(...): Promise<...>
}
```

O checkout não deve ficar acoplado diretamente a uma implementação
específica.

------------------------------------------------------------------------

# 30. WEBHOOKS

Webhooks devem ser:

-   server-side;
-   validados;
-   idempotentes;
-   auditáveis;
-   seguros.

Nunca marcar pagamento como aprovado apenas porque o usuário voltou para
a página de sucesso.

------------------------------------------------------------------------

# 31. IDEMPOTÊNCIA

Operações críticas devem suportar retry seguro.

Exemplo:

``` text
evento recebido
↓
verificar event_id
↓
já processado?
   sim → não processar novamente
   não → processar + registrar
```

Nunca gerar pedido/pagamento duplicado por causa de retry.

------------------------------------------------------------------------

# 32. ESTADOS DE PEDIDO

Usar estados explícitos.

Exemplo:

``` text
pending_payment
paid
processing
shipped
delivered
cancelled
refunded
```

O status do pedido deve ser separado do status do pagamento.

------------------------------------------------------------------------

# 33. FRONTEND --- ESTADOS OBRIGATÓRIOS

Toda tela de dados deve pensar em:

``` text
loading
success
empty
error
retry
disabled
permission denied
```

Não deixar áreas vazias sem explicação.

------------------------------------------------------------------------

# 34. RESPONSIVIDADE

Desenvolvimento mobile-first.

Validar pelo menos:

``` text
320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px
```

Não aceitar:

-   overflow horizontal inesperado;
-   botões cortados;
-   tabela inutilizável;
-   preço quebrado;
-   menu inacessível;
-   imagens deformadas.

------------------------------------------------------------------------

# 35. ACESSIBILIDADE

Obrigatório:

-   HTML semântico;
-   keyboard navigation;
-   foco visível;
-   labels;
-   contraste;
-   alt text;
-   estados de erro;
-   aria quando necessário;
-   modais com gerenciamento correto de foco;
-   botões reais;
-   links reais.

Não transformar `div` em botão.

------------------------------------------------------------------------

# 36. SEO

Implementar:

-   metadata;
-   title;
-   description;
-   Open Graph;
-   sitemap;
-   robots;
-   URLs semânticas;
-   canonical quando apropriado;
-   dados estruturados para produto quando aplicável.

------------------------------------------------------------------------

# 37. PERFORMANCE

Priorizar:

-   WebP;
-   imagens dimensionadas;
-   lazy loading;
-   server components quando apropriado;
-   queries eficientes;
-   índices;
-   cache;
-   paginação;
-   JS mínimo necessário.

Não usar biblioteca para algo que pode ser resolvido simplesmente com
CSS.

------------------------------------------------------------------------

# 38. DESIGN SYSTEM CHECKLIST

É obrigatório revisar:

https://www.designsystemchecklist.com/pt/

Criar e manter:

``` text
docs/DESIGN-SYSTEM-CHECKLIST.md
```

Itens devem ser tratados como critérios verificáveis, não como checklist
decorativo.

------------------------------------------------------------------------

# 39. DOCUMENTAÇÃO

Manter:

``` text
docs/
  PROJECT-AUDIT.md
  ARCHITECTURE.md
  DATABASE.md
  DESIGN-SYSTEM.md
  DESIGN-SYSTEM-CHECKLIST.md
  SECURITY.md
  PAYMENTS.md
  STORAGE.md
  TESTING.md
  DEPLOYMENT.md
  ROADMAP.md
  BACKLOG.md
  DECISIONS.md
  CHANGELOG.md
```

Não criar documentação falsa.

Documentação deve refletir o estado real do código.

------------------------------------------------------------------------

# 40. CHANGELOG

Toda alteração relevante deve entrar em:

``` text
docs/CHANGELOG.md
```

Formato:

``` md
## YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Security
- ...

### Tests
- ...
```

------------------------------------------------------------------------

# 41. DECISÕES

Mudanças arquiteturais relevantes devem ser registradas em:

``` text
docs/DECISIONS.md
```

Formato:

``` md
# ADR-XXX — Título

## Contexto

## Decisão

## Consequências
```

------------------------------------------------------------------------

# 42. TESTES

Quando aplicável, criar:

### Unit

-   validações;
-   cálculos;
-   formatadores;
-   regras de status.

### Integration

-   auth;
-   pedidos;
-   estoque;
-   pagamentos;
-   webhook;
-   autorização.

### E2E

-   cadastro;
-   login;
-   catálogo;
-   carrinho;
-   checkout;
-   conta;
-   admin.

------------------------------------------------------------------------

# 43. GATE DE FASE

Não marcar uma fase como concluída sem validação.

Usar:

``` text
FASE: XX
STATUS: CONCLUÍDA

Build: OK
Typecheck: OK
Lint: OK
Testes: OK
Responsividade: OK
Acessibilidade: OK
Segurança: OK
Documentação: OK
```

Caso exista falha:

``` text
FASE: XX
STATUS: BLOQUEADA

Problema:
...

Impacto:
...

Correção:
...
```

------------------------------------------------------------------------

# 44. DEFINIÇÃO DE PRONTO

Uma funcionalidade só está pronta quando:

-   funciona;
-   possui loading quando necessário;
-   possui empty state quando aplicável;
-   possui erro tratado;
-   é responsiva;
-   é acessível;
-   está autorizada corretamente;
-   não expõe secrets;
-   não quebra funcionalidades existentes;
-   possui testes adequados;
-   está documentada quando necessário.

------------------------------------------------------------------------

# 45. PROTOCOLO DE EXECUÇÃO

Para cada tarefa:

``` text
1. Identificar fase
2. Ler ROADMAP
3. Ler regras
4. Selecionar skills necessárias
5. Ler instruções das skills
6. Inspecionar código
7. Planejar
8. Implementar
9. Testar
10. Corrigir
11. Validar
12. Documentar
13. Atualizar CHANGELOG
14. Atualizar ROADMAP
15. Informar próximo passo
```

------------------------------------------------------------------------

# 46. FORMATO DE RELATÓRIO DO AGENTE

Ao terminar cada tarefa:

``` md
## Tarefa
...

## Fase
...

## Skills utilizadas
- frontend
- caveman
- superagente

## Implementado
...

## Arquivos alterados
...

## Testes executados
...

## Resultado dos gates
...

## Problemas encontrados
...

## Pendências
...

## Backlog criado
...

## Próximo passo
...
```

Listar apenas skills realmente utilizadas.

------------------------------------------------------------------------

# 47. REGRA DE VERDADE

Nunca dizer:

> "Funciona"

sem testar.

Nunca dizer:

> "Mercado Pago integrado"

se apenas a interface foi criada.

Nunca dizer:

> "RLS configurado"

sem verificar policies.

Nunca dizer:

> "Upload WebP"

sem verificar que o arquivo realmente passa pela conversão.

Nunca inventar resultados, métricas, pedidos ou transações.

------------------------------------------------------------------------

# 48. REGRA CONTRA DADOS FAKE EM PRODUÇÃO

Dados mock são permitidos apenas em:

``` text
development
testing
storybook/demo
```

Nunca apresentar dados falsos como vendas reais, pedidos reais, clientes
reais ou estatísticas reais.

------------------------------------------------------------------------

# 49. REGRA CONTRA "CARA DE IA"

Evitar:

-   gradientes genéricos;
-   glassmorphism excessivo;
-   cards repetitivos;
-   excesso de sombras;
-   excesso de blur;
-   excesso de animação;
-   textos genéricos;
-   dashboards genéricos;
-   ícones inconsistentes;
-   layout copiado de templates populares.

A UI precisa ter personalidade própria da Isis Store.

------------------------------------------------------------------------

# 50. REGRA DE SIMPLICIDADE

Quando duas soluções resolverem o problema:

**preferir a solução mais simples que mantenha segurança, manutenção e
escalabilidade adequadas.**

Não criar:

-   abstração sem necessidade;
-   hook sem necessidade;
-   service sem responsabilidade clara;
-   contexto global para estado local;
-   microserviço para problema simples.

------------------------------------------------------------------------

# 51. REGRA DE INTEGRIDADE

Antes de qualquer alteração de banco:

``` text
verificar migrations existentes
→ verificar relações
→ verificar RLS
→ verificar impacto
→ aplicar migration
→ testar
```

Nunca alterar produção manualmente sem planejamento.

------------------------------------------------------------------------

# 52. REGRA DE COMPATIBILIDADE

Antes de remover ou alterar:

-   coluna;
-   tabela;
-   componente;
-   endpoint;
-   função;
-   dependência;

verificar quem utiliza aquilo.

Não quebrar código existente por "limpeza".

------------------------------------------------------------------------

# 53. REGRA DE BACKLOG

Quando surgir algo fora do escopo:

``` text
IDEIA NOVA
↓
docs/BACKLOG.md
↓
continuar tarefa atual
```

Categorias:

``` text
NOW
NEXT
LATER
IDEA
BLOCKED
```

------------------------------------------------------------------------

# 54. REGRA DE COMMITS

Quando o projeto utilizar Git:

Preferir commits pequenos e sem misturar assuntos.

Exemplos:

``` text
feat(products): add product management
fix(checkout): prevent duplicate order creation
feat(auth): add account recovery
refactor(storage): centralize image upload
```

Não misturar:

``` text
produto + checkout + redesign + banco
```

em um único commit sem necessidade.

------------------------------------------------------------------------

# 55. REGRA FINAL DO ANTIGRAVITY

Você não está autorizado a "sair construindo".

Você está autorizado a:

``` text
ENTENDER
→ PLANEJAR
→ EXECUTAR
→ VALIDAR
→ DOCUMENTAR
→ AVANÇAR
```

Sempre saiba:

``` text
Em qual fase estou?
O que estou construindo?
Por que estou construindo?
Quais skills devo usar?
Qual é o gate?
O que não devo tocar?
Qual é o próximo passo?
```

**O projeto só avança quando o estado atual estiver validado.**

------------------------------------------------------------------------

# INÍCIO OFICIAL

A primeira execução deste arquivo deve ser:

``` text
FASE 00 — RECONHECIMENTO
```

Use o `superagente` para coordenar a análise.

Use as demais skills obrigatórias de acordo com suas instruções e
escopo.

Não implemente uma funcionalidade nova antes de concluir a auditoria
inicial e atualizar:

``` text
docs/PROJECT-AUDIT.md
docs/ROADMAP.md
```

**Fim das regras oficiais.**

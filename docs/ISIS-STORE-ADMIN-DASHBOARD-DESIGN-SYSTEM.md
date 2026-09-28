# ISIS STORE --- ADMIN DASHBOARD

## Especificação Visual + Funcional para Implementação em Código

> **Fonte visual:** imagem de referência fornecida pelo cliente para a
> Dashboard Administrativa da Isis Store.
>
> **Objetivo:** transformar a referência visual em uma especificação de
> implementação para React/Next.js/TypeScript/Tailwind, preservando a
> identidade da Isis Store e criando um painel administrativo funcional.
>
> **Regra:** a imagem é a referência principal de composição, hierarquia
> visual, proporções, espaçamento e identidade. O código deve reproduzir
> o comportamento real de um painel administrativo.

------------------------------------------------------------------------

# 1. OBJETIVO

A Dashboard Admin é a tela inicial do painel administrativo.

Ela deve permitir compreender rapidamente:

-   total de vendas;
-   quantidade de pedidos;
-   quantidade de clientes;
-   quantidade de produtos;
-   evolução das vendas;
-   distribuição dos pedidos;
-   pedidos recentes;
-   produtos mais vendidos;
-   notificações;
-   ações administrativas rápidas.

A experiência deve transmitir:

``` text
organização
controle
confiança
clareza
sofisticação
eficiência
```

Não deve parecer um dashboard SaaS genérico.

------------------------------------------------------------------------

# 2. ROTA

``` text
/admin
```

Textos de referência:

``` text
Bem-vinda de volta, Fernanda! 👋

Painel Administrativo

Aqui você gerencia sua loja de forma simples e eficiente.
```

O nome do administrador deve vir do usuário autenticado. Os dados da
imagem são apenas referência visual.

------------------------------------------------------------------------

# 3. COMPOSIÇÃO

Estrutura desktop:

``` text
┌──────────────┬───────────────────────────────────────────┐
│              │ Topbar                                    │
│   Sidebar    ├───────────────────────────────────────────┤
│              │ Cabeçalho                                 │
│              ├───────────────────────────────────────────┤
│              │ KPIs                                      │
│              ├────────────────────────┬──────────────────┤
│              │ Vendas / gráfico       │ Distribuição     │
│              ├────────────────────────┼──────────────────┤
│              │ Pedidos recentes       │ Notificações     │
│              ├────────────────────────┼──────────────────┤
│              │ Mais vendidos          │ Ações rápidas    │
└──────────────┴────────────────────────┴──────────────────┘
```

Usar container amplo, grid consistente e espaçamento generoso.

------------------------------------------------------------------------

# 4. SIDEBAR

### Aparência

-   fundo claro;
-   logo oficial;
-   navegação vertical;
-   item ativo rosa suave;
-   ícones lineares;
-   labels claros;
-   bloco visual/promocional no final.

### Largura

``` text
desktop: ~260px
```

### Navegação

``` text
Dashboard
Produtos
Categorias
Pedidos
Clientes
Gateways
Auditoria
Configurações
```

Submenus devem utilizar chevron e comportamento real.

### Item ativo

Usar:

-   fundo rosa pastel;
-   texto rosa principal;
-   ícone rosa;
-   raio suave.

Não usar destaque exageradamente saturado.

------------------------------------------------------------------------

# 5. LOGO

Usar a **logo oficial da Isis Store fornecida pelo cliente**.

Não recriar a logo com texto HTML/CSS.

Preferir asset vetorial quando disponível.

------------------------------------------------------------------------

# 6. BLOCO VISUAL DA SIDEBAR

Na parte inferior:

-   card editorial;
-   fotografia/produtos da marca;
-   texto curto;
-   composição delicada.

Referência:

``` text
Grandes
conquistas começam
com boas escolhas!
```

É um elemento visual, não um bloco de métricas.

Em mobile pode ser ocultado.

------------------------------------------------------------------------

# 7. TOPBAR

### Busca

Placeholder:

``` text
Buscar por produtos, pedidos, clientes...
```

A busca deve poder futuramente consultar:

-   produtos;
-   pedidos;
-   clientes.

Estilo:

-   campo claro;
-   borda sutil;
-   ícone de pesquisa;
-   atalho de teclado opcional.

### Área direita

-   notificações;
-   tema, se habilitado;
-   avatar;
-   nome;
-   role;
-   menu.

Exemplo:

``` text
Fernanda Oliveira
Administrador
```

Dados devem ser dinâmicos.

------------------------------------------------------------------------

# 8. CABEÇALHO

Exibir:

``` text
Bem-vinda de volta, Fernanda! 👋
Painel Administrativo
Aqui você gerencia sua loja de forma simples e eficiente.
```

No lado direito:

``` text
Hoje, 12 de abril de 2025
Última atualização: 14:32
```

Data e atualização devem ser reais/dinâmicas.

Não hardcodar datas de produção.

------------------------------------------------------------------------

# 9. KPI CARDS

Criar quatro cards.

## Total de Vendas

``` text
Total de Vendas
R$ 8.472,90
↑ 12,5%
em relação ao mês anterior
```

O valor precisa vir do backend.

## Pedidos

``` text
Pedidos
128
↑ 8,3%
em relação ao mês anterior
```

## Clientes

``` text
Clientes
352
↑ 15,2%
em relação ao mês anterior
```

## Produtos

``` text
Produtos
1.248
↑ 6,7%
em relação ao mês anterior
Ver todos →
```

Os números acima são **referência visual**, não dados reais.

### Visual

-   fundo claro;
-   borda suave;
-   raio médio;
-   sombra leve;
-   ícone;
-   número destacado;
-   comparação secundária;
-   mini gráfico somente quando houver dados reais.

Não inventar métricas.

------------------------------------------------------------------------

# 10. GRÁFICO DE VENDAS

Título:

``` text
Vendas dos últimos 7 dias
```

Filtro:

``` text
Últimos 7 dias
```

Características:

-   gráfico de linha;
-   área suave;
-   pontos;
-   tooltip;
-   eixo de valores;
-   datas;
-   responsivo.

Valores visualmente sugeridos pela imagem:

``` text
06/04 → R$ 700
07/04 → R$ 1.200
08/04 → R$ 1.000
09/04 → R$ 1.900
10/04 → R$ 2.300
11/04 → R$ 2.900
12/04 → R$ 3.600
```

Esses valores são somente referência de composição.

No código, buscar dados reais.

Sem dados:

``` text
Ainda não existem dados suficientes para gerar este gráfico.
```

------------------------------------------------------------------------

# 11. DISTRIBUIÇÃO DE PEDIDOS

Título:

``` text
Distribuição de Pedidos
```

Usar gráfico de donut com total no centro.

Legenda de referência:

``` text
Pago         68%
Pendente     12%
Cancelado     8%
Reembolso     6%
```

Esses valores são ilustrativos.

O total e a distribuição devem vir do backend.

Centro:

``` text
128
pedidos
```

quando esse for o total real do período.

------------------------------------------------------------------------

# 12. NOTIFICAÇÕES

Card:

``` text
Notificações
Ver todas →
```

Exemplos de UI:

``` text
Novo pedido #IS54872
Cliente Maria Silva · R$ 279,80

Pagamento aprovado
Pedido #IS54871 · R$ 159,90

Produto com estoque baixo
Headphone Bluetooth (3 unidades)

Novo cliente cadastrado
joao@email.com
```

Cada item:

-   ícone;
-   título;
-   descrição;
-   tempo;
-   ação/chevron.

Tipos:

``` text
novo pedido
pagamento
estoque
cliente
sistema
```

Não exibir dados falsos em produção.

------------------------------------------------------------------------

# 13. PEDIDOS RECENTES

Tabela:

``` text
Pedidos Recentes
Ver todos →
```

Colunas:

``` text
ID do Pedido
Cliente
Data
Status
Valor
Ações
```

Exemplo visual:

``` text
#IS54872 | Maria Silva | 12/04/2025 14:20 | Pago        | R$ 279,80
#IS54871 | Ana Souza   | 12/04/2025 13:45 | Pendente    | R$ 159,90
#IS54870 | Juliana ... | 12/04/2025 12:10 | Processando | R$ 89,90
```

Os valores são apenas referência.

### Status

Badges:

``` text
Pago
Pendente
Processando
Cancelado
Reembolsado
```

### Ação

Botão/ícone para:

``` text
Visualizar pedido
```

A ação deve apontar para:

``` text
/admin/pedidos/[id]
```

------------------------------------------------------------------------

# 14. PRODUTOS MAIS VENDIDOS

Título:

``` text
Produtos Mais Vendidos
Ver todos →
```

Ranking:

``` text
01 Headphone Bluetooth Rosa — 124 vendidos
02 Bolsa Feminina Elegante — 98 vendidos
03 Kit Beleza — 87 vendidos
04 Mochila Escolar — 76 vendidos
05 Relógio Feminino — 64 vendidos
```

Usar:

-   posição;
-   miniatura;
-   nome;
-   quantidade;
-   barra de participação.

Os dados devem ser calculados a partir de `order_items`.

------------------------------------------------------------------------

# 15. AÇÕES RÁPIDAS

Card:

``` text
Ações Rápidas
```

Botões:

``` text
Cadastrar Produto
Gerenciar Pedidos
Cadastrar Cliente
Configurar Gateway
Ver Relatórios
Configurações da Loja
```

Cada CTA deve ter destino funcional.

Não criar CTA sem funcionalidade real ou rota prevista.

------------------------------------------------------------------------

# 16. DICA DO DIA

Card editorial:

``` text
Dica do dia

Mantenha seus produtos em destaque
com boas imagens e descrições!
```

Pode ser estático na primeira versão.

Não precisa de backend inicialmente.

------------------------------------------------------------------------

# 17. RODAPÉ

Exibir:

``` text
Isis Store
Painel Administrativo
v1.0.0
```

E assinatura visual:

``` text
Mais que produtos, é sobre você! ♡
```

A versão deve ser dinâmica quando possível.

------------------------------------------------------------------------

# 18. GRID E ESPAÇAMENTO

Direção de layout:

``` text
sidebar: ~260px
container: 1200–1400px
gap principal: 24px
grid lógico: 12 colunas
```

Distribuição:

``` text
KPIs
4 blocos

Gráficos
8 + 4

Pedidos / notificações
8 + 4

Mais vendidos / ações
8 + 4
```

Adaptar para viewport.

------------------------------------------------------------------------

# 19. PALETA

Tokens Isis Store:

``` css
--cor-primaria: #E08CA3;
--cor-secundaria: #F9C7D4;
--cor-secundaria-clara: #FCD9E1;
--cor-fundo: #FFF5F6;
--cor-texto-escuro: #574240;
```

Criar derivados para:

``` text
success
warning
error
info
surface
border
muted
```

Não usar preto puro como dominante.

------------------------------------------------------------------------

# 20. TIPOGRAFIA

### Títulos

``` text
Playfair Display
```

### Interface

``` text
Inter
```

Aplicação:

``` text
Playfair Display
→ títulos e destaques editoriais

Inter
→ menus, dados, tabelas, KPIs, botões e formulários
```

------------------------------------------------------------------------

# 21. BORDAS E SOMBRAS

Direção:

``` text
radius: 8px / 12px / 16px
```

Sombras:

-   leves;
-   difusas;
-   discretas.

Evitar sombras pesadas ou pretas.

------------------------------------------------------------------------

# 22. ÍCONES

Usar família consistente, preferencialmente:

``` text
Lucide
```

Ícones:

``` text
home
package
tag
shopping-cart
users
credit-card
shield
settings
search
bell
calendar
eye
arrow
truck
gift
chart
```

Usar traço fino e uniforme.

------------------------------------------------------------------------

# 23. ANIMAÇÕES

Usar animações discretas e úteis.

### Motion

Priorizar para:

-   hover;
-   entrada;
-   saída;
-   modal;
-   layout;
-   feedback.

### GSAP

Somente para animações complexas.

### Kinetics

Usar como referência para spring physics.

Respeitar:

``` text
prefers-reduced-motion
```

Não animar todos os elementos simultaneamente.

------------------------------------------------------------------------

# 24. ESTADOS

A Dashboard precisa contemplar:

``` text
loading
success
empty
error
partial data
permission denied
```

### Loading

Usar Skeleton.

### Empty

Exemplo:

``` text
Ainda não há pedidos suficientes para mostrar este indicador.
```

### Error

``` text
Não foi possível carregar os dados.
Tente novamente.
```

CTA:

``` text
Tentar novamente
```

------------------------------------------------------------------------

# 25. RESPONSIVIDADE

## Desktop

-   sidebar fixa;
-   topbar completa;
-   grid;
-   tabela;
-   gráficos.

## Tablet

-   sidebar pode virar drawer;
-   grid reduzido;
-   cards em 2 colunas;
-   tabelas com scroll controlado.

## Mobile

Transformar a experiência:

``` text
topbar compacta
menu drawer
KPIs em 2x2 ou coluna
gráficos em coluna
pedidos em cards
notificações empilhadas
ações rápidas 2x2
```

Breakpoints de referência:

``` text
mobile: < 768px
tablet: 768–1023px
desktop: ≥ 1024px
```

------------------------------------------------------------------------

# 26. ACESSIBILIDADE

Obrigatório:

-   HTML semântico;
-   keyboard navigation;
-   foco visível;
-   labels;
-   contraste;
-   `aria-label` quando necessário;
-   tabelas acessíveis;
-   tooltips acessíveis;
-   resumo textual para gráficos;
-   navegação correta.

Gráficos não podem ser a única forma de comunicação dos dados.

------------------------------------------------------------------------

# 27. BACKEND

A dashboard deve consumir dados reais do Supabase.

Fontes principais:

``` text
orders
order_items
products
profiles
payments
payment_events
```

### Métricas

**Vendas:** agregar pedidos/pagamentos válidos conforme regra de
negócio.

**Pedidos:** contar pedidos do período.

**Clientes:** contar clientes cadastrados.

**Produtos:** contar produtos ativos/cadastrados conforme regra
definida.

**Mais vendidos:** agregar itens vendidos.

------------------------------------------------------------------------

# 28. PERFORMANCE DE DADOS

Não fazer uma query independente e pesada para cada card sem
necessidade.

Preferir:

-   agregações;
-   índices;
-   RPCs quando justificadas;
-   cache;
-   paginação;
-   consultas paralelas controladas.

Não carregar centenas de pedidos para mostrar somente cinco.

------------------------------------------------------------------------

# 29. SEGURANÇA

A rota:

``` text
/admin
```

deve ser protegida.

Acesso somente para usuários administrativos.

A proteção deve existir em:

``` text
frontend
server
database / RLS
```

Não basta esconder a opção da sidebar.

Nunca confiar apenas no client para autorização.

------------------------------------------------------------------------

# 30. ESTRUTURA DE COMPONENTES

Sugestão:

``` text
AdminLayout
AdminSidebar
AdminTopbar
AdminSearch
AdminProfileMenu
DashboardHeader
MetricCard
MetricSparkline
SalesChart
OrdersDistributionChart
NotificationPanel
RecentOrdersTable
TopProductsList
QuickActions
DailyTipCard
AdminFooter
```

Auxiliares:

``` text
StatusBadge
DataTable
EmptyState
ErrorState
LoadingState
Skeleton
Tooltip
ConfirmDialog
```

------------------------------------------------------------------------

# 31. ESTRUTURA DE CÓDIGO

Sugestão:

``` text
app/
  admin/
    page.tsx
    layout.tsx

components/
  admin/
    admin-sidebar.tsx
    admin-topbar.tsx
    dashboard-header.tsx
    metric-card.tsx
    sales-chart.tsx
    orders-distribution.tsx
    notifications-panel.tsx
    recent-orders-table.tsx
    top-products-list.tsx
    quick-actions.tsx
    daily-tip-card.tsx

features/
  admin/
    dashboard/
      queries.ts
      services.ts
      types.ts
      schemas.ts
```

Se o projeto já possuir arquitetura equivalente, preservar a existente.

------------------------------------------------------------------------

# 32. FILTRO DE PERÍODO

O seletor:

``` text
Últimos 7 dias
```

deve poder evoluir para:

``` text
Hoje
Últimos 7 dias
Últimos 30 dias
Este mês
Mês anterior
Período personalizado
```

Os widgets dependentes devem responder ao período selecionado.

Não criar controles puramente decorativos.

------------------------------------------------------------------------

# 33. NOTIFICAÇÕES E NAVEGAÇÃO

Ao clicar:

``` text
Novo pedido → /admin/pedidos/[id]
Estoque baixo → /admin/produtos/[id]
Novo cliente → /admin/clientes/[id]
```

Os links devem existir de fato.

------------------------------------------------------------------------

# 34. LOCALE

A aplicação é brasileira.

Usar:

``` text
pt-BR
BRL
```

Exemplo:

``` text
R$ 8.472,90
12/04/2025
14:32
```

------------------------------------------------------------------------

# 35. DADOS DE REFERÊNCIA

Todos os dados vistos na imagem --- nomes, valores, datas, percentuais,
pedidos e quantidades --- devem ser tratados como **dados de
demonstração visual**.

Na aplicação real:

``` text
Supabase
→ queries
→ serviços
→ componentes
```

Nunca hardcodar métricas reais.

------------------------------------------------------------------------

# 36. CHECKLIST DE IMPLEMENTAÇÃO

``` text
[ ] AdminLayout
[ ] Sidebar
[ ] Logo
[ ] Navegação
[ ] Topbar
[ ] Busca
[ ] Perfil admin
[ ] Header
[ ] Data real
[ ] KPI vendas
[ ] KPI pedidos
[ ] KPI clientes
[ ] KPI produtos
[ ] Gráfico vendas
[ ] Distribuição de pedidos
[ ] Notificações
[ ] Pedidos recentes
[ ] Produtos mais vendidos
[ ] Ações rápidas
[ ] Dica do dia
[ ] Rodapé
[ ] Loading
[ ] Empty
[ ] Error
[ ] Responsividade
[ ] Acessibilidade
[ ] Supabase
[ ] RLS
[ ] Autorização admin
[ ] Testes
[ ] Performance
```

------------------------------------------------------------------------

# 37. QA VISUAL

Comparar a implementação com a imagem de referência:

``` text
[ ] proporção da sidebar
[ ] posição da topbar
[ ] hierarquia do cabeçalho
[ ] proporção dos KPI cards
[ ] equilíbrio entre gráfico e donut
[ ] pedidos recentes bem destacados
[ ] notificações organizadas
[ ] mais vendidos legível
[ ] ações rápidas acessíveis
[ ] fundo off-white
[ ] rosa usado como destaque
[ ] tipografia elegante
[ ] sombras discretas
[ ] espaçamento consistente
[ ] sem excesso de elementos
[ ] sem aparência de SaaS genérico
[ ] sem aparência de template de IA
```

------------------------------------------------------------------------

# 38. ORDEM DE IMPLEMENTAÇÃO

``` text
1. AdminLayout
2. Sidebar
3. Topbar
4. Header
5. KPI Cards
6. Sales Chart
7. Orders Distribution
8. Notifications
9. Recent Orders
10. Top Products
11. Quick Actions
12. Daily Tip
13. States
14. Supabase queries
15. Authorization
16. Responsive
17. Accessibility
18. Tests
19. Performance
20. QA visual
```

------------------------------------------------------------------------

# 39. DEFINIÇÃO DE PRONTO

A Dashboard Admin só pode ser considerada concluída quando:

``` text
[ ] layout implementado
[ ] dados reais conectados
[ ] autorização implementada
[ ] RLS verificada
[ ] loading implementado
[ ] empty states implementados
[ ] erros tratados
[ ] ações funcionais
[ ] gráficos funcionais
[ ] responsividade validada
[ ] acessibilidade validada
[ ] testes executados
[ ] performance revisada
[ ] checklist visual aprovado
```

------------------------------------------------------------------------

# 40. REGRA PARA O ANTIGRAVITY

Use a imagem como **referência visual e de UX**, não como uma imagem
para simplesmente reproduzir estaticamente.

O resultado precisa combinar:

``` text
REFERÊNCIA VISUAL
+
IDENTIDADE ISIS STORE
+
DADOS REAIS
+
COMPONENTES REUTILIZÁVEIS
+
SEGURANÇA
+
RESPONSIVIDADE
+
ACESSIBILIDADE
+
PERFORMANCE
```

Não implementar outras áreas do painel nesta tarefa.

Concluir e validar a Dashboard Admin antes de avançar para Produtos,
Pedidos, Clientes, Gateways ou outras telas administrativas.

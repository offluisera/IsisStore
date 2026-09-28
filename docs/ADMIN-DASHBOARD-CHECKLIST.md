# ISIS STORE — CHECKLIST DE DESENVOLVIMENTO DA DASHBOARD ADMIN

> **Referência Oficial:** `docs/img/dashboard-admin.png`  
> **Especificação:** `docs/ISIS-STORE-ADMIN-DASHBOARD-DESIGN-SYSTEM.md`  
> **Status:** Em Execução  

---

## 📋 Checklist de Execução

### Etapa 1: Arquitetura de Layout & Shell
- [x] Atualizar `src/app/admin/layout.tsx` com layout dual (Sidebar fixa ~260px + Topbar sticky + Main container fluido).
- [x] Criar componente `AdminSidebar` com logo oficial, navegação com itens ativos e submenus, card editorial inferior com foto e link permanente para `/admin/auditoria`.
- [x] Criar componente `AdminTopbar` com busca global `⌘ K`, central de alertas/notificações com badge, seletor de tema e menu do administrador logado.
- [x] Implementar drawer responsivo e menu hambúrguer para viewports mobile (< 1024px).

### Etapa 2: Cabeçalho & KPI Cards Analíticos
- [x] Implementar `DashboardHeader` com tipografia Playfair Display, saudação ao admin logado e widget de data/hora dinâmico.
- [x] Implementar componente `KPICard` reutilizável com cálculo de variação mensal e gerador de sparklines vetoriais em SVG.
- [x] Conectar métricas reais do Supabase em paralelo: total faturado, contagem de pedidos, clientes cadastrados e produtos em estoque.

### Etapa 3: Gráficos & Visualização de Dados
- [ ] Desenvolver `SalesAreaChart` em SVG/Canvas com gradiente linear rosa (`#E08CA3` a transparente), marcadores de data e tooltip com valores monetários.
- [ ] Adicionar seletor de período funcional ("Últimos 7 dias", "Últimos 30 dias", "Este mês").
- [ ] Desenvolver `OrdersDistributionDonut` em SVG com contagem central dinâmica e legenda categorizada por status de pedido.

### Etapa 4: Pedidos Recentes & Feed de Notificações
- [ ] Criar `RecentOrdersTable` com avatares dos clientes, status badges padronizados (Pago, Pendente, Processando, Cancelado) e botão de inspeção direta `/admin/pedidos/[id]`.
- [ ] Criar `AdminNotificationsFeed` alimentado em tempo real com eventos de novos pedidos, pagamentos e logs de auditoria recentes.

### Etapa 5: Mais Vendidos, Ações Rápidas & Dica do Dia
- [ ] Criar `TopSellingProducts` agregando itens de pedidos com fotos reais do catálogo e barras de progresso percentuais.
- [ ] Implementar `QuickActionsGrid` com navegação funcional para novos produtos, gestão de pedidos, clientes, gateways e auditoria.
- [ ] Implementar card visual `DailyTipCard` com assinatura estética Isis Store.

### Etapa 6: Estados, Resiliência & Auditoria
- [ ] Criar skeletons completos para carregamento suave (`loading.tsx`).
- [ ] Implementar empty states com chamadas para ação claras quando não houver dados no período.
- [ ] Garantir registro automático de cada acesso ou alteração em `admin_audit_logs`.

### Etapa 7: Validação, Acessibilidade & Gates
- [ ] Testar navegação por teclado (`Tab`, `Esc`, `⌘ K`) e contraste WCAG AAA.
- [ ] Validar responsividade em 375px, 768px, 1024px e 1440px.
- [ ] Executar suites de teste (`npm test`) e verificação estática de tipos (`npm run typecheck`).

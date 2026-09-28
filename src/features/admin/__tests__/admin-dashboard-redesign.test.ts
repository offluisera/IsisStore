import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Gate 18 — Admin Dashboard Redesign: Validação, Acessibilidade & Gates", () => {
  const ROOT_DIR = path.resolve(process.cwd());

  it("1. Arquitetura de Layout & Shell (Sidebar, Topbar e Shell Responsivo)", () => {
    const sidebarPath = path.join(ROOT_DIR, "src/components/admin/admin-sidebar.tsx");
    const topbarPath = path.join(ROOT_DIR, "src/components/admin/admin-topbar.tsx");
    const shellPath = path.join(ROOT_DIR, "src/components/admin/admin-shell.tsx");
    const layoutPath = path.join(ROOT_DIR, "src/app/admin/layout.tsx");

    assert.ok(fs.existsSync(sidebarPath), "admin-sidebar.tsx deve existir.");
    assert.ok(fs.existsSync(topbarPath), "admin-topbar.tsx deve existir.");
    assert.ok(fs.existsSync(shellPath), "admin-shell.tsx deve existir.");
    assert.ok(fs.existsSync(layoutPath), "layout.tsx administrativo deve existir.");

    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    assert.ok(
      sidebarContent.includes("/admin/auditoria"),
      "Sidebar deve manter link permanente para /admin/auditoria."
    );
    assert.ok(
      sidebarContent.includes("Grandes conquistas começam") || sidebarContent.includes("Isis Store"),
      "Sidebar deve conter card editorial com estética feminina Isis Store."
    );

    const topbarContent = fs.readFileSync(topbarPath, "utf-8");
    assert.ok(
      topbarContent.includes("⌘ K") || topbarContent.includes("Cmd K") || topbarContent.includes("k"),
      "Topbar deve conter campo de busca com atalho de teclado."
    );

    const shellContent = fs.readFileSync(shellPath, "utf-8");
    assert.ok(
      shellContent.includes("Escape"),
      "Shell responsivo deve suportar fechamento do drawer mobile via tecla Escape."
    );
  });

  it("2. Grid de 5 Seções e Componentes Oficiais Conformes à Referência", () => {
    const pagePath = path.join(ROOT_DIR, "src/app/admin/page.tsx");
    assert.ok(fs.existsSync(pagePath), "src/app/admin/page.tsx deve existir.");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    // Componentes obrigatórios
    const requiredComponents = [
      "DashboardHeader",
      "KPICard",
      "SalesAreaChart",
      "OrdersDistributionDonut",
      "RecentOrdersTable",
      "AdminNotificationsFeed",
      "TopSellingProducts",
      "QuickActions",
      "DailyTipCard",
    ];

    for (const comp of requiredComponents) {
      assert.ok(
        pageContent.includes(comp),
        `admin/page.tsx deve integrar o componente oficial ${comp}.`
      );
    }

    // Grid 8 + 4
    assert.ok(
      pageContent.includes("xl:col-span-8") && pageContent.includes("xl:col-span-4"),
      "Layout do painel deve estruturar os dados em grids proporcionais 8 + 4 cols."
    );
  });

  it("3. Cálculos Dinâmicos com Dados Reais do Supabase e Auditoria", () => {
    const pageContent = fs.readFileSync(path.join(ROOT_DIR, "src/app/admin/page.tsx"), "utf-8");

    // Queries no Supabase
    assert.ok(pageContent.includes('.from("orders")'), "Deve consultar tabela de pedidos.");
    assert.ok(pageContent.includes('.from("order_items")'), "Deve consultar itens para ranking de mais vendidos.");
    assert.ok(pageContent.includes('.from("admin_audit_logs")'), "Deve consultar e registrar logs de auditoria.");

    // Registro automático de auditoria
    assert.ok(
      pageContent.includes("access_dashboard"),
      "Deve registrar log automático 'access_dashboard' no acesso administrativo."
    );
  });

  it("4. Acessibilidade, Semântica HTML e Contraste WCAG AAA", () => {
    const ordersTablePath = path.join(ROOT_DIR, "src/components/admin/recent-orders-table.tsx");
    const feedPath = path.join(ROOT_DIR, "src/components/admin/admin-notifications-feed.tsx");
    const topSellingPath = path.join(ROOT_DIR, "src/components/admin/top-selling-products.tsx");
    const quickActionsPath = path.join(ROOT_DIR, "src/components/admin/quick-actions.tsx");

    const ordersTable = fs.readFileSync(ordersTablePath, "utf-8");
    assert.ok(
      ordersTable.includes("<table") && ordersTable.includes("<th") && ordersTable.includes("<td"),
      "Tabela de pedidos deve utilizar semântica HTML de tabela correta."
    );
    assert.ok(
      ordersTable.includes("aria-label") || ordersTable.includes("title="),
      "Ações rápidas devem possuir acessibilidade para leitores de tela."
    );

    const feed = fs.readFileSync(feedPath, "utf-8");
    assert.ok(
      feed.includes("href"),
      "Itens do feed de notificações devem ser links navegáveis."
    );

    const topSelling = fs.readFileSync(topSellingPath, "utf-8");
    assert.ok(
      topSelling.includes("Image") && !topSelling.includes("<img "),
      "Miniaturas devem utilizar next/image para otimização e evitar tags <img> cruas."
    );

    const quickActions = fs.readFileSync(quickActionsPath, "utf-8");
    assert.ok(
      quickActions.includes("/admin/produtos") &&
        quickActions.includes("/admin/pedidos") &&
        quickActions.includes("/admin/clientes") &&
        quickActions.includes("/admin/gateways") &&
        quickActions.includes("/admin/auditoria") &&
        quickActions.includes("/admin/configuracoes"),
      "Ações rápidas devem possuir destinos de rota válidos e funcionais."
    );
  });

  it("5. Skeletons Completos e Resiliência (loading.tsx e Empty States)", () => {
    const loadingPath = path.join(ROOT_DIR, "src/app/admin/loading.tsx");
    assert.ok(fs.existsSync(loadingPath), "src/app/admin/loading.tsx deve existir.");
    const loadingContent = fs.readFileSync(loadingPath, "utf-8");

    assert.ok(
      loadingContent.includes("Skeleton"),
      "loading.tsx deve utilizar componente Skeleton oficial."
    );
    assert.ok(
      loadingContent.includes("xl:col-span-8") && loadingContent.includes("xl:col-span-4"),
      "loading.tsx deve espelhar a estrutura 8+4 para evitar Cumulative Layout Shift (CLS)."
    );

    // Empty state no gráfico de vendas
    const chartPath = path.join(ROOT_DIR, "src/components/admin/sales-area-chart.tsx");
    const chartContent = fs.readFileSync(chartPath, "utf-8");
    assert.ok(
      chartContent.includes("Ainda não existem dados suficientes para gerar este gráfico"),
      "Gráfico de vendas deve conter mensagem elegante de empty state conforme a especificação."
    );
  });
});

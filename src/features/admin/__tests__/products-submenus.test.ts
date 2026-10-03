import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

describe("Produtos — Submenus & Rotas Administrativas", () => {
  it("1. AdminSidebar deve conter submenus expansíveis para Produtos", () => {
    const sidebarPath = path.join(
      ROOT_DIR,
      "src/components/admin/admin-sidebar.tsx"
    );
    assert.ok(fs.existsSync(sidebarPath), "admin-sidebar.tsx deve existir.");
    const content = fs.readFileSync(sidebarPath, "utf-8");

    // Verificar sub-rotas obrigatórias
    assert.ok(
      content.includes("/admin/produtos"),
      "Sidebar deve conter link para listagem de produtos."
    );
    assert.ok(
      content.includes("/admin/produtos/novo"),
      "Sidebar deve conter link para criar novo produto."
    );
    assert.ok(
      content.includes("/admin/produtos/relatorios"),
      "Sidebar deve conter link para relatórios de produtos mais vendidos."
    );
    assert.ok(
      content.includes("/admin/produtos/estoque"),
      "Sidebar deve conter link para controle e gestão de estoque."
    );

    // Verificar comportamento de accordion e acessibilidade
    assert.ok(
      content.includes("toggleSubmenu") && content.includes("openMenus"),
      "Sidebar deve controlar expansão dos submenus ao clicar."
    );
    assert.ok(
      content.includes("aria-expanded") && content.includes("aria-controls"),
      "Sidebar deve suportar atributos de acessibilidade no submenu expansível."
    );
  });

  it("2. Rotas do Admin de Produtos devem existir e conter layout responsivo", () => {
    const requiredPages = [
      "src/app/admin/produtos/page.tsx",
      "src/app/admin/produtos/novo/page.tsx",
      "src/app/admin/produtos/relatorios/page.tsx",
      "src/app/admin/produtos/estoque/page.tsx",
    ];

    for (const relPath of requiredPages) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `${relPath} deve existir.`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 200, `${relPath} deve possuir conteúdo.`);
    }
  });

  it("3. Páginas de Relatórios e Estoque devem conter contenção de tabela (overflow-x-auto)", () => {
    const relatoriosPath = path.join(
      ROOT_DIR,
      "src/app/admin/produtos/relatorios/page.tsx"
    );
    const relatoriosViewPath = path.join(
      ROOT_DIR,
      "src/components/admin/products-report-view.tsx"
    );
    const estoqueViewPath = path.join(
      ROOT_DIR,
      "src/components/admin/stock-management-table.tsx"
    );

    const relViewContent = fs.readFileSync(relatoriosViewPath, "utf-8");
    const estViewContent = fs.readFileSync(estoqueViewPath, "utf-8");

    assert.ok(
      relViewContent.includes("overflow-x-auto"),
      "ProductsReportView deve conter container overflow-x-auto para responsividade."
    );
    assert.ok(
      estViewContent.includes("overflow-x-auto"),
      "StockManagementTable deve conter container overflow-x-auto para responsividade."
    );

    // Verificar cálculos e filtros presentes
    assert.ok(
      relViewContent.includes("unitsSold") && relViewContent.includes("revenueCents"),
      "Relatórios devem calcular unidades vendidas e faturamento total por produto."
    );
    assert.ok(
      estViewContent.includes("handleStockUpdate") && estViewContent.includes("updateProductStockAction"),
      "Gestão de estoque deve permitir ajuste rápido e persistência via server action."
    );
  });
});

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { markOrderLabelGeneratedAction } from "../actions";

const ROOT_DIR = process.cwd();

describe("Pedidos — Submenus & Gestão Especializada", () => {
  it("1. AdminSidebar deve conter submenus expansíveis para Pedidos", () => {
    const sidebarPath = path.join(
      ROOT_DIR,
      "src/components/admin/admin-sidebar.tsx"
    );
    assert.ok(fs.existsSync(sidebarPath), "admin-sidebar.tsx deve existir.");
    const content = fs.readFileSync(sidebarPath, "utf-8");

    assert.ok(
      content.includes("/admin/pedidos"),
      "Sidebar deve conter link para Todos os Pedidos."
    );
    assert.ok(
      content.includes("/admin/pedidos/categorias"),
      "Sidebar deve conter link para Pedidos por Categoria."
    );
    assert.ok(
      content.includes("/admin/pedidos/etiquetas"),
      "Sidebar deve conter link para Etiquetas."
    );
    assert.ok(
      content.includes("/admin/pedidos/reembolsados"),
      "Sidebar deve conter link para Reembolsados."
    );

    assert.ok(
      content.includes('Pedidos: pathname.startsWith("/admin/pedidos")'),
      "Submenu de Pedidos deve auto-expandir ao acessar rotas de pedidos."
    );
  });

  it("2. Rotas administrativas de Pedidos devem existir e possuir conteúdo", () => {
    const pages = [
      "src/app/admin/pedidos/page.tsx",
      "src/app/admin/pedidos/categorias/page.tsx",
      "src/app/admin/pedidos/etiquetas/page.tsx",
      "src/app/admin/pedidos/reembolsados/page.tsx",
    ];

    for (const relPath of pages) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `${relPath} deve existir.`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 200, `${relPath} deve ter conteúdo substancial.`);
    }
  });

  it("3. Etiquetas — deve suportar impressão de etiqueta postal e mensagem 'pedido com etiqueta gerada'", () => {
    const managerPath = path.join(
      ROOT_DIR,
      "src/components/admin/shipping-label-manager.tsx"
    );
    assert.ok(fs.existsSync(managerPath), "shipping-label-manager.tsx deve existir.");
    const content = fs.readFileSync(managerPath, "utf-8");

    assert.ok(
      content.includes("Pedido com etiqueta gerada"),
      "Deve exibir a mensagem 'Pedido com etiqueta gerada' na frente do pedido."
    );
    assert.ok(
      content.includes("markOrderLabelGeneratedAction"),
      "Deve invocar a server action ao gerar a etiqueta de embalagem."
    );
    assert.ok(
      content.includes("window.print()"),
      "Deve suportar comando de impressão nativo."
    );
    assert.ok(
      content.includes("Destinatário") && content.includes("Remetente"),
      "Etiqueta deve coletar e exibir destinatário e remetente."
    );
  });

  it("4. Categorias de Pedidos — deve agrupar pedidos por categoria real com métricas", () => {
    const catPagePath = path.join(
      ROOT_DIR,
      "src/app/admin/pedidos/categorias/page.tsx"
    );
    assert.ok(fs.existsSync(catPagePath), "categorias/page.tsx deve existir.");
    const content = fs.readFileSync(catPagePath, "utf-8");

    assert.ok(
      content.includes("categories") && content.includes("order_items"),
      "Deve consultar categorias e itens de pedido reais do banco."
    );
    assert.ok(
      content.includes("overflow-x-auto"),
      "Deve conter wrapper responsivo overflow-x-auto."
    );
  });

  it("5. Reembolsados — deve listar pedidos estornados e devoluções de estoque", () => {
    const refundPagePath = path.join(
      ROOT_DIR,
      "src/app/admin/pedidos/reembolsados/page.tsx"
    );
    assert.ok(fs.existsSync(refundPagePath), "reembolsados/page.tsx deve existir.");
    const content = fs.readFileSync(refundPagePath, "utf-8");

    assert.ok(
      content.includes('"status", "refunded"'),
      "Deve filtrar exclusivamente pedidos com status 'refunded'."
    );
    assert.ok(
      content.includes("Itens Devolvidos"),
      "Deve exibir itens e quantidades devolvidas ao estoque."
    );
  });

  it("6. markOrderLabelGeneratedAction deve ser uma função exportada", () => {
    assert.strictEqual(
      typeof markOrderLabelGeneratedAction,
      "function",
      "markOrderLabelGeneratedAction deve ser função exportada."
    );
  });
});

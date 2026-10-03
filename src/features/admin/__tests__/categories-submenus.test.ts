import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { updateCategorySchema } from "../../../schemas/admin";

const ROOT_DIR = process.cwd();

describe("Categorias — Submenus & Gestão Administrativa", () => {
  it("1. AdminSidebar deve conter submenus expansíveis para Categorias", () => {
    const sidebarPath = path.join(
      ROOT_DIR,
      "src/components/admin/admin-sidebar.tsx"
    );
    assert.ok(fs.existsSync(sidebarPath), "admin-sidebar.tsx deve existir.");
    const content = fs.readFileSync(sidebarPath, "utf-8");

    assert.ok(
      content.includes("/admin/categorias"),
      "Sidebar deve conter link para listagem de categorias."
    );
    assert.ok(
      content.includes("/admin/categorias/novo"),
      "Sidebar deve conter link para criar categoria."
    );
    assert.ok(
      content.includes("/admin/categorias/editar"),
      "Sidebar deve conter link para editar categoria."
    );

    assert.ok(
      content.includes("Categorias: pathname.startsWith(\"/admin/categorias\")"),
      "Submenu de Categorias deve auto-expandir em rotas de categorias."
    );
  });

  it("2. Rotas administrativas de Categorias devem existir e possuir conteúdo", () => {
    const pages = [
      "src/app/admin/categorias/page.tsx",
      "src/app/admin/categorias/novo/page.tsx",
      "src/app/admin/categorias/editar/page.tsx",
    ];

    for (const relPath of pages) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `${relPath} deve existir.`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 200, `${relPath} deve ter conteúdo.`);
    }
  });

  it("3. Página de Categorias deve incluir informações de acesso e contenção responsiva", () => {
    const listComponentPath = path.join(
      ROOT_DIR,
      "src/components/admin/categories-list-view.tsx"
    );
    assert.ok(fs.existsSync(listComponentPath), "categories-list-view.tsx deve existir.");
    const content = fs.readFileSync(listComponentPath, "utf-8");

    assert.ok(
      content.includes("accessCount") && content.includes("accessShare"),
      "Deve calcular e exibir acessos e participação no tráfego das categorias."
    );
    assert.ok(
      content.includes("Mais Acessadas"),
      "Deve conter aba/filtro das categorias mais acessadas."
    );
    assert.ok(
      content.includes("overflow-x-auto"),
      "Deve conter container responsivo overflow-x-auto para a tabela."
    );
  });

  it("4. Schema de edição de categoria (updateCategorySchema) deve validar entradas", () => {
    const valid = updateCategorySchema.safeParse({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "Vestidos de Festa",
      slug: "vestidos-de-festa",
      description: "Coleção de vestidos sofisticados",
      is_active: true,
      sort_order: 1,
    });
    assert.strictEqual(valid.success, true, "Payload válido de categoria deve passar.");

    const invalidShortName = updateCategorySchema.safeParse({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "A",
    });
    assert.strictEqual(invalidShortName.success, false, "Nome menor que 2 caracteres deve falhar.");

    const invalidUuid = updateCategorySchema.safeParse({
      id: "not-a-uuid",
      name: "Categoria Teste",
    });
    assert.strictEqual(invalidUuid.success, false, "ID inválido não-UUID deve falhar.");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { updateProductSchema, productSchema } from "@/schemas/product";

const ROOT_DIR = process.cwd();

describe("Produtos — Rascunhos & Edição de Produto", () => {
  it("1. Validação de Schema: updateProductSchema valida campos e status", () => {
    const validDraft = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Caneca de Porcelana Rascunho",
      categoryId: "c0000000-0000-0000-0000-000000000001",
      price: "89,90",
      salePrice: "79,90",
      stock: "15",
      status: "draft",
      shortDescription: "Caneca rascunho em preparação",
      description: "Descrição detalhada do rascunho...",
      featured: false,
    };

    const res = updateProductSchema.safeParse(validDraft);
    assert.ok(res.success, "Schema deve validar atualização com status draft.");
    if (res.success) {
      assert.equal(res.data.status, "draft");
      assert.equal(res.data.name, "Caneca de Porcelana Rascunho");
    }

    const invalidPrice = {
      ...validDraft,
      price: "invalid_price",
    };
    const resInvalid = updateProductSchema.safeParse(invalidPrice);
    assert.ok(!resInvalid.success, "Deve rejeitar formato de preço inválido.");

    const invalidId = {
      ...validDraft,
      id: "",
    };
    const resInvalidId = updateProductSchema.safeParse(invalidId);
    assert.ok(!resInvalidId.success, "Deve rejeitar ID vazio.");
  });

  it("2. Validação de Schema: productSchema permite status inicial (draft ou published)", () => {
    const draftCreation = {
      name: "Colar Gravado Personalizado",
      categoryId: "c0000000-0000-0000-0000-000000000002",
      price: "129,90",
      stock: "5",
      status: "draft",
    };

    const res = productSchema.safeParse(draftCreation);
    assert.ok(res.success, "productSchema deve aceitar status draft.");
    if (res.success) {
      assert.equal(res.data.status, "draft");
    }

    const defaultPublished = {
      name: "Brinco Prata 925",
      categoryId: "c0000000-0000-0000-0000-000000000002",
      price: "99,00",
      stock: "10",
    };
    const resPub = productSchema.safeParse(defaultPublished);
    assert.ok(resPub.success, "productSchema deve aplicar default published.");
    if (resPub.success) {
      assert.equal(resPub.data.status, "published");
    }
  });

  it("3. Isolamento da Loja: Produtos em rascunho são estritamente excluídos do catálogo público", () => {
    const catalogServicePath = path.join(ROOT_DIR, "src/services/catalog.service.ts");
    assert.ok(fs.existsSync(catalogServicePath), "catalog.service.ts deve existir.");
    const catalogContent = fs.readFileSync(catalogServicePath, "utf-8");

    // getProducts, getProductBySlug e getRelatedProducts devem filtrar por status = 'published'
    assert.ok(
      catalogContent.includes('.eq("status", "published")'),
      "Catálogo público deve filtrar produtos por status = published."
    );

    const homePath = path.join(ROOT_DIR, "src/app/page.tsx");
    const homeContent = fs.readFileSync(homePath, "utf-8");
    assert.ok(
      homeContent.includes('.eq("status", "published")'),
      "Home page deve carregar apenas produtos com status published."
    );

    const checkoutActionsPath = path.join(ROOT_DIR, "src/features/checkout/actions.ts");
    const checkoutContent = fs.readFileSync(checkoutActionsPath, "utf-8");
    assert.ok(
      checkoutContent.includes('prod.status !== "published"'),
      "Checkout deve bloquear produtos que não estejam com status published."
    );
  });

  it("4. Guia de Rascunhos: Rota /admin/produtos/rascunhos e integração na barra lateral", () => {
    const rascunhosPagePath = path.join(
      ROOT_DIR,
      "src/app/admin/produtos/rascunhos/page.tsx"
    );
    assert.ok(fs.existsSync(rascunhosPagePath), "Página de rascunhos deve existir.");
    const rascunhosContent = fs.readFileSync(rascunhosPagePath, "utf-8");

    assert.ok(
      rascunhosContent.includes('.eq("status", "draft")'),
      "Página de rascunhos deve consultar produtos com status = draft."
    );
    assert.ok(
      rascunhosContent.includes("isDraftView={true}"),
      "Página de rascunhos deve renderizar ProductsManagementTable com isDraftView ativo."
    );

    const sidebarPath = path.join(ROOT_DIR, "src/components/admin/admin-sidebar.tsx");
    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    assert.ok(
      sidebarContent.includes("/admin/produtos/rascunhos"),
      "Sidebar deve ter link para /admin/produtos/rascunhos no submenu Produtos."
    );
  });

  it("5. Edição de Produtos: Server Actions e Modal de Edição na página de produtos", () => {
    const prodActionsPath = path.join(
      ROOT_DIR,
      "src/features/admin/product-actions.ts"
    );
    assert.ok(fs.existsSync(prodActionsPath), "product-actions.ts deve existir.");
    const actionsContent = fs.readFileSync(prodActionsPath, "utf-8");

    assert.ok(
      actionsContent.includes("export async function updateProductAction"),
      "Deve exportar updateProductAction."
    );
    assert.ok(
      actionsContent.includes("export async function updateProductDirectAction"),
      "Deve exportar updateProductDirectAction."
    );
    assert.ok(
      actionsContent.includes("revalidatePath(\"/admin/produtos/rascunhos\")"),
      "Atualização de produto deve revalidar a guia de rascunhos."
    );

    const modalPath = path.join(
      ROOT_DIR,
      "src/components/admin/edit-product-modal.tsx"
    );
    assert.ok(fs.existsSync(modalPath), "edit-product-modal.tsx deve existir.");
    const modalContent = fs.readFileSync(modalPath, "utf-8");

    assert.ok(
      modalContent.includes("updateProductDirectAction"),
      "Modal deve chamar updateProductDirectAction para salvar edições."
    );
    assert.ok(
      modalContent.includes("setStatus(\"draft\")") && modalContent.includes("setStatus(\"published\")"),
      "Modal deve permitir alterar status entre draft e published."
    );

    const editPagePath = path.join(
      ROOT_DIR,
      "src/app/admin/produtos/editar/page.tsx"
    );
    assert.ok(fs.existsSync(editPagePath), "Página de edição dedicada /admin/produtos/editar deve existir.");
  });
});

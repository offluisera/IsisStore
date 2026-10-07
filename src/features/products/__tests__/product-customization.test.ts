import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  productCustomizationSchema,
  checkoutItemSchema,
  checkoutSchema,
} from "@/schemas/checkout";
import type { CartItem, ProductCustomization } from "@/features/cart/types";

describe("Produtos Personalizados (Gravação de Nome, Frase ou Imagem)", () => {
  test("1. Validação do schema Zod de personalização", () => {
    // Caso válido com texto e notas
    const valid1 = productCustomizationSchema.safeParse({
      text: "Maria Clara & João - 10/10/2026",
      notes: "Gravação interna em letra cursiva",
    });
    assert.strictEqual(valid1.success, true);

    // Caso válido com imagem URL
    const valid2 = productCustomizationSchema.safeParse({
      imageUrl: "https://bucket.supabase.co/products/customizations/foto.jpg",
      notes: "Modelo de referência anexo",
    });
    assert.strictEqual(valid2.success, true);

    // Caso inválido: texto muito longo (> 200 chars)
    const invalidLongText = productCustomizationSchema.safeParse({
      text: "a".repeat(250),
    });
    assert.strictEqual(invalidLongText.success, false);

    // Caso inválido: URL malformada
    const invalidUrl = productCustomizationSchema.safeParse({
      imageUrl: "not-a-valid-url",
    });
    assert.strictEqual(invalidUrl.success, false);
  });

  test("2. Validação de checkoutItemSchema e checkoutSchema com customização", () => {
    const itemWithCustomization = {
      productId: "123e4567-e89b-12d3-a456-426614174000",
      quantity: 2,
      customization: {
        text: "Ana & Pedro",
        notes: "Com desenho de coração",
      },
    };

    const parsedItem = checkoutItemSchema.safeParse(itemWithCustomization);
    assert.strictEqual(parsedItem.success, true);
    assert.strictEqual(parsedItem.data?.customization?.text, "Ana & Pedro");

    const fullCheckout = {
      addressId: "123e4567-e89b-12d3-a456-426614174001",
      shippingMethod: "pac",
      paymentMethod: "pix",
      items: [itemWithCustomization],
    };

    const parsedCheckout = checkoutSchema.safeParse(fullCheckout);
    assert.strictEqual(parsedCheckout.success, true);
  });

  test("3. Unicidade de itens de carrinho com personalizações distintas", () => {
    // Simula a lógica do addItem em CartContext
    const items: CartItem[] = [];

    const addItemLogic = (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const rawProductId = item.productId || item.id;
      const uniqueId = item.customization
        ? `${rawProductId}_cust_${(item.customization.text || "").trim().toLowerCase().slice(0, 20).replace(/\s+/g, "-")}_${item.customization.imageUrl ? "img" : "txt"}`
        : item.id;

      const resolvedItem: CartItem = {
        ...item,
        id: uniqueId,
        productId: rawProductId,
        quantity,
      };

      const existingIndex = items.findIndex((i) => i.id === uniqueId);
      if (existingIndex >= 0) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push(resolvedItem);
      }
    };

    // Adiciona colar com o nome "Maria"
    addItemLogic(
      {
        id: "prod-colar-1",
        name: "Colar Nome Personalizado",
        price: 18990,
        imageUrl: "/colar.jpg",
        customization: { text: "Maria" },
      },
      1
    );

    // Adiciona mesmo colar com o nome "Bia" (deve ser outro item no carrinho)
    addItemLogic(
      {
        id: "prod-colar-1",
        name: "Colar Nome Personalizado",
        price: 18990,
        imageUrl: "/colar.jpg",
        customization: { text: "Bia" },
      },
      1
    );

    assert.strictEqual(items.length, 2, "Devem ser 2 itens distintos no carrinho com personalizações diferentes");
    assert.strictEqual(items[0].customization?.text, "Maria");
    assert.strictEqual(items[1].customization?.text, "Bia");

    // Adiciona mais 1 do colar "Maria" (deve incrementar a quantidade do primeiro)
    addItemLogic(
      {
        id: "prod-colar-1",
        name: "Colar Nome Personalizado",
        price: 18990,
        imageUrl: "/colar.jpg",
        customization: { text: "Maria" },
      },
      1
    );

    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].quantity, 2);
    assert.strictEqual(items[1].quantity, 1);
  });

  test("4. Integridade dos arquivos de UI e Componentes de Personalização", () => {
    const boxPath = path.join(
      process.cwd(),
      "src",
      "components",
      "commerce",
      "product-customization-box.tsx"
    );
    const actionsPath = path.join(
      process.cwd(),
      "src",
      "components",
      "commerce",
      "product-actions.tsx"
    );
    const actionsServerPath = path.join(
      process.cwd(),
      "src",
      "features",
      "products",
      "actions.ts"
    );
    const cardPath = path.join(
      process.cwd(),
      "src",
      "components",
      "commerce",
      "product-card.tsx"
    );

    assert.ok(fs.existsSync(boxPath), "ProductCustomizationBox deve existir");
    assert.ok(fs.existsSync(actionsPath), "ProductActions deve existir");
    assert.ok(fs.existsSync(actionsServerPath), "Server Action de upload deve existir");
    assert.ok(fs.existsSync(cardPath), "ProductCard deve existir");

    const boxContent = fs.readFileSync(boxPath, "utf-8");
    assert.ok(boxContent.includes("Personalize seu produto"), "Deve conter título de personalização");
    assert.ok(boxContent.includes("uploadCustomizationImageAction"), "Deve acionar server action de upload de foto");
    assert.ok(boxContent.includes("custom-text"), "Deve ter campo de texto/frase/iniciais");

    const actionsContent = fs.readFileSync(actionsPath, "utf-8");
    assert.ok(actionsContent.includes("ProductCustomizationBox"), "ProductActions deve renderizar ProductCustomizationBox");
    assert.ok(actionsContent.includes("validateCustomization"), "ProductActions deve validar obrigatoriedade de preenchimento");

    const cardContent = fs.readFileSync(cardPath, "utf-8");
    assert.ok(cardContent.includes("Personalizar"), "ProductCard deve exibir botão Personalizar para itens da categoria");
  });

  test("5. Suporte a personalização no Admin e na Área do Cliente", () => {
    const adminOrderPath = path.join(
      process.cwd(),
      "src",
      "app",
      "admin",
      "pedidos",
      "[id]",
      "page.tsx"
    );
    const clientOrderPath = path.join(
      process.cwd(),
      "src",
      "app",
      "conta",
      "pedidos",
      "[id]",
      "page.tsx"
    );

    const adminContent = fs.readFileSync(adminOrderPath, "utf-8");
    assert.ok(adminContent.includes("item.customization"), "Admin deve renderizar item.customization");
    assert.ok(adminContent.includes("Dados de Personalização"), "Admin deve exibir bloco de dados de personalização");

    const clientContent = fs.readFileSync(clientOrderPath, "utf-8");
    assert.ok(clientContent.includes("item.customization"), "Cliente deve visualizar item.customization");
    assert.ok(clientContent.includes("Sua Personalização"), "Cliente deve visualizar bloco de personalização");
  });
});

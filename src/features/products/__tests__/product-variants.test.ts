import { test, describe } from "node:test";
import assert from "node:assert";
import { productSchema, updateProductSchema } from "@/schemas/product";
import { productCustomizationSchema, checkoutItemSchema } from "@/schemas/checkout";
import type { CartItem } from "@/features/cart/types";

describe("Variantes de Produto (Tamanhos e Cores)", () => {
  test("1. Validação do schema do produto com tamanhos e cores no Admin", () => {
    // Produto padrão sem variantes
    const defaultProduct = {
      name: "Brinco Solitário Ouro 18k",
      description: "Brinco delicado em ouro legítimo",
      price: "199.90",
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      stock: "10",
      status: "published" as const,
      imageUrl: "https://example.com/img1.jpg",
    };

    const parsedDefault = productSchema.safeParse(defaultProduct);
    assert.strictEqual(parsedDefault.success, true);
    assert.strictEqual(parsedDefault.data?.hasSizes, false);
    assert.deepStrictEqual(parsedDefault.data?.sizes, []);
    assert.strictEqual(parsedDefault.data?.hasColors, false);
    assert.deepStrictEqual(parsedDefault.data?.colors, []);

    // Produto com tamanhos variados e cores diferentes
    const variantProduct = {
      ...defaultProduct,
      name: "Vestido Midi Floral Isis",
      hasSizes: true,
      sizes: ["P", "M", "G", "GG"],
      hasColors: true,
      colors: ["Preto", "Rosa Seco", "Azul Serenity"],
    };

    const parsedVariants = productSchema.safeParse(variantProduct);
    assert.strictEqual(parsedVariants.success, true);
    assert.strictEqual(parsedVariants.data?.hasSizes, true);
    assert.deepStrictEqual(parsedVariants.data?.sizes, ["P", "M", "G", "GG"]);
    assert.strictEqual(parsedVariants.data?.hasColors, true);
    assert.deepStrictEqual(parsedVariants.data?.colors, ["Preto", "Rosa Seco", "Azul Serenity"]);
  });

  test("2. Validação do updateProductSchema com variantes", () => {
    const updatePayload = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Vestido Midi Floral Isis",
      categoryId: "123e4567-e89b-12d3-a456-426614174001",
      price: "249.90",
      stock: "15",
      hasSizes: true,
      sizes: ["36", "38", "40", "42"],
      hasColors: true,
      colors: ["Preto", "Branco"],
    };

    const parsedUpdate = updateProductSchema.safeParse(updatePayload);
    assert.strictEqual(parsedUpdate.success, true);
    assert.strictEqual(parsedUpdate.data?.hasSizes, true);
    assert.deepStrictEqual(parsedUpdate.data?.sizes, ["36", "38", "40", "42"]);
    assert.strictEqual(parsedUpdate.data?.hasColors, true);
    assert.deepStrictEqual(parsedUpdate.data?.colors, ["Preto", "Branco"]);
  });

  test("3. Validação do schema de customização do cliente com tamanho e cor", () => {
    const validSelection = {
      size: "M",
      color: "Rosa Seco",
    };

    const parsed = productCustomizationSchema.safeParse(validSelection);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(parsed.data?.size, "M");
    assert.strictEqual(parsed.data?.color, "Rosa Seco");

    // Validação com personalização adicional (texto gravado)
    const validWithText = {
      size: "G",
      color: "Dourado",
      text: "Isis & Arthur",
    };
    const parsedWithText = productCustomizationSchema.safeParse(validWithText);
    assert.strictEqual(parsedWithText.success, true);
    assert.strictEqual(parsedWithText.data?.size, "G");
    assert.strictEqual(parsedWithText.data?.color, "Dourado");
    assert.strictEqual(parsedWithText.data?.text, "Isis & Arthur");
  });

  test("4. Unicidade de itens no carrinho ao selecionar tamanhos e cores diferentes", () => {
    const baseProductId = "prod-vestido-isis";

    // Função que replica a lógica do uniqueId no cart-context
    const generateUniqueCartId = (item: {
      productId: string;
      customization?: { size?: string; color?: string; text?: string; imageUrl?: string };
    }) => {
      const rawProductId = item.productId;
      const sizePart = item.customization?.size ? `_sz_${encodeURIComponent(item.customization.size)}` : "";
      const colorPart = item.customization?.color ? `_cl_${encodeURIComponent(item.customization.color)}` : "";
      const textPart = (item.customization?.text || "").trim().toLowerCase().slice(0, 20).replace(/\s+/g, "-");
      const hasCustom = Boolean(
        item.customization &&
        (item.customization.size || item.customization.color || item.customization.text || item.customization.imageUrl)
      );
      return hasCustom
        ? `${rawProductId}${sizePart}${colorPart}_cust_${textPart}_${item.customization?.imageUrl ? "img" : "txt"}`
        : item.productId;
    };

    const itemTamP_Preto = generateUniqueCartId({
      productId: baseProductId,
      customization: { size: "P", color: "Preto" },
    });

    const itemTamM_Preto = generateUniqueCartId({
      productId: baseProductId,
      customization: { size: "M", color: "Preto" },
    });

    const itemTamM_Rosa = generateUniqueCartId({
      productId: baseProductId,
      customization: { size: "M", color: "Rosa" },
    });

    // Itens com tamanhos diferentes devem gerar IDs de carrinho únicos
    assert.notStrictEqual(itemTamP_Preto, itemTamM_Preto);
    // Itens com cores diferentes devem gerar IDs de carrinho únicos
    assert.notStrictEqual(itemTamM_Preto, itemTamM_Rosa);

    // O mesmo tamanho e cor devem gerar o mesmo ID para permitir incremento de quantidade
    const itemTamP_Preto_Repetido = generateUniqueCartId({
      productId: baseProductId,
      customization: { size: "P", color: "Preto" },
    });
    assert.strictEqual(itemTamP_Preto, itemTamP_Preto_Repetido);
  });

  test("5. Suporte no payload do Checkout para itens com tamanho e cor", () => {
    const item = {
      productId: "123e4567-e89b-12d3-a456-426614174000",
      quantity: 1,
      customization: {
        size: "GG",
        color: "Azul Marinho",
      },
    };

    const parsedItem = checkoutItemSchema.safeParse(item);
    assert.strictEqual(parsedItem.success, true);
    assert.strictEqual(parsedItem.data?.customization?.size, "GG");
    assert.strictEqual(parsedItem.data?.customization?.color, "Azul Marinho");
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_STORE_SETTINGS,
  StoreSettings,
} from "@/lib/settings/store-settings";
import { updateStoreSettingsSchema } from "@/schemas/admin";

describe("Gate de Configurações Gerais da Loja (SEO, Identidade, Favicon, Operação)", () => {
  it("1. Deve conter valores padrão íntegros para a Isis Store", () => {
    assert.strictEqual(DEFAULT_STORE_SETTINGS.store_name, "Isis Store");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.favicon_url, "/favicon.ico");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.logo_url, "/images/logo/logo.jpeg");
    assert.ok(DEFAULT_STORE_SETTINGS.meta_title.includes("Isis Store"));
    assert.ok(DEFAULT_STORE_SETTINGS.seo_keywords.includes("semijoias"));
    assert.strictEqual(DEFAULT_STORE_SETTINGS.free_shipping_threshold_cents, 19900);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.announcement_banner_active, true);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.maintenance_mode, false);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.brand_features_badge, "Padrão de Excelência");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.brand_features_title, "Por que escolher a Isis Store?");
    assert.ok(DEFAULT_STORE_SETTINGS.brand_features_cards.length >= 4);
  });

  it("2. Deve validar schema de atualização de configurações com sucesso", () => {
    const validData = {
      store_name: "Isis Store Oficial",
      store_tagline: "Semijoias Finas & Presentes de Luxo",
      store_description: "Peças elegantes com banho de ouro 18k e garantia total.",
      logo_url: "https://cdn.isisstore.com.br/logo-nova.png",
      favicon_url: "https://cdn.isisstore.com.br/favicon.svg",
      meta_title: "Isis Store Oficial — Semijoias Exclusivas",
      meta_description: "Compre colares, anéis e brincos folheados a ouro 18k.",
      seo_keywords: "semijoias de luxo, presentes, colares femininos",
      og_image_url: "https://cdn.isisstore.com.br/og-share.jpg",
      canonical_url: "https://isisstore.com.br",
      support_email: "atendimento@isisstore.com.br",
      support_phone: "5517992495308",
      instagram_handle: "@isisstoreoficial",
      announcement_banner_text: "Frete Grátis acima de R$ 250 | Use o cupom BEMVINDA",
      announcement_banner_active: true,
      free_shipping_threshold_cents: 25000,
      maintenance_mode: false,
      maintenance_message: "",
    };

    const parsed = updateStoreSettingsSchema.safeParse(validData);
    assert.strictEqual(parsed.success, true, "Dados válidos devem ser aprovados no schema");
    if (parsed.success) {
      assert.strictEqual(parsed.data.store_name, "Isis Store Oficial");
      assert.strictEqual(parsed.data.free_shipping_threshold_cents, 25000);
    }
  });

  it("3. Deve rejeitar dados inválidos no schema (nome vazio ou e-mail inválido)", () => {
    const invalidData = {
      store_name: "A", // muito curto (< 2 chars)
      support_email: "email_invalido_sem_arroba",
      free_shipping_threshold_cents: -500, // negativo
    };

    const parsed = updateStoreSettingsSchema.safeParse(invalidData);
    assert.strictEqual(parsed.success, false, "Dados corrompidos devem ser rejeitados");
    if (!parsed.success) {
      const fields = parsed.error.issues.map((i) => i.path[0]);
      assert.ok(fields.includes("store_name"), "Deve apontar erro em store_name");
      assert.ok(fields.includes("support_email"), "Deve apontar erro em support_email");
      assert.ok(fields.includes("free_shipping_threshold_cents"), "Deve apontar erro em frete");
    }
  });

  it("4. Deve aceitar campos opcionais vazios com fallback adequado", () => {
    const minimalData = {
      store_name: "Isis Store Minimal",
      store_tagline: "",
      store_description: "",
      logo_url: "",
      favicon_url: "",
      meta_title: "",
      meta_description: "",
      seo_keywords: "",
      og_image_url: "",
      canonical_url: "",
      support_email: "",
      support_phone: "",
      instagram_handle: "",
      announcement_banner_text: "",
      announcement_banner_active: false,
      free_shipping_threshold_cents: 19900,
      maintenance_mode: false,
      maintenance_message: "",
    };

    const parsed = updateStoreSettingsSchema.safeParse(minimalData);
    assert.strictEqual(parsed.success, true, "Campos opcionais vazios devem ser aceitos");
  });

  it("5. Deve validar customização completa dos diferenciais da marca (Brand Features)", () => {
    const brandFeaturesData = {
      store_name: "Isis Store",
      brand_features_badge: "Excelência Comprovada",
      brand_features_title: "Nossos Pilares de Confiança",
      brand_features_subtitle: "Tradição em semijoias hipoalergênicas e presentes exclusivos.",
      brand_features_cards: [
        {
          id: "card_1",
          title: "Banho Ouro 18k",
          description: "Camada nobre com verniz suíço.",
          badge_text: "Garantia 1 Ano",
          badge_variant: "success" as const,
          icon: "gem" as const,
        },
        {
          id: "card_2",
          title: "Entrega Expressa",
          description: "Despacho em até 24h úteis.",
          badge_text: "Rápido",
          badge_variant: "warning" as const,
          icon: "truck" as const,
        },
        {
          id: "card_3",
          title: "Atendimento Humanizado",
          description: "Consultoria exclusiva via WhatsApp.",
          badge_text: "Personal Shopper",
          badge_variant: "default" as const,
          icon: "heart" as const,
        },
      ],
    };

    const parsed = updateStoreSettingsSchema.safeParse(brandFeaturesData);
    assert.strictEqual(parsed.success, true, "Diferenciais válidos devem ser aceitos");
    if (parsed.success) {
      assert.strictEqual(parsed.data.brand_features_title, "Nossos Pilares de Confiança");
      assert.strictEqual(parsed.data.brand_features_cards?.length, 3);
      assert.strictEqual(parsed.data.brand_features_cards?.[1].icon, "truck");
    }

    // Testar rejeição de ícone inexistente
    const invalidIconData = {
      store_name: "Isis Store",
      brand_features_cards: [
        {
          id: "c_bad",
          title: "Card Errado",
          description: "Desc",
          badge_variant: "default",
          icon: "icone_inexistente_xyz",
        },
      ],
    };
    const invalidParsed = updateStoreSettingsSchema.safeParse(invalidIconData);
    assert.strictEqual(invalidParsed.success, false, "Ícone não catalogado deve ser rejeitado");
  });

  it("5. Deve validar configurações das Ofertas do Dia e algoritmo determinístico de 15 produtos", () => {
    // 1. Defaults das Ofertas do Dia
    assert.strictEqual(DEFAULT_STORE_SETTINGS.daily_deals_active, true);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.daily_deals_discount_percent, 15);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.daily_deals_product_limit, 15);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.daily_deals_title, "Ofertas do dia");

    // 2. Validação de schema com dados válidos
    const validDeals = {
      store_name: "Isis Store",
      daily_deals_active: true,
      daily_deals_discount_percent: 20,
      daily_deals_product_limit: 12,
      daily_deals_title: "Super Ofertas de Hoje",
    };
    const parsed = updateStoreSettingsSchema.safeParse(validDeals);
    assert.strictEqual(parsed.success, true);
    if (parsed.success) {
      assert.strictEqual(parsed.data.daily_deals_discount_percent, 20);
      assert.strictEqual(parsed.data.daily_deals_product_limit, 12);
      assert.strictEqual(parsed.data.daily_deals_title, "Super Ofertas de Hoje");
    }

    // 3. Validação de rejeição para limites absurdos (ex: desconto > 99%)
    const invalidDeals = {
      store_name: "Isis Store",
      daily_deals_discount_percent: 150,
    };
    const invalidParsed = updateStoreSettingsSchema.safeParse(invalidDeals);
    assert.strictEqual(invalidParsed.success, false, "Desconto acima de 99% deve falhar no schema");

    // 4. Teste do LCG Determinístico para seleção de produtos
    const { getDailyDealsProducts } = require("@/lib/deals/daily-deals");
    const fakeCatalog = Array.from({ length: 30 }, (_, i) => ({
      id: `prod_${i + 1}`,
      name: `Produto Teste ${i + 1}`,
    }));

    const dayA_1 = getDailyDealsProducts(fakeCatalog, 15, "2026-10-03");
    const dayA_2 = getDailyDealsProducts(fakeCatalog, 15, "2026-10-03");
    const dayB = getDailyDealsProducts(fakeCatalog, 15, "2026-10-04");

    assert.strictEqual(dayA_1.length, 15);
    assert.strictEqual(dayA_2.length, 15);
    assert.strictEqual(dayB.length, 15);

    // No mesmo dia, o resultado DEVE ser idêntico (estabilidade de 24h)
    assert.deepStrictEqual(
      dayA_1.map((p: any) => p.id),
      dayA_2.map((p: any) => p.id),
      "Mesmo dia deve gerar a mesma seleção de produtos"
    );

    // Em dias diferentes, a ordem/seleção de produtos deve alternar
    const idsDayA = dayA_1.map((p: any) => p.id).join(",");
    const idsDayB = dayB.map((p: any) => p.id).join(",");
    assert.notStrictEqual(idsDayA, idsDayB, "Dias diferentes devem alternar os produtos sorteados");
  });

  it("6. Deve validar configurações fiscais (CNPJ), rodapé e cor customizável da faixa", () => {
    // 1. Defaults de CNPJ, Rodapé e Cor da Faixa
    assert.strictEqual(DEFAULT_STORE_SETTINGS.cnpj, "58.123.456/0001-78");
    assert.ok(DEFAULT_STORE_SETTINGS.support_hours?.includes("Segunda"));
    assert.ok(DEFAULT_STORE_SETTINGS.footer_text?.includes("Isis Store"));
    assert.strictEqual(DEFAULT_STORE_SETTINGS.daily_deals_bg_color, "#D9480F");

    // 2. Validação no schema de atualização
    const footerData = {
      store_name: "Isis Store",
      cnpj: "12.345.678/0001-99",
      support_hours: "Segunda a Sábado: 08h às 20h",
      footer_text: "Isis Store Artigos e Presentes Finos LTDA",
      daily_deals_bg_color: "#D6336C",
    };

    const parsed = updateStoreSettingsSchema.safeParse(footerData);
    assert.strictEqual(parsed.success, true);
    if (parsed.success) {
      assert.strictEqual(parsed.data.cnpj, "12.345.678/0001-99");
      assert.strictEqual(parsed.data.support_hours, "Segunda a Sábado: 08h às 20h");
      assert.strictEqual(parsed.data.footer_text, "Isis Store Artigos e Presentes Finos LTDA");
      assert.strictEqual(parsed.data.daily_deals_bg_color, "#D6336C");
    }
  });

  it("7. Deve validar configurações do Banner Editorial de Presentes & Cupom (Home)", () => {
    // 1. Defaults do Banner Editorial
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_active, true);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_badge, "Experiência Exclusiva de Compra");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_title, "A Arte de Presentear quem você mais Ama");
    assert.ok(DEFAULT_STORE_SETTINGS.editorial_banner_description?.includes("cartão de dedicatória"));
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_coupon_active, true);
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_coupon_code, "ISIS10");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_coupon_text, "10% OFF em todo o catálogo");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_button_text, "Explorar Coleção Completa");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_button_link, "/produtos");
    assert.strictEqual(DEFAULT_STORE_SETTINGS.editorial_banner_whatsapp_button_text, "Personal Shopper no WhatsApp");
    assert.ok(DEFAULT_STORE_SETTINGS.editorial_banner_image_url?.includes("colar-coracao"));

    // 2. Validação no schema de atualização
    const customEditorial = {
      store_name: "Isis Store",
      editorial_banner_active: true,
      editorial_banner_badge: "Presentes Especiais 2026",
      editorial_banner_title: "Surpreenda com Joias Eternas",
      editorial_banner_description: "Embalagens aromatizadas e dedicatória personalizada feita à mão.",
      editorial_banner_coupon_active: false,
      editorial_banner_coupon_code: "LOVE20",
      editorial_banner_coupon_text: "20% OFF no primeiro pedido",
      editorial_banner_button_text: "Ver Presentes",
      editorial_banner_button_link: "/categoria/presentes",
      editorial_banner_whatsapp_button_text: "Falar com Consultora",
      editorial_banner_image_url: "/images/products/brinco-gota-cristal-ouro-18k.jpg",
      editorial_banner_image_tag: "Edição Especial",
      editorial_banner_image_title: "Brinco Gota Cristal",
      editorial_banner_image_subtitle: "Ouro 18k",
    };

    const parsed = updateStoreSettingsSchema.safeParse(customEditorial);
    assert.strictEqual(parsed.success, true);
    if (parsed.success) {
      assert.strictEqual(parsed.data.editorial_banner_active, true);
      assert.strictEqual(parsed.data.editorial_banner_badge, "Presentes Especiais 2026");
      assert.strictEqual(parsed.data.editorial_banner_title, "Surpreenda com Joias Eternas");
      assert.strictEqual(parsed.data.editorial_banner_coupon_active, false);
      assert.strictEqual(parsed.data.editorial_banner_coupon_code, "LOVE20");
      assert.strictEqual(parsed.data.editorial_banner_button_text, "Ver Presentes");
      assert.strictEqual(parsed.data.editorial_banner_button_link, "/categoria/presentes");
      assert.strictEqual(parsed.data.editorial_banner_image_title, "Brinco Gota Cristal");
    }
  });

  it("8. Deve disponibilizar upload do PC e recomendações em pixel para Favicon, Logo e Open Graph", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const viewPath = path.join(process.cwd(), "src/components/admin/store-settings-view.tsx");
    assert.ok(fs.existsSync(viewPath), "store-settings-view.tsx deve existir.");
    const viewContent = fs.readFileSync(viewPath, "utf-8");

    // Valida botões e inputs de upload do PC
    assert.ok(viewContent.includes("Upload do PC"), "Deve conter botão 'Upload do PC'");
    assert.ok(viewContent.includes("faviconFileInputRef"), "Deve possuir ref de arquivo para Favicon");
    assert.ok(viewContent.includes("logoFileInputRef"), "Deve possuir ref de arquivo para Logo");
    assert.ok(viewContent.includes("ogFileInputRef"), "Deve possuir ref de arquivo para Open Graph");

    // Valida recomendações explícitas de tamanho em pixel
    assert.ok(viewContent.includes("32×32px") || viewContent.includes("32×32"), "Deve recomendar dimensões em pixel para Favicon (32x32px)");
    assert.ok(viewContent.includes("512×512px") || viewContent.includes("512×512"), "Deve recomendar dimensões em pixel para Logo (512x512px)");
    assert.ok(viewContent.includes("1200×630px") || viewContent.includes("1200×630"), "Deve recomendar dimensões em pixel para Open Graph (1200x630px)");

    // Valida suporte de tipos no backend
    const actionsPath = path.join(process.cwd(), "src/features/admin/actions.ts");
    const actionsContent = fs.readFileSync(actionsPath, "utf-8");
    assert.ok(actionsContent.includes("image/svg+xml"), "uploadStoreAssetAction deve suportar SVG");
    assert.ok(actionsContent.includes("image/x-icon"), "uploadStoreAssetAction deve suportar ICO");
  });
});

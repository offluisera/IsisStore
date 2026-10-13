import { describe, it } from "node:test";
import assert from "node:assert";
import { slideSchema } from "@/schemas/slides";
import { DEFAULT_HOME_SLIDES } from "@/lib/slides/types";
import { getThemeClasses } from "@/components/commerce/home-hero-slider";

describe("Hero Slider & Admin Slides Management", () => {
  it("deve conter slides padrão oficiais resilientes", () => {
    assert.ok(DEFAULT_HOME_SLIDES.length >= 3, "Deve possuir no mínimo 3 slides padrão");
    const firstSlide = DEFAULT_HOME_SLIDES[0];
    assert.strictEqual(firstSlide.title, "Produtos que fazem");
    assert.strictEqual(firstSlide.title_highlight, "você sorrir! ♡");
    assert.strictEqual(firstSlide.slide_type, "editorial");
    assert.strictEqual(firstSlide.is_active, true);
    assert.strictEqual(firstSlide.image_url, "/images/banner-rosto.jpeg");
  });

  it("deve validar schemas de slides válidos", () => {
    const validSlide = {
      title: "Nova Coleção de Semijoias",
      title_highlight: "com Amor! ♡",
      subtitle: "Descubra novidades com acabamento impecável.",
      badge_text: "✨ Exclusivo",
      image_url: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
      slide_type: "editorial",
      primary_button_text: "Conferir",
      primary_button_url: "/produtos",
      bg_theme: "gold_luxury",
      is_active: true,
      sort_order: 1,
    };

    const result = slideSchema.safeParse(validSlide);
    assert.ok(result.success, "Schema deve aceitar slide válido");
    if (result.success) {
      assert.strictEqual(result.data.title, "Nova Coleção de Semijoias");
      assert.strictEqual(result.data.bg_theme, "gold_luxury");
    }
  });

  it("deve validar UUIDs oficiais, seeds do banco e string vazia sem lançar 'Invalid UUID'", () => {
    // 1. Testa DEFAULT_HOME_SLIDES diretamente (que continha o ID que disparava erro)
    const seedResult = slideSchema.safeParse(DEFAULT_HOME_SLIDES[0]);
    assert.ok(seedResult.success, "Deve validar slides com ID de seed (ex: a0000000-0000-0000-0000-000000000001)");
    if (seedResult.success) {
      assert.strictEqual(seedResult.data.id, "a0000000-0000-0000-0000-000000000001");
    }

    // 2. Testa UUID v4 padrão
    const v4Result = slideSchema.safeParse({
      ...DEFAULT_HOME_SLIDES[0],
      id: "439febea-edee-4cef-a829-ee90052b145e",
    });
    assert.ok(v4Result.success, "Deve aceitar UUID v4 gerado pelo Supabase");

    // 3. Testa string vazia (novo slide enviado sem id)
    const emptyIdResult = slideSchema.safeParse({
      ...DEFAULT_HOME_SLIDES[0],
      id: "",
    });
    assert.ok(emptyIdResult.success, "Deve aceitar id como string vazia");
    if (emptyIdResult.success) {
      assert.strictEqual(emptyIdResult.data.id, undefined, "String vazia deve ser convertida para undefined");
    }

    // 4. Deve rejeitar UUID em formato incorreto
    const badIdResult = slideSchema.safeParse({
      ...DEFAULT_HOME_SLIDES[0],
      id: "not-a-valid-uuid",
    });
    assert.strictEqual(badIdResult.success, false, "Deve rejeitar strings arbitrárias como UUID");
  });

  it("deve rejeitar slides sem título ou sem imagem", () => {
    const invalidSlide = {
      title: "",
      image_url: "",
    };

    const result = slideSchema.safeParse(invalidSlide);
    assert.strictEqual(result.success, false, "Deve rejeitar slide sem título e imagem");
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0]);
      assert.ok(issues.includes("title"), "Deve apontar erro no título");
      assert.ok(issues.includes("image_url"), "Deve apontar erro na imagem");
    }
  });

  it("deve suportar temas visuais sem quebrar classes", () => {
    const defaultTheme = getThemeClasses("default");
    const darkTheme = getThemeClasses("dark_rose");
    const goldTheme = getThemeClasses("gold_luxury");

    assert.ok(defaultTheme.container.includes("from-secundaria-clara"), "Tema default deve ter gradiente Isis");
    assert.ok(darkTheme.container.includes("from-[#2A151C]"), "Tema dark deve ter tons nobres de vinho");
    assert.ok(goldTheme.container.includes("from-[#FDFBF7]"), "Tema dourado deve ter tons champagne");
  });
});

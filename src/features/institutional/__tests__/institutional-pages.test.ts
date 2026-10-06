import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import {
  DEFAULT_CONTACT_PAGE_SETTINGS,
  DEFAULT_TERMS_PAGE_SETTINGS,
  DEFAULT_PRIVACY_PAGE_SETTINGS,
} from "@/lib/settings/types";

describe("Páginas Institucionais (Contato, Termos e Privacidade)", () => {
  test("1. Existência e integridade dos arquivos de páginas", () => {
    const contatoPath = path.join(process.cwd(), "src", "app", "contato", "page.tsx");
    const termosPath = path.join(process.cwd(), "src", "app", "termos", "page.tsx");
    const privacidadePath = path.join(process.cwd(), "src", "app", "privacidade", "page.tsx");

    assert.ok(fs.existsSync(contatoPath), "src/app/contato/page.tsx deve existir");
    assert.ok(fs.existsSync(termosPath), "src/app/termos/page.tsx deve existir");
    assert.ok(fs.existsSync(privacidadePath), "src/app/privacidade/page.tsx deve existir");

    const contatoContent = fs.readFileSync(contatoPath, "utf-8");
    assert.ok(contatoContent.includes("contact_page_settings"), "Página de contato deve ler contact_page_settings");
    assert.ok(contatoContent.includes("ContactForm"), "Página de contato deve renderizar ContactForm");
    assert.ok(contatoContent.includes("faq_items"), "Página de contato deve renderizar FAQ dinâmico");

    const termosContent = fs.readFileSync(termosPath, "utf-8");
    assert.ok(termosContent.includes("terms_page_settings"), "Página de termos deve ler terms_page_settings");
    assert.ok(termosContent.includes("cdc_banner"), "Termos deve renderizar banner do CDC");

    const privacidadeContent = fs.readFileSync(privacidadePath, "utf-8");
    assert.ok(privacidadeContent.includes("privacy_page_settings"), "Página de privacidade deve ler privacy_page_settings");
    assert.ok(privacidadeContent.includes("dpo"), "Privacidade deve renderizar canal do DPO");
  });

  test("2. Defaults institucionais com estrita conformidade legal (CDC & LGPD)", () => {
    // Contato
    assert.ok(DEFAULT_CONTACT_PAGE_SETTINGS.faq_items.length >= 4, "Contato deve ter ao menos 4 FAQs padrão");
    assert.ok(DEFAULT_CONTACT_PAGE_SETTINGS.whatsapp_number.length > 0, "Contato deve ter WhatsApp oficial");

    // Termos (CDC)
    assert.ok(DEFAULT_TERMS_PAGE_SETTINGS.sections.length >= 7, "Termos deve conter ao menos 7 cláusulas contratuais");
    const cdcSection = DEFAULT_TERMS_PAGE_SETTINGS.sections.find((s) => s.id === "trocas-cdc");
    assert.ok(cdcSection, "Termos deve conter seção trocas-cdc");
    assert.ok(cdcSection?.content.includes("7 (sete) dias corridos"), "CDC deve garantir 7 dias corridos");

    // Privacidade (LGPD)
    assert.ok(DEFAULT_PRIVACY_PAGE_SETTINGS.sections.length >= 7, "Privacidade deve conter ao menos 7 cláusulas");
    assert.ok(DEFAULT_PRIVACY_PAGE_SETTINGS.hero_badge.includes("LGPD"), "Privacidade deve referenciar LGPD");
    assert.ok(DEFAULT_PRIVACY_PAGE_SETTINGS.dpo_email.includes("@"), "Privacidade deve ter e-mail do DPO");
  });

  test("3. Managers de edição com Live Preview no painel administrativo", () => {
    const contactManagerPath = path.join(
      process.cwd(),
      "src",
      "components",
      "admin",
      "institutional",
      "contact-page-manager.tsx"
    );
    const termsManagerPath = path.join(
      process.cwd(),
      "src",
      "components",
      "admin",
      "institutional",
      "terms-page-manager.tsx"
    );
    const privacyManagerPath = path.join(
      process.cwd(),
      "src",
      "components",
      "admin",
      "institutional",
      "privacy-page-manager.tsx"
    );

    assert.ok(fs.existsSync(contactManagerPath), "contact-page-manager.tsx deve existir");
    assert.ok(fs.existsSync(termsManagerPath), "terms-page-manager.tsx deve existir");
    assert.ok(fs.existsSync(privacyManagerPath), "privacy-page-manager.tsx deve existir");

    const contactMgr = fs.readFileSync(contactManagerPath, "utf-8");
    assert.ok(contactMgr.includes("Preview em Tempo Real"), "ContactManager deve ter preview em tempo real");
    assert.ok(contactMgr.includes("previewDevice"), "ContactManager deve permitir alternar desktop/mobile");

    const termsMgr = fs.readFileSync(termsManagerPath, "utf-8");
    assert.ok(termsMgr.includes("Preview em Tempo Real"), "TermsManager deve ter preview em tempo real");

    const privacyMgr = fs.readFileSync(privacyManagerPath, "utf-8");
    assert.ok(privacyMgr.includes("Preview em Tempo Real"), "PrivacyManager deve ter preview em tempo real");
  });

  test("4. Menu e abas de configurações no painel admin", () => {
    const sidebarPath = path.join(process.cwd(), "src", "components", "admin", "admin-sidebar.tsx");
    const settingsViewPath = path.join(process.cwd(), "src", "components", "admin", "store-settings-view.tsx");

    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    assert.ok(sidebarContent.includes("contact-page"), "Sidebar deve ter link para contact-page");
    assert.ok(sidebarContent.includes("terms-page"), "Sidebar deve ter link para terms-page");
    assert.ok(sidebarContent.includes("privacy-page"), "Sidebar deve ter link para privacy-page");

    const settingsViewContent = fs.readFileSync(settingsViewPath, "utf-8");
    assert.ok(settingsViewContent.includes("ContactPageManager"), "StoreSettingsView deve renderizar ContactPageManager");
    assert.ok(settingsViewContent.includes("TermsPageManager"), "StoreSettingsView deve renderizar TermsPageManager");
    assert.ok(settingsViewContent.includes("PrivacyPageManager"), "StoreSettingsView deve renderizar PrivacyPageManager");
  });

  test("5. robots.txt permite indexação das páginas institucionais", () => {
    const robotsData = robots();
    const defaultRule = Array.isArray(robotsData.rules)
      ? robotsData.rules[0]
      : robotsData.rules;

    const allowed = Array.isArray(defaultRule.allow)
      ? defaultRule.allow
      : [defaultRule.allow];

    assert.ok(allowed.includes("/contato"), "robots.txt deve permitir /contato");
    assert.ok(allowed.includes("/termos"), "robots.txt deve permitir /termos");
    assert.ok(allowed.includes("/privacidade"), "robots.txt deve permitir /privacidade");
  });

  test("6. sitemap.xml inclui rotas institucionais", async () => {
    const sitemapData = await sitemap();
    const urls = sitemapData.map((item) => item.url);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isisstore.com.br";

    assert.ok(urls.some((u) => u === `${siteUrl}/contato`), "sitemap deve conter /contato");
    assert.ok(urls.some((u) => u === `${siteUrl}/termos`), "sitemap deve conter /termos");
    assert.ok(urls.some((u) => u === `${siteUrl}/privacidade`), "sitemap deve conter /privacidade");
  });

  test("7. Footer inclui links para as 3 páginas institucionais", () => {
    const footerPath = path.join(process.cwd(), "src", "components", "layout", "footer.tsx");
    assert.ok(fs.existsSync(footerPath), "footer.tsx deve existir");

    const content = fs.readFileSync(footerPath, "utf-8");
    assert.ok(content.includes('href="/contato"'), "Footer deve conter link para /contato");
    assert.ok(content.includes('href="/termos"'), "Footer deve conter link para /termos");
    assert.ok(content.includes('href="/privacidade"'), "Footer deve conter link para /privacidade");
  });
});


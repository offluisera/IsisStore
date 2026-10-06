import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("Páginas Institucionais (Contato, Termos e Privacidade)", () => {
  test("1. Existência e integridade dos arquivos de páginas", () => {
    const contatoPath = path.join(process.cwd(), "src", "app", "contato", "page.tsx");
    const termosPath = path.join(process.cwd(), "src", "app", "termos", "page.tsx");
    const privacidadePath = path.join(process.cwd(), "src", "app", "privacidade", "page.tsx");

    assert.ok(fs.existsSync(contatoPath), "src/app/contato/page.tsx deve existir");
    assert.ok(fs.existsSync(termosPath), "src/app/termos/page.tsx deve existir");
    assert.ok(fs.existsSync(privacidadePath), "src/app/privacidade/page.tsx deve existir");

    const contatoContent = fs.readFileSync(contatoPath, "utf-8");
    assert.ok(contatoContent.includes("Fale Conosco"), "Página de contato deve ter título Fale Conosco");
    assert.ok(contatoContent.includes("ContactForm"), "Página de contato deve renderizar ContactForm");
    assert.ok(contatoContent.includes("Perguntas Frequentes"), "Página de contato deve ter FAQ");

    const termosContent = fs.readFileSync(termosPath, "utf-8");
    assert.ok(termosContent.includes("Código de Defesa do Consumidor"), "Termos deve citar o CDC");
    assert.ok(termosContent.includes("7 (sete) dias"), "Termos deve citar direito de arrependimento de 7 dias");
    assert.ok(termosContent.includes("Garantia de Qualidade"), "Termos deve citar cuidados e garantia");

    const privacidadeContent = fs.readFileSync(privacidadePath, "utf-8");
    assert.ok(privacidadeContent.includes("LGPD"), "Privacidade deve citar LGPD");
    assert.ok(privacidadeContent.includes("Lei nº 13.709/2018"), "Privacidade deve citar o número da lei 13.709/2018");
    assert.ok(privacidadeContent.includes("Seus Direitos como Titular"), "Privacidade deve listar direitos do titular");
  });

  test("2. robots.txt permite indexação das páginas institucionais", () => {
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

  test("3. sitemap.xml inclui rotas institucionais", async () => {
    const sitemapData = await sitemap();
    const urls = sitemapData.map((item) => item.url);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isisstore.com.br";

    assert.ok(urls.some((u) => u === `${siteUrl}/contato`), "sitemap deve conter /contato");
    assert.ok(urls.some((u) => u === `${siteUrl}/termos`), "sitemap deve conter /termos");
    assert.ok(urls.some((u) => u === `${siteUrl}/privacidade`), "sitemap deve conter /privacidade");
  });

  test("4. Footer inclui links para as 3 páginas institucionais", () => {
    const footerPath = path.join(process.cwd(), "src", "components", "layout", "footer.tsx");
    assert.ok(fs.existsSync(footerPath), "footer.tsx deve existir");

    const content = fs.readFileSync(footerPath, "utf-8");
    assert.ok(content.includes('href="/contato"'), "Footer deve conter link para /contato");
    assert.ok(content.includes('href="/termos"'), "Footer deve conter link para /termos");
    assert.ok(content.includes('href="/privacidade"'), "Footer deve conter link para /privacidade");
  });
});

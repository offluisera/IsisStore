import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as healthCheckGet } from "@/app/api/health/route";

describe("Gate 18 — Produção & Go-Live", () => {
  test("1. Validação das Diretivas do robots.txt", () => {
    const robotsData = robots();
    assert.ok(robotsData, "robots() deve retornar um objeto de configuração");
    assert.ok(Array.isArray(robotsData.rules), "rules deve ser um array");

    const defaultRule = Array.isArray(robotsData.rules)
      ? robotsData.rules[0]
      : robotsData.rules;

    assert.ok(defaultRule, "Regra padrão de indexação deve existir");

    const allowed = Array.isArray(defaultRule.allow)
      ? defaultRule.allow
      : [defaultRule.allow];
    const disallowed = Array.isArray(defaultRule.disallow)
      ? defaultRule.disallow
      : [defaultRule.disallow];

    // Rotas públicas devem ser permitidas
    assert.ok(allowed.includes("/"), "Rota / deve ser indexável");
    assert.ok(allowed.includes("/produtos"), "Rota /produtos deve ser indexável");
    assert.ok(allowed.includes("/categorias"), "Rota /categorias deve ser indexável");

    // Rotas privadas devem ser bloqueadas
    assert.ok(disallowed.includes("/admin"), "Rota /admin deve ser bloqueada para bots");
    assert.ok(disallowed.includes("/conta"), "Rota /conta deve ser bloqueada para bots");
    assert.ok(disallowed.includes("/checkout"), "Rota /checkout deve ser bloqueada para bots");
    assert.ok(disallowed.includes("/api/*"), "Rotas /api/* devem ser bloqueadas para bots");

    // Sitemap deve estar referenciado
    assert.ok(
      typeof robotsData.sitemap === "string" && robotsData.sitemap.includes("/sitemap.xml"),
      "robots.txt deve indicar a URL canônica do sitemap.xml"
    );
  });

  test("2. Geração Resiliente do sitemap.xml", async () => {
    const sitemapData = await sitemap();
    assert.ok(Array.isArray(sitemapData), "sitemap() deve retornar uma lista de rotas");
    assert.ok(sitemapData.length >= 4, "sitemap deve conter no mínimo as rotas públicas essenciais");

    const urls = sitemapData.map((item) => item.url);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isisstore.com.br";

    assert.ok(urls.some((u) => u === `${siteUrl}`), "Home deve constar no sitemap");
    assert.ok(urls.some((u) => u === `${siteUrl}/produtos`), "Página de produtos deve constar no sitemap");
    assert.ok(urls.some((u) => u === `${siteUrl}/categorias`), "Página de categorias deve constar no sitemap");

    // Verificar estrutura de cada item
    for (const item of sitemapData) {
      assert.ok(item.url.startsWith("http"), `URL ${item.url} deve ser absoluta`);
      assert.ok(item.lastModified, "Item do sitemap deve conter lastModified");
      assert.ok(item.priority !== undefined, "Item do sitemap deve conter prioridade definida");
    }
  });

  test("3. Endpoint de Uptime & Health Check (/api/health)", async () => {
    const response = await healthCheckGet();
    assert.ok(response, "GET /api/health deve responder");
    
    // Status pode ser 200 (healthy) ou 503 (degraded se banco não estiver disponível em teste local)
    assert.ok(
      [200, 503].includes(response.status),
      `Status HTTP deve ser 200 ou 503, recebido: ${response.status}`
    );

    const cacheHeader = response.headers.get("Cache-Control");
    assert.ok(
      cacheHeader && cacheHeader.includes("no-store"),
      "Endpoint de healthcheck deve desabilitar cache via Cache-Control: no-store"
    );

    const body = await response.json();
    assert.ok(["healthy", "degraded"].includes(body.status), "Campo status deve ser válido");
    assert.ok(body.timestamp, "Deve conter timestamp ISO");
    assert.ok(typeof body.uptime_seconds === "number", "Deve conter uptime_seconds");
    assert.ok(body.checks && body.checks.database, "Deve conter relatório de checks do banco");
  });

  test("4. Integridade da Matriz de Variáveis (.env.production.example)", () => {
    const envProdPath = path.join(process.cwd(), ".env.production.example");
    assert.ok(fs.existsSync(envProdPath), ".env.production.example deve existir");

    const content = fs.readFileSync(envProdPath, "utf-8");

    const requiredVars = [
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_APP_URL",
      "NODE_ENV",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "MERCADOPAGO_ACCESS_TOKEN",
      "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY",
      "MERCADOPAGO_WEBHOOK_SECRET",
      "ADMIN_MASTER_PASSWORD",
    ];

    for (const varName of requiredVars) {
      assert.ok(
        content.includes(`${varName}=`),
        `Variável ${varName} deve estar presente em .env.production.example`
      );
    }

    // Blindagem de segurança: nunca commitar segredos reais
    assert.ok(
      !content.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS"),
      "Nenhuma chave JWT real de produção deve constar no template versionado"
    );
  });

  test("5. Hardening de Produção em next.config.ts", () => {
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    assert.ok(fs.existsSync(nextConfigPath), "next.config.ts deve existir");

    const content = fs.readFileSync(nextConfigPath, "utf-8");

    assert.ok(content.includes("compress: true"), "Compressão gzip/brotli deve estar ativa");
    assert.ok(content.includes("poweredByHeader: false"), "X-Powered-By deve ser desativado para segurança");
    assert.ok(content.includes("image/webp"), "Formato WebP deve estar configurado");
    assert.ok(content.includes("image/avif"), "Formato AVIF deve estar configurado");
    assert.ok(content.includes("X-Frame-Options"), "Cabeçalho X-Frame-Options deve estar ativo");
    assert.ok(content.includes("X-Content-Type-Options"), "Cabeçalho X-Content-Type-Options deve estar ativo");
    assert.ok(content.includes("Referrer-Policy"), "Cabeçalho Referrer-Policy deve estar ativo");
  });

  test("6. Documentação Oficial de Deploy e Go-Live (docs/DEPLOYMENT.md)", () => {
    const docPath = path.join(process.cwd(), "docs", "DEPLOYMENT.md");
    assert.ok(fs.existsSync(docPath), "docs/DEPLOYMENT.md deve existir");

    const content = fs.readFileSync(docPath, "utf-8");

    assert.ok(content.includes("Visão Geral da Infraestrutura"), "Deve conter visão geral");
    assert.ok(content.includes("Checklist Pré-Deploy"), "Deve conter checklist pré-deploy");
    assert.ok(content.includes("Matriz de Variáveis de Ambiente"), "Deve conter matriz de env");
    assert.ok(content.includes("Mercado Pago"), "Deve orientar gateway Mercado Pago");
    assert.ok(content.includes("Certificado SSL"), "Deve orientar domínio e SSL");
    assert.ok(content.includes("Health Check"), "Deve orientar monitoramento e healthcheck");
    assert.ok(content.includes("Disaster Recovery"), "Deve orientar plano de backup e recuperação");
    assert.ok(content.includes("Runbook de Go-Live"), "Deve conter checklist de abertura oficial");
  });
});

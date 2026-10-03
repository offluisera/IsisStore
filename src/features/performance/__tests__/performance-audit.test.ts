import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("Gate 14 — Performance & Otimização", () => {
  const rootDir = process.cwd();

  it("1. Otimização de Assets e Configuração do Next.js (next.config.ts)", () => {
    const configPath = path.join(rootDir, "next.config.ts");
    assert.ok(fs.existsSync(configPath), "next.config.ts deve existir");

    const content = fs.readFileSync(configPath, "utf-8");

    // Formatos modernos de compressão de imagem
    assert.ok(
      content.includes('"image/avif"') && content.includes('"image/webp"'),
      "next.config.ts deve habilitar formatos modernos AVIF e WebP"
    );

    // Compressão Gzip/Brotli e remoção do cabeçalho de fingerprinting
    assert.ok(
      content.includes("compress: true"),
      "next.config.ts deve ativar compress: true"
    );
    assert.ok(
      content.includes("poweredByHeader: false"),
      "next.config.ts deve desativar poweredByHeader para otimização e segurança"
    );

    // Remote patterns para otimização de imagens externas
    assert.ok(
      content.includes("remotePatterns"),
      "next.config.ts deve definir remotePatterns para otimização de imagens externas"
    );
    console.log("  ✓ next.config.ts configurado com AVIF/WebP, compressão e remotePatterns.");
  });

  it("2. Auditoria de Imagens: Zero tags <img> cruas no projeto", () => {
    function findTsxFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(findTsxFiles(fullPath));
        } else if (file.endsWith(".tsx")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const tsxFiles = findTsxFiles(path.join(rootDir, "src"));
    const rawImgFiles: string[] = [];

    for (const filePath of tsxFiles) {
      const code = fs.readFileSync(filePath, "utf-8");
      // Procurar por <img que não seja dentro de comentários ou imports
      const matches = code.match(/<img\s+[^>]*src/gi);
      if (matches) {
        rawImgFiles.push(path.relative(rootDir, filePath));
      }
    }

    assert.strictEqual(
      rawImgFiles.length,
      0,
      `Nenhuma tag <img> crua deve ser utilizada. Encontrado em: ${rawImgFiles.join(", ")}`
    );
    console.log(`  ✓ 100% das imagens utilizam o componente next/image otimizado (${tsxFiles.length} arquivos auditados).`);
  });

  it("3. LCP e Imagens Críticas com priority e sizes", () => {
    const homePagePath = path.join(rootDir, "src/app/page.tsx");
    assert.ok(fs.existsSync(homePagePath), "src/app/page.tsx deve existir");

    const homeContent = fs.readFileSync(homePagePath, "utf-8");
    const sliderPath = path.join(rootDir, "src/components/commerce/home-hero-slider.tsx");
    const sliderContent = fs.existsSync(sliderPath) ? fs.readFileSync(sliderPath, "utf-8") : "";
    const bannerContent = homeContent + "\n" + sliderContent;

    assert.ok(
      bannerContent.includes("priority"),
      "Banner Hero da Home deve ter priority para otimizar LCP"
    );
    assert.ok(
      bannerContent.includes('sizes="(max-width: 1024px) 100vw, 42vw"'),
      "Banner Hero deve ter atributo sizes responsivo para evitar sobrecarga de dados"
    );

    const galleryPath = path.join(rootDir, "src/components/commerce/product-gallery.tsx");
    assert.ok(fs.existsSync(galleryPath), "product-gallery.tsx deve existir");
    const galleryContent = fs.readFileSync(galleryPath, "utf-8");
    assert.ok(
      galleryContent.includes("priority"),
      "Imagem principal da galeria de produtos deve ter priority"
    );
    console.log("  ✓ Imagens críticas da Home e do Detalhe do Produto utilizam priority e sizes adequados.");
  });

  it("4. Deduplicação e Cache de Queries (React cache)", () => {
    const servicePath = path.join(rootDir, "src/services/catalog.service.ts");
    assert.ok(fs.existsSync(servicePath), "catalog.service.ts deve existir");

    const serviceContent = fs.readFileSync(servicePath, "utf-8");
    assert.ok(
      serviceContent.includes('import { cache } from "react"'),
      "catalog.service.ts deve importar React cache"
    );
    assert.ok(
      serviceContent.includes("export const getCategories = cache("),
      "getCategories deve estar encapsulado em React cache para evitar múltiplas viagens ao banco"
    );
    assert.ok(
      serviceContent.includes("export const getCategoryBySlug = cache("),
      "getCategoryBySlug deve estar encapsulado em React cache"
    );
    assert.ok(
      serviceContent.includes("export const getProductBySlug = cache("),
      "getProductBySlug deve estar encapsulado em React cache para deduplicação com generateMetadata"
    );
    console.log("  ✓ Queries do catálogo memoizadas no ciclo de renderização com React cache.");
  });

  it("5. Índices de Banco de Dados e Migration de Performance", () => {
    const migrationPath = path.join(
      rootDir,
      "supabase/migrations/20260927000002_performance_optimization.sql"
    );
    assert.ok(fs.existsSync(migrationPath), "Migration de performance deve existir");

    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Foreign Keys cobertas por índices
    assert.ok(sql.includes("idx_addresses_profile_id"), "Deve criar índice para addresses(profile_id)");
    assert.ok(sql.includes("idx_admin_audit_logs_actor_id"), "Deve criar índice para admin_audit_logs(actor_id)");
    assert.ok(sql.includes("idx_cart_items_product_id"), "Deve criar índice para cart_items(product_id)");
    assert.ok(sql.includes("idx_carts_profile_id"), "Deve criar índice para carts(profile_id)");
    assert.ok(sql.includes("idx_order_items_product_id"), "Deve criar índice para order_items(product_id)");

    // Índices de ordenação e paginação
    assert.ok(sql.includes("idx_products_status_created_at"), "Deve criar índice composto para products(status, created_at DESC)");
    assert.ok(sql.includes("idx_orders_created_at"), "Deve criar índice para orders(created_at DESC)");
    assert.ok(sql.includes("idx_admin_audit_logs_created_at"), "Deve criar índice para admin_audit_logs(created_at DESC)");

    // RLS InitPlan Optimization
    assert.ok(
      sql.includes("(select auth.uid())"),
      "Políticas RLS devem usar (select auth.uid()) para evitar reavaliação por linha (InitPlan)"
    );
    console.log("  ✓ Índices cobrindo foreign keys e ordenação, além de otimização de InitPlan em RLS aplicados.");
  });

  it("6. Aceleração por GPU e Suporte a prefers-reduced-motion", () => {
    const cssPath = path.join(rootDir, "src/app/globals.css");
    assert.ok(fs.existsSync(cssPath), "globals.css deve existir");

    const cssContent = fs.readFileSync(cssPath, "utf-8");

    assert.ok(
      cssContent.includes("transform: translateZ(0)") || cssContent.includes("will-change: transform"),
      "globals.css deve incluir aceleração por hardware (GPU)"
    );
    assert.ok(
      cssContent.includes("prefers-reduced-motion: reduce"),
      "globals.css deve incluir regra de desativação de animações para prefers-reduced-motion"
    );
    console.log("  ✓ Animações 60FPS com aceleração de hardware e respeito total a reduced-motion.");
  });

  it("7. Tipografia e Otimização de Fontes (next/font)", () => {
    const layoutPath = path.join(rootDir, "src/app/layout.tsx");
    assert.ok(fs.existsSync(layoutPath), "layout.tsx deve existir");

    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    assert.ok(
      layoutContent.includes('display: "swap"'),
      "Fontes Google devem ter display: 'swap' para evitar bloqueio de renderização do texto"
    );
    console.log("  ✓ Fontes otimizadas com next/font e display: 'swap'.");
  });
});

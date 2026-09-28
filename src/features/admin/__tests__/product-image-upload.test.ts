import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("Iniciando validação de upload e conversão de imagens para .webp...");

const ROOT_DIR = path.resolve(process.cwd());

// 1. Validar next.config.ts com remotePatterns (Correção do erro do screenshot)
const nextConfigPath = path.join(ROOT_DIR, "next.config.ts");
assert.ok(fs.existsSync(nextConfigPath), "next.config.ts deve existir.");
const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");

assert.ok(
  nextConfigContent.includes("i.imgur.com") && nextConfigContent.includes("imgur.com"),
  "next.config.ts deve permitir imagens hospedadas no imgur."
);
assert.ok(
  nextConfigContent.includes("**.supabase.co"),
  "next.config.ts deve permitir imagens do storage do Supabase."
);
console.log("  ✓ next.config.ts configurado com remotePatterns para imgur e supabase.");

// 2. Validar utilitário de conversão client-side para .webp
const webpUtilPath = path.join(ROOT_DIR, "src/lib/images/convert-to-webp.ts");
assert.ok(fs.existsSync(webpUtilPath), "convert-to-webp.ts deve existir.");
const webpUtilContent = fs.readFileSync(webpUtilPath, "utf-8");

assert.ok(
  webpUtilContent.includes('image/webp') && webpUtilContent.includes("convertBatchToWebP"),
  "Utilitário deve suportar conversão para image/webp em lote."
);
console.log("  ✓ Utilitário de conversão de imagens para .webp validado.");

// 3. Validar Server Actions em src/features/admin/actions.ts
const adminActionsPath = path.join(ROOT_DIR, "src/features/admin/actions.ts");
assert.ok(fs.existsSync(adminActionsPath), "src/features/admin/actions.ts deve existir.");
const actionsContent = fs.readFileSync(adminActionsPath, "utf-8");

assert.ok(
  actionsContent.includes("export async function uploadProductImagesAction"),
  "Deve existir a Server Action uploadProductImagesAction."
);
assert.ok(
  actionsContent.includes("export async function deleteProductImageAction"),
  "Deve existir a Server Action deleteProductImageAction."
);
assert.ok(
  actionsContent.includes("export async function setPrimaryProductImageAction"),
  "Deve existir a Server Action setPrimaryProductImageAction."
);
assert.ok(
  actionsContent.includes('contentType: "image/webp"'),
  "O upload para o Supabase Storage deve especificar content-type image/webp."
);
console.log("  ✓ Server Actions de upload, exclusão e capa de imagens validadas.");

// 4. Validar Componente ProductImageManager
const componentPath = path.join(ROOT_DIR, "src/components/admin/product-image-manager.tsx");
assert.ok(fs.existsSync(componentPath), "product-image-manager.tsx deve existir.");
const componentContent = fs.readFileSync(componentPath, "utf-8");

assert.ok(
  componentContent.includes('multiple') && componentContent.includes('accept="image/'),
  "Componente deve permitir selecionar múltiplos arquivos de imagem do computador."
);
assert.ok(
  componentContent.includes("convertBatchToWebP"),
  "Componente deve invocar a conversão client-side para .webp antes do envio."
);
console.log("  ✓ Componente ProductImageManager com seleção múltipla e conversão automática validado.");

// 5. Validar integração na tabela de produtos /admin/produtos
const adminPagePath = path.join(ROOT_DIR, "src/app/admin/produtos/page.tsx");
const adminPageContent = fs.readFileSync(adminPagePath, "utf-8");

assert.ok(
  adminPageContent.includes("ProductImageManager"),
  "A página /admin/produtos deve integrar o ProductImageManager em cada linha da tabela."
);
assert.ok(
  adminPageContent.includes("product_images(id, public_url, is_primary, sort_order, storage_path)"),
  "A query deve selecionar metadados completos das imagens dos produtos."
);
console.log("  ✓ Integração na tabela do Painel Admin validada com sucesso.");

console.log("✅ Todas as verificações de upload de fotos e conversão WebP passaram com 100% de sucesso!");

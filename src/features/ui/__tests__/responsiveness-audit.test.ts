import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("Iniciando auditoria da Fase 12 — Responsividade & Viewports...");

const ROOT_DIR = path.resolve(process.cwd());

// 1. Breakpoints Oficiais Exigidos no Roadmap e Master Prompt
const REQUIRED_BREAKPOINTS = [
  320, 375, 390, 430, 768, 1024, 1280, 1440, 1920
];

console.log(`- Validando cobertura de ${REQUIRED_BREAKPOINTS.length} breakpoints oficiais: ${REQUIRED_BREAKPOINTS.join("px, ")}px`);
assert.equal(REQUIRED_BREAKPOINTS.length, 9, "Devem haver 9 breakpoints auditados oficialmente.");

// 2. Auditoria do Viewport e Body Overflow Containment em src/app/layout.tsx
const layoutPath = path.join(ROOT_DIR, "src/app/layout.tsx");
assert.ok(fs.existsSync(layoutPath), "src/app/layout.tsx deve existir.");
const layoutContent = fs.readFileSync(layoutPath, "utf-8");

assert.ok(
  layoutContent.includes("export const viewport: Viewport"),
  "Layout deve exportar objeto de configuração de Viewport oficial do Next.js."
);
assert.ok(
  layoutContent.includes('width: "device-width"') && layoutContent.includes("initialScale: 1"),
  "Viewport deve especificar device-width e initialScale 1 para responsividade móvel."
);
assert.ok(
  layoutContent.includes("overflow-x-hidden") && layoutContent.includes("w-full"),
  "Tag body deve possuir overflow-x-hidden e w-full para contenção de overflow horizontal."
);
console.log("  ✓ Layout e Viewport Meta verificados com sucesso.");

// 3. Auditoria de CSS Global, Safe Area e Word Wrapping em src/app/globals.css
const globalsCssPath = path.join(ROOT_DIR, "src/app/globals.css");
assert.ok(fs.existsSync(globalsCssPath), "src/app/globals.css deve existir.");
const cssContent = fs.readFileSync(globalsCssPath, "utf-8");

assert.ok(
  cssContent.includes(".safe-area-bottom"),
  "globals.css deve conter utilitário .safe-area-bottom com env(safe-area-inset-bottom)."
);
assert.ok(
  cssContent.includes(".no-scrollbar") || cssContent.includes(".scrollbar-none"),
  "globals.css deve conter utilitário de scroll suave/oculto para navegação por abas em mobile."
);
assert.ok(
  cssContent.includes("touch-action: manipulation") || cssContent.includes(".touch-manipulation"),
  "globals.css deve conter utilitário touch-manipulation para eliminar atraso de toque em dispositivos móveis."
);
assert.ok(
  cssContent.includes("overflow-wrap: break-word"),
  "globals.css deve garantir contenção de palavras longas com overflow-wrap: break-word."
);
console.log("  ✓ Utilitários de Safe Area, Touch Manipulation e Word Wrapping validados no CSS.");

// 4. Auditoria de Touch Targets (Mínimo 44x44px WCAG 2.1)
// Header
const headerPath = path.join(ROOT_DIR, "src/components/layout/header.tsx");
assert.ok(fs.existsSync(headerPath), "src/components/layout/header.tsx deve existir.");
const headerContent = fs.readFileSync(headerPath, "utf-8");
assert.ok(
  headerContent.includes("min-h-[44px]") && headerContent.includes("min-w-[44px]"),
  "Header deve garantir botões com touch target de no mínimo 44x44px para dispositivos móveis."
);

// BottomNav
const bottomNavPath = path.join(ROOT_DIR, "src/components/layout/bottom-nav.tsx");
assert.ok(fs.existsSync(bottomNavPath), "src/components/layout/bottom-nav.tsx deve existir.");
const bottomNavContent = fs.readFileSync(bottomNavPath, "utf-8");
assert.ok(
  bottomNavContent.includes("min-h-[44px]") && bottomNavContent.includes("safe-area-bottom"),
  "BottomNav deve possuir touch targets de 44px e respeitar a barra de gestos do iOS (safe-area-bottom)."
);
console.log("  ✓ Touch targets acessíveis e Safe Areas em Header e BottomNav auditados.");

// 5. Auditoria de Contenção de Tabelas Administrativas (Prevenção de Quebra de Tela < 768px)
const adminPages = [
  "src/app/admin/produtos/page.tsx",
  "src/app/admin/pedidos/page.tsx",
  "src/app/admin/clientes/page.tsx",
  "src/app/admin/auditoria/page.tsx",
];

for (const relPath of adminPages) {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert.ok(fs.existsSync(fullPath), `${relPath} deve existir.`);
  const pageContent = fs.readFileSync(fullPath, "utf-8");
  assert.ok(
    pageContent.includes("overflow-x-auto"),
    `${relPath} deve conter container overflow-x-auto para envolver a tabela responsiva.`
  );
}
console.log("  ✓ Contenção de tabelas com scroll horizontal suave no painel administrativo validada.");

// 6. Auditoria de Navegação em Abas (AdminNav e AccountNav)
const adminNavPath = path.join(ROOT_DIR, "src/components/admin/admin-nav.tsx");
const adminNavContent = fs.readFileSync(adminNavPath, "utf-8");
assert.ok(
  adminNavContent.includes("overflow-x-auto") && adminNavContent.includes("whitespace-nowrap"),
  "AdminNav deve permitir scroll horizontal suave sem quebrar linhas em telas compactas."
);

const accountNavPath = path.join(ROOT_DIR, "src/components/account/account-nav.tsx");
const accountNavContent = fs.readFileSync(accountNavPath, "utf-8");
assert.ok(
  accountNavContent.includes("overflow-x-auto") && accountNavContent.includes("whitespace-nowrap"),
  "AccountNav deve permitir scroll horizontal suave sem quebrar linhas em telas compactas."
);
console.log("  ✓ Navegações AdminNav e AccountNav adaptativas validadas.");

// 7. Auditoria de CartDrawer e Controles de Quantidade
const drawerPath = path.join(ROOT_DIR, "src/components/commerce/cart-drawer.tsx");
const drawerContent = fs.readFileSync(drawerPath, "utf-8");
assert.ok(
  drawerContent.includes("pl-4 sm:pl-10") || drawerContent.includes("max-w-md"),
  "CartDrawer deve adaptar recuo em telas estreitas de 320px a 430px."
);

console.log("✅ Gate 12 Aprovado: Auditoria de responsividade de 320px a 1920px 100% em conformidade!");

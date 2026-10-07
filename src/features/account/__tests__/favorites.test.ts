import assert from "node:assert/strict";
import { describe, test } from "node:test";
import fs from "node:fs";
import path from "node:path";

describe("Fluxo de Favoritos (Wishlist) — Redirecionamento e Proteção", () => {
  const rootDir = process.cwd();

  test("1. Rota /favoritos deve existir e implementar redirecionamento condicional", () => {
    const favoritosPagePath = path.join(rootDir, "src", "app", "favoritos", "page.tsx");
    assert.ok(fs.existsSync(favoritosPagePath), "Arquivo src/app/favoritos/page.tsx deve existir");

    const content = fs.readFileSync(favoritosPagePath, "utf-8");
    assert.ok(
      content.includes("/login?next=/conta/favoritos"),
      "Deve redirecionar visitante não autenticado para /login?next=/conta/favoritos"
    );
    assert.ok(
      content.includes("/conta/favoritos"),
      "Deve redirecionar cliente logado para /conta/favoritos"
    );
  });

  test("2. Middleware deve interceptar /favoritos e redirecionar com base na sessão", () => {
    const middlewarePath = path.join(rootDir, "src", "lib", "supabase", "middleware.ts");
    assert.ok(fs.existsSync(middlewarePath), "Arquivo src/lib/supabase/middleware.ts deve existir");

    const content = fs.readFileSync(middlewarePath, "utf-8");
    assert.ok(
      content.includes('pathname === "/favoritos"'),
      "Middleware deve tratar a rota /favoritos"
    );
    assert.ok(
      content.includes('loginUrl.searchParams.set("next", "/conta/favoritos")'),
      "Middleware deve definir retorno para /conta/favoritos no login"
    );
    assert.ok(
      content.includes('favoritosUrl.pathname = "/conta/favoritos"'),
      "Middleware deve direcionar cliente autenticado para /conta/favoritos"
    );
  });

  test("3. Header da loja deve direcionar para /favoritos no ícone de coração", () => {
    const headerPath = path.join(rootDir, "src", "components", "layout", "header.tsx");
    assert.ok(fs.existsSync(headerPath), "Arquivo header.tsx deve existir");

    const content = fs.readFileSync(headerPath, "utf-8");
    assert.ok(
      content.includes('href="/favoritos"'),
      "Header deve possuir link para /favoritos no ícone de coração"
    );
  });

  test("4. Página de favoritos do cliente em /conta/favoritos deve existir com suporte a catálogo e dark mode", () => {
    const accountFavoritosPath = path.join(rootDir, "src", "app", "conta", "favoritos", "page.tsx");
    assert.ok(fs.existsSync(accountFavoritosPath), "Arquivo src/app/conta/favoritos/page.tsx deve existir");

    const content = fs.readFileSync(accountFavoritosPath, "utf-8");
    assert.ok(content.includes("Meus Favoritos"), "Deve conter o título 'Meus Favoritos'");
    assert.ok(content.includes("dark:"), "Deve conter classes do Tailwind para suporte a Dark Mode");
  });
});

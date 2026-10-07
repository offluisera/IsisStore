import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificação segura do usuário através do Supabase Auth Server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Proteção de Rotas Administrativas (/admin e subrotas)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Gate 04: Usuário comum bloqueado na área administrativa
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = "/conta";
      unauthorizedUrl.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 2. Proteção de Rotas do Cliente (/conta e subrotas)
  if (pathname.startsWith("/conta")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2.1 Redirecionamento da Rota de Favoritos (/favoritos)
  if (pathname === "/favoritos") {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", "/conta/favoritos");
      return NextResponse.redirect(loginUrl);
    } else {
      const favoritosUrl = request.nextUrl.clone();
      favoritosUrl.pathname = "/conta/favoritos";
      return NextResponse.redirect(favoritosUrl);
    }
  }

  // 3. Redirecionamento de usuário autenticado fora de rotas auth públicas
  const authRoutes = ["/login", "/cadastro", "/recuperar-senha"];
  if (user && authRoutes.some((route) => pathname === route)) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const redirectUrl = request.nextUrl.clone();
    const isValidPath =
      nextParam &&
      nextParam.startsWith("/") &&
      !nextParam.startsWith("//") &&
      !nextParam.includes("\\");

    redirectUrl.pathname = isValidPath ? nextParam : "/conta";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

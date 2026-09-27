import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Cliente";

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-borda sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-primaria/20 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/images/logo/logo.jpeg"
                alt="Isis Store"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-texto-escuro group-hover:text-primaria transition-colors leading-none">
                Isis Store
              </span>
              <span className="text-[10px] text-texto-claro tracking-widest uppercase mt-0.5">
                Área do Cliente
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "hidden sm:inline-flex text-xs text-texto-medio hover:text-primaria",
              })}
            >
              Ir para Loja
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "hidden sm:inline-flex items-center gap-1.5 text-xs",
                })}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primaria" />
                <span>Painel Admin</span>
              </Link>
            )}

            <form action="/auth/signout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-texto-claro hover:text-erro hover:bg-erro/10 gap-1.5 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl border border-borda shadow-xs p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center font-serif text-2xl font-bold border border-primaria/20 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-texto-escuro">
                  Olá, {displayName}
                </h1>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Administrador" : "Cliente"}
                </Badge>
              </div>
              <p className="text-xs text-texto-claro mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/produtos"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "text-xs font-semibold",
              })}
            >
              Explorar Catálogo
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <AccountNav />
        </div>

        {/* Dynamic Page Content */}
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 text-center text-xs text-texto-claro border-t border-borda/60 bg-white">
        <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

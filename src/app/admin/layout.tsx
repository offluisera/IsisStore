import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // Dupla checagem server-side de segurança (Gate 04)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/conta?error=unauthorized_admin");
  }

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-borda sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-primaria/20 shadow-xs">
                <Image
                  src="/images/logo/logo.jpeg"
                  alt="Isis Store"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif text-lg font-semibold tracking-tight">
                Isis Store
              </span>
            </Link>
            <Badge variant="default" className="text-[10px] py-0.5 px-2">
              PAINEL ADMIN
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-texto-claro hover:text-primaria transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Loja</span>
            </Link>

            <div className="h-4 w-px bg-borda" />

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

      {/* Admin Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <AdminNav />
        {children}
      </div>

      {/* Admin Footer */}
      <footer className="w-full py-4 text-center text-xs text-texto-claro border-t border-borda/60 bg-white">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-sucesso" />
          <span>Isis Store Backoffice &bull; Proteção RLS &amp; RBAC Ativa</span>
        </div>
      </footer>
    </div>
  );
}

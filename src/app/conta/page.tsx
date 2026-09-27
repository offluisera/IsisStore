import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  MapPin,
  User,
  ShieldAlert,
  LogOut,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ContaPage({ searchParams }: ContaPageProps) {
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

  const resolvedSearchParams = await searchParams;
  const isUnauthorizedAdmin =
    resolvedSearchParams.error === "unauthorized_admin";
  const isPasswordUpdated =
    resolvedSearchParams.message === "senha_atualizada";

  const isAdmin = profile?.role === "admin";
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Cliente";

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro">
      {/* Top Header */}
      <header className="bg-white border-b border-borda sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
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

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "hidden sm:inline-flex items-center gap-1.5",
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
                className="text-texto-claro hover:text-erro hover:bg-erro/10 gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Banner de Erro: Tentativa de Acesso Admin Bloqueada */}
        {isUnauthorizedAdmin && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-erro/10 border border-erro/20 flex items-start gap-3.5 text-erro animate-in fade-in"
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Acesso Restrito</p>
              <p className="text-xs text-erro/90 mt-0.5 leading-relaxed">
                Seu perfil possui permissão padrão de cliente e não pode acessar o painel administrativo. O incidente foi registrado para segurança.
              </p>
            </div>
          </div>
        )}

        {/* Banner de Sucesso: Senha Atualizada */}
        {isPasswordUpdated && (
          <div
            role="status"
            className="mb-6 p-4 rounded-2xl bg-sucesso/10 border border-sucesso/20 flex items-start gap-3.5 text-sucesso animate-in fade-in"
          >
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Senha Atualizada</p>
              <p className="text-xs text-sucesso/90 mt-0.5">
                Sua credencial de acesso foi alterada com sucesso e sua conta está protegida.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-borda shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center font-serif text-2xl font-semibold border border-primaria/20 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
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
              href="/"
              className={buttonVariants({ variant: "white", size: "default" })}
            >
              Continuar Comprando
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={buttonVariants({
                  variant: "default",
                  size: "default",
                  className: "flex items-center gap-2",
                })}
              >
                <span>Ir ao Painel Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Account Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Meus Pedidos */}
          <Link
            href="/conta/pedidos"
            className="group bg-white rounded-2xl border border-borda p-6 shadow-sm hover:border-primaria transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-secundaria flex items-center justify-center text-texto-escuro mb-4 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5 text-primaria" />
              </div>
              <h2 className="font-serif text-base font-semibold text-texto-escuro group-hover:text-primaria transition-colors">
                Meus Pedidos
              </h2>
              <p className="text-xs text-texto-claro mt-1.5 leading-relaxed">
                Acompanhe o status de entrega, notas fiscais e histórico detalhado das suas compras.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-borda/60 flex items-center justify-between text-xs font-semibold text-primaria">
              <span>Visualizar histórico</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card: Endereços */}
          <Link
            href="/conta/enderecos"
            className="group bg-white rounded-2xl border border-borda p-6 shadow-sm hover:border-primaria transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-secundaria flex items-center justify-center text-texto-escuro mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5 text-primaria" />
              </div>
              <h2 className="font-serif text-base font-semibold text-texto-escuro group-hover:text-primaria transition-colors">
                Endereços de Entrega
              </h2>
              <p className="text-xs text-texto-claro mt-1.5 leading-relaxed">
                Cadastre e edite seus locais de recebimento para agilizar o checkout de pedidos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-borda/60 flex items-center justify-between text-xs font-semibold text-primaria">
              <span>Gerenciar endereços</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card: Dados Cadastrais */}
          <Link
            href="/conta/dados"
            className="group bg-white rounded-2xl border border-borda p-6 shadow-sm hover:border-primaria transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-secundaria flex items-center justify-center text-texto-escuro mb-4 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5 text-primaria" />
              </div>
              <h2 className="font-serif text-base font-semibold text-texto-escuro group-hover:text-primaria transition-colors">
                Dados Cadastrais
              </h2>
              <p className="text-xs text-texto-claro mt-1.5 leading-relaxed">
                Atualize seu nome completo, telefone para contato e preferências de comunicação.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-borda/60 flex items-center justify-between text-xs font-semibold text-primaria">
              <span>Atualizar dados</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

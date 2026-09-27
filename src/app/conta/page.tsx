import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  User,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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

  // 1. Buscar Perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Buscar Contagem de Pedidos e Último Pedido
  const { data: orders, count: totalOrders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_cents, created_at", { count: "exact" })
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastOrder = orders?.[0];

  // 3. Buscar Endereço Padrão
  const { data: defaultAddress } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const resolvedSearchParams = await searchParams;
  const isUnauthorizedAdmin =
    resolvedSearchParams.error === "unauthorized_admin";
  const isPasswordUpdated =
    resolvedSearchParams.message === "senha_atualizada";

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Entregue</Badge>;
      case "shipped":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Enviado</Badge>;
      case "paid":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Pago</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Aguardando Pagamento</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Alerta de Erro de Permissão */}
      {isUnauthorizedAdmin && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-erro/10 border border-erro/20 flex items-start gap-3.5 text-erro animate-in fade-in"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Acesso Restrito</p>
            <p className="text-xs text-erro/90 mt-0.5 leading-relaxed">
              Seu perfil possui permissão padrão de cliente e não pode acessar o painel administrativo.
            </p>
          </div>
        </div>
      )}

      {/* Alerta de Sucesso: Senha Redefinida */}
      {isPasswordUpdated && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-sucesso/10 border border-sucesso/20 flex items-start gap-3.5 text-sucesso animate-in fade-in"
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

      {/* Métricas e Resumos Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card: Total de Compras */}
        <div className="p-5 rounded-2xl bg-white border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro font-medium">Total de Pedidos</p>
            <p className="font-serif text-2xl font-bold text-texto-escuro mt-0.5">
              {totalOrders || 0}
            </p>
          </div>
        </div>

        {/* Card: Endereço Principal */}
        <div className="p-5 rounded-2xl bg-white border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-primaria" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-texto-claro font-medium">Endereço Principal</p>
            {defaultAddress ? (
              <p className="text-xs font-semibold text-texto-escuro truncate mt-0.5">
                {defaultAddress.city}, {defaultAddress.state}
              </p>
            ) : (
              <p className="text-xs text-texto-claro mt-0.5">Nenhum cadastrado</p>
            )}
          </div>
        </div>

        {/* Card: Contato / Perfil */}
        <div className="p-5 rounded-2xl bg-white border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-texto-claro font-medium">Telefone / WhatsApp</p>
            <p className="text-xs font-semibold text-texto-escuro truncate mt-0.5">
              {profile?.phone || "Não informado"}
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Último Pedido Realizado */}
      <div className="bg-white rounded-3xl border border-borda p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-borda/60 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primaria" />
            <h2 className="font-serif text-lg font-bold text-texto-escuro">
              Último Pedido
            </h2>
          </div>
          <Link
            href="/conta/pedidos"
            className="text-xs font-semibold text-primaria hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lastOrder ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-fundo/40 border border-borda/60">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-serif text-base font-bold text-texto-escuro">
                  Pedido #{lastOrder.order_number}
                </span>
                {getStatusBadge(lastOrder.status)}
              </div>
              <p className="text-xs text-texto-claro">
                Realizado em {formatDate(lastOrder.created_at)}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6">
              <div className="text-right">
                <p className="text-[11px] text-texto-claro">Valor Total</p>
                <p className="font-serif text-base font-bold text-primaria">
                  {formatPrice(lastOrder.total_cents)}
                </p>
              </div>

              <Link
                href={`/conta/pedidos/${lastOrder.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "text-xs font-semibold",
                })}
              >
                Detalhes
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <div className="w-14 h-14 rounded-full bg-primaria-soft text-primaria flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-base font-semibold text-texto-escuro">
              Você ainda não realizou compras
            </h3>
            <p className="text-xs text-texto-claro max-w-sm mx-auto mt-1 mb-5">
              Explore nosso catálogo e encontre peças elegantes feitas com dedicação e acabamento premium.
            </p>
            <Link
              href="/produtos"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "text-xs font-semibold gap-2 shadow-xs",
              })}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ver Produtos</span>
            </Link>
          </div>
        )}
      </div>

      {/* Hub de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/conta/pedidos"
          className="group bg-white rounded-2xl border border-borda p-6 shadow-xs hover:border-primaria transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-texto-escuro group-hover:text-primaria transition-colors">
              Meus Pedidos
            </h3>
            <p className="text-xs text-texto-claro mt-1 leading-relaxed">
              Consulte faturas, itens adquiridos e status de entrega.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-borda/60 flex items-center justify-between text-xs font-semibold text-primaria">
            <span>Acessar</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/conta/enderecos"
          className="group bg-white rounded-2xl border border-borda p-6 shadow-xs hover:border-primaria transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-texto-escuro group-hover:text-primaria transition-colors">
              Endereços Salvos
            </h3>
            <p className="text-xs text-texto-claro mt-1 leading-relaxed">
              Gerencie locais de entrega para agilizar compras futuras.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-borda/60 flex items-center justify-between text-xs font-semibold text-primaria">
            <span>Acessar</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/conta/dados"
          className="group bg-white rounded-2xl border border-borda p-6 shadow-xs hover:border-primaria transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-texto-escuro group-hover:text-primaria transition-colors">
              Dados Pessoais
            </h3>
            <p className="text-xs text-texto-claro mt-1 leading-relaxed">
              Mantenha seus dados e formas de contato sempre atualizados.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-borda/60 flex items-center justify-between text-xs font-semibold text-primaria">
            <span>Acessar</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}

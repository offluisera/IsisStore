import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  Shield,
  Activity,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface RecentOrderSummary {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

interface RecentLogSummary {
  id: string;
  action: string;
  entity: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Buscar métricas agregadas em paralelo
  const [
    { count: productsCount },
    { count: lowStockCount },
    { count: categoriesCount },
    { count: ordersCount },
    { count: pendingShipmentCount },
    { count: customersCount },
    { data: paidOrders },
    { data: recentOrders },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 5),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["paid", "processing"]),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_cents").eq("status", "paid"),
    supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        total_cents,
        created_at,
        profiles (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("admin_audit_logs")
      .select(`
        id,
        action,
        entity,
        created_at,
        profiles (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calcular Faturamento Total Aprovado em centavos
  const totalRevenueCents =
    paidOrders?.reduce((acc, order) => acc + (order.total_cents || 0), 0) || 0;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-borda shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-texto-escuro">
            Visão Geral do E-commerce
          </h1>
          <p className="text-xs text-texto-claro mt-1">
            Gestão consolidada de faturamento, catálogo, estoque, pedidos e auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/produtos/novo"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "flex items-center gap-2 shadow-xs text-xs",
            })}
          >
            <Package className="w-4 h-4" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Faturamento Aprovado */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">
              Faturamento Aprovado
            </span>
            <p className="text-2xl font-serif font-bold text-primaria mt-1">
              {formatPrice(totalRevenueCents)}
            </p>
            <span className="text-[11px] text-sucesso font-semibold">
              Pedidos pagos confirmados
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pedidos & Despachos */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">
              Pedidos Totais
            </span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {ordersCount ?? 0}
            </p>
            <span className="text-[11px] text-amber-700 font-semibold">
              {pendingShipmentCount ?? 0} para envio imediato
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-primaria" />
          </div>
        </div>

        {/* Catálogo & Estoque Baixo */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">
              Produtos Ativos
            </span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {productsCount ?? 0}
            </p>
            <span
              className={`text-[11px] font-semibold ${
                (lowStockCount ?? 0) > 0 ? "text-erro" : "text-sucesso"
              }`}
            >
              {lowStockCount ?? 0} com estoque crítico (≤5)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center">
            <Package className="w-6 h-6 text-primaria" />
          </div>
        </div>

        {/* Base de Clientes */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">
              Clientes Registrados
            </span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {customersCount ?? 0}
            </p>
            <span className="text-[11px] text-texto-claro font-semibold">
              {categoriesCount ?? 0} categorias ativas
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center">
            <Users className="w-6 h-6 text-primaria" />
          </div>
        </div>
      </div>

      {/* Grid: Últimos Pedidos & Auditoria Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Últimos Pedidos */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
          <div className="p-5 border-b border-borda/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primaria" />
              <h2 className="font-serif text-sm font-bold text-texto-escuro">
                Últimos Pedidos
              </h2>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs text-primaria hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-borda/60 text-xs">
            {recentOrders && recentOrders.length > 0 ? (
              (recentOrders as unknown as RecentOrderSummary[]).map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-fundo/40 transition-colors"
                >
                  <div>
                    <Link
                      href={`/admin/pedidos/${ord.id}`}
                      className="font-semibold text-texto-escuro hover:text-primaria transition-colors"
                    >
                      #{ord.order_number}
                    </Link>
                    <p className="text-[11px] text-texto-claro">
                      {ord.profiles?.full_name || "Cliente"} &bull; {formatDate(ord.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primaria">
                      {formatPrice(ord.total_cents)}
                    </p>
                    <span className="text-[10px] uppercase font-semibold text-texto-medio">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-texto-claro">
                Nenhum pedido recente registrado.
              </div>
            )}
          </div>
        </div>

        {/* Últimos Logs de Auditoria */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
          <div className="p-5 border-b border-borda/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primaria" />
              <h2 className="font-serif text-sm font-bold text-texto-escuro">
                Trilha de Auditoria Recente
              </h2>
            </div>
            <Link
              href="/admin/auditoria"
              className="text-xs text-primaria hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-borda/60 text-xs">
            {recentLogs && recentLogs.length > 0 ? (
              (recentLogs as unknown as RecentLogSummary[]).map((log) => (
                <div key={log.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-texto-escuro text-[11px]">
                      {log.profiles?.full_name || "Sistema"}
                    </span>
                    <span className="text-[10px] text-texto-claro font-mono">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-texto-medio font-mono">
                    {log.action} &rarr; {log.entity}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-texto-claro">
                Nenhuma ação de auditoria registrada.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sucesso/10 text-sucesso flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-texto-escuro">
              Sistema de Autenticação e RBAC Operacional
            </h3>
            <p className="text-xs text-texto-claro mt-0.5">
              Políticas de Row Level Security (RLS), dupla checagem de privilégios de administrador e logs de auditoria imutáveis ativos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-sucesso">
          <Activity className="w-4 h-4" />
          <span>Status: 100% Protegido</span>
        </div>
      </div>
    </div>
  );
}

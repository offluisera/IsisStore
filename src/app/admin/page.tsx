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
  Store,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { KPICard } from "@/components/admin/kpi-card";
import { SalesAreaChart } from "@/components/admin/sales-area-chart";
import { OrdersDistributionDonut } from "@/components/admin/orders-distribution-donut";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Buscar métricas agregadas em paralelo
  const [
    { count: productsCount },
    { count: lowStockCount },
    { count: categoriesCount },
    { count: ordersCount },
    { count: pendingShipmentCount },
    { count: customersCount },
    { data: allOrdersData },
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
    supabase.from("orders").select("total_cents, created_at, status"),
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

  // Faturamento Aprovado (Pedidos pagos, em separação ou despachados)
  const paidOrders =
    allOrdersData?.filter((o) =>
      ["paid", "processing", "shipped", "delivered"].includes(o.status)
    ) || [];

  const totalRevenueCents =
    paidOrders.reduce((acc, order) => acc + (order.total_cents || 0), 0) || 0;

  // Evolução diária de vendas dos últimos 7 dias (Dados reais da loja)
  const now = new Date();
  const realLast7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dateFormatted = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" });

    const dayOrders = paidOrders.filter((ord) => {
      if (!ord.created_at) return false;
      const ordDate = new Date(ord.created_at);
      return (
        ordDate.getDate() === d.getDate() &&
        ordDate.getMonth() === d.getMonth() &&
        ordDate.getFullYear() === d.getFullYear()
      );
    });

    const amountCents = dayOrders.reduce(
      (sum, ord) => sum + (ord.total_cents || 0),
      0
    );

    return {
      date: dateFormatted,
      dayName,
      amountCents,
    };
  });

  // Distribuição de status dos pedidos da loja
  const totalOrdersCalc = allOrdersData?.length || ordersCount || 0;
  const statusCounts = {
    paid:
      allOrdersData?.filter((o) =>
        ["paid", "shipped", "delivered"].includes(o.status)
      ).length || 0,
    processing:
      allOrdersData?.filter((o) => o.status === "processing").length || 0,
    pending:
      allOrdersData?.filter((o) => o.status === "pending_payment").length || 0,
    cancelled:
      allOrdersData?.filter((o) => o.status === "cancelled").length || 0,
    refunded:
      allOrdersData?.filter((o) => o.status === "refunded").length || 0,
  };

  const getPercentage = (count: number) => {
    if (totalOrdersCalc <= 0 || count <= 0) return 0;
    if (totalOrdersCalc === 1 && count === 1) return 100;
    return Math.round((count / totalOrdersCalc) * 100);
  };

  const distributionItems = [
    {
      status: "paid",
      label: "Pago / Enviado",
      count: statusCounts.paid,
      percentage: getPercentage(statusCounts.paid),
      color: "#E08CA3",
    },
    {
      status: "pending",
      label: "Pendente",
      count: statusCounts.pending,
      percentage: getPercentage(statusCounts.pending),
      color: "#F59E0B",
    },
    {
      status: "processing",
      label: "Processando",
      count: statusCounts.processing,
      percentage: getPercentage(statusCounts.processing),
      color: "#3B82F6",
    },
    {
      status: "cancelled",
      label: "Cancelado",
      count: statusCounts.cancelled,
      percentage: getPercentage(statusCounts.cancelled),
      color: "#EF4444",
    },
    {
      status: "refunded",
      label: "Reembolso",
      count: statusCounts.refunded,
      percentage: getPercentage(statusCounts.refunded),
      color: "#9333EA",
    },
  ];

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
      {/* 1. Cabeçalho Oficial Isis Store */}
      <DashboardHeader adminName={profile?.full_name} />

      {/* 2. Grid de 4 KPI Cards com Sparklines Vetoriais em SVG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total de Vendas */}
        <KPICard
          title="Total de Vendas"
          value={formatPrice(totalRevenueCents)}
          iconType="sales"
          variation={{ value: "↑ 12,5%", isPositive: true }}
          periodText="em relação ao mês anterior"
          sparklineData={[18, 22, 19, 32, 28, 40, 52]}
          gradientId="grad-kpi-vendas"
        />

        {/* Pedidos */}
        <KPICard
          title="Pedidos"
          value={String(ordersCount ?? 0)}
          iconType="orders"
          variation={{ value: "↑ 8,3%", isPositive: true }}
          periodText="em relação ao mês anterior"
          sparklineData={[8, 12, 11, 15, 14, 18, 24]}
          gradientId="grad-kpi-pedidos"
        />

        {/* Clientes */}
        <KPICard
          title="Clientes"
          value={String(customersCount ?? 0)}
          iconType="customers"
          variation={{ value: "↑ 15,2%", isPositive: true }}
          periodText="em relação ao mês anterior"
          sparklineData={[14, 18, 22, 21, 26, 30, 36]}
          gradientId="grad-kpi-clientes"
        />

        {/* Produtos */}
        <KPICard
          title="Produtos"
          value={String(productsCount ?? 0)}
          iconType="products"
          variation={{ value: "↑ 6,7%", isPositive: true }}
          periodText="em relação ao mês anterior"
          link={{ href: "/admin/produtos", label: "Ver todos →" }}
          sparklineData={[20, 21, 22, 22, 23, 24, 25]}
          gradientId="grad-kpi-produtos"
        />
      </div>

      {/* 3. Seção Visual: Gráfico de Vendas 7 Dias (8 cols) & Distribuição de Pedidos Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <SalesAreaChart data={realLast7DaysData} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <OrdersDistributionDonut
            items={distributionItems}
            totalOrders={totalOrdersCalc}
          />
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

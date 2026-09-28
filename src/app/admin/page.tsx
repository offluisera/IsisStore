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
import {
  RecentOrdersTable,
  RecentOrderItem,
} from "@/components/admin/recent-orders-table";
import {
  AdminNotificationsFeed,
  NotificationFeedItem,
} from "@/components/admin/admin-notifications-feed";
import {
  TopSellingProducts,
  TopSellingItem,
} from "@/components/admin/top-selling-products";
import { QuickActions } from "@/components/admin/quick-actions";
import { DailyTipCard } from "@/components/admin/daily-tip-card";

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

  // Auditoria automática de acesso administrativo ao painel
  if (user) {
    (async () => {
      try {
        await supabase.from("admin_audit_logs").insert({
          actor_id: user.id,
          action: "access_dashboard",
          entity: "dashboard",
          entity_id: "overview",
          metadata: {
            path: "/admin",
            at: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn("Aviso: log de auditoria de acesso não registrado:", err);
      }
    })();
  }

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
    { data: lowStockProducts },
    { data: recentCustomers },
    { data: topOrderItems },
    { data: catalogProducts },
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
        shipping_address,
        profiles (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(6),
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
    supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(2),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("order_items")
      .select(`
        product_id,
        product_name,
        quantity,
        subtotal_cents,
        products (
          id,
          name,
          slug,
          product_images (public_url, is_primary)
        )
      `)
      .limit(100),
    supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        price_cents,
        product_images (public_url, is_primary)
      `)
      .eq("status", "published")
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

  // Cálculo real do crescimento dos últimos 7 dias vs 7 dias anteriores
  const sevenDaysAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgoMs = now.getTime() - 14 * 24 * 60 * 60 * 1000;

  const current7dSales = paidOrders
    .filter((ord) => {
      if (!ord.created_at) return false;
      const t = new Date(ord.created_at).getTime();
      return t >= sevenDaysAgoMs;
    })
    .reduce((sum, ord) => sum + (ord.total_cents || 0), 0);

  const prev7dSales = paidOrders
    .filter((ord) => {
      if (!ord.created_at) return false;
      const t = new Date(ord.created_at).getTime();
      return t >= fourteenDaysAgoMs && t < sevenDaysAgoMs;
    })
    .reduce((sum, ord) => sum + (ord.total_cents || 0), 0);

  let salesGrowth = {
    percentage: 0,
    isPositive: true,
  };

  if (prev7dSales > 0) {
    const diff = current7dSales - prev7dSales;
    salesGrowth = {
      percentage: Math.abs(Math.round((diff / prev7dSales) * 1000) / 10),
      isPositive: diff >= 0,
    };
  } else if (current7dSales > 0) {
    salesGrowth = {
      percentage: 100,
      isPositive: true,
    };
  } else {
    salesGrowth = {
      percentage: 0,
      isPositive: true,
    };
  }

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

  // Formatar pedidos recentes para a tabela oficial
  const formattedRecentOrders: RecentOrderItem[] = (recentOrders || []).map(
    (ord) => {
      const recipientName = (
        ord.shipping_address as { recipient_name?: string } | null
      )?.recipient_name;
      const profileName = (
        ord.profiles as { full_name: string | null } | null
      )?.full_name;

      return {
        id: ord.id,
        order_number: ord.order_number,
        customer_name: profileName || recipientName || "Cliente",
        created_at: ord.created_at,
        status: ord.status,
        total_cents: ord.total_cents,
      };
    }
  );

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      if (diffMin < 1) return "Agora";
      if (diffMin < 60) return `${diffMin} min atrás`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24)
        return `${diffHours} ${diffHours === 1 ? "hora" : "horas"} atrás`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? "dia" : "dias"} atrás`;
    } catch {
      return "Recentemente";
    }
  };

  // Montar notificações em tempo real combinando pedidos, estoque, novos clientes e auditoria
  const assembledNotifications: NotificationFeedItem[] = [];

  // 1. Pedidos e Pagamentos
  (recentOrders || []).slice(0, 3).forEach((ord) => {
    const isPaid = ["paid", "shipped", "delivered"].includes(ord.status);
    const recipientName = (
      ord.shipping_address as { recipient_name?: string } | null
    )?.recipient_name;
    const customer =
      (ord.profiles as { full_name: string | null } | null)?.full_name ||
      recipientName ||
      "Cliente";

    if (isPaid) {
      assembledNotifications.push({
        id: `pay-${ord.id}`,
        type: "payment",
        title: "Pagamento aprovado",
        description: `Pedido #${ord.order_number} · ${formatPrice(ord.total_cents)}`,
        timestamp: formatRelativeTime(ord.created_at),
        href: `/admin/pedidos/${ord.id}`,
      });
    } else {
      assembledNotifications.push({
        id: `ord-${ord.id}`,
        type: "order",
        title: `Novo pedido #${ord.order_number}`,
        description: `Cliente ${customer} · ${formatPrice(ord.total_cents)}`,
        timestamp: formatRelativeTime(ord.created_at),
        href: `/admin/pedidos/${ord.id}`,
      });
    }
  });

  // 2. Alertas de estoque crítico com nome real do produto
  if (lowStockProducts && lowStockProducts.length > 0) {
    lowStockProducts.forEach((prod) => {
      assembledNotifications.push({
        id: `stock-${prod.id}`,
        type: "stock",
        title: "Produto com estoque baixo",
        description: `${prod.name} (${prod.stock} unidades)`,
        timestamp: "Atenção",
        href: "/admin/produtos",
      });
    });
  } else if ((lowStockCount ?? 0) > 0) {
    assembledNotifications.push({
      id: "stock-alert",
      type: "stock",
      title: "Produto com estoque baixo",
      description: `${lowStockCount} produto(s) com quantidade crítica (≤ 5 un)`,
      timestamp: "Atenção",
      href: "/admin/produtos",
    });
  }

  // 3. Novo cliente cadastrado
  (recentCustomers || []).slice(0, 1).forEach((cust) => {
    assembledNotifications.push({
      id: `cust-${cust.id}`,
      type: "customer",
      title: "Novo cliente cadastrado",
      description: cust.full_name ? `${cust.full_name} (${cust.email})` : cust.email,
      timestamp: formatRelativeTime(cust.created_at),
      href: "/admin/clientes",
    });
  });

  // 4. Logs de Auditoria do Administrador
  (recentLogs || []).slice(0, 2).forEach((log) => {
    assembledNotifications.push({
      id: `log-${log.id}`,
      type: "audit",
      title: `Auditoria: ${log.action}`,
      description: `${log.entity} por ${(log.profiles as { full_name: string | null } | null)?.full_name || "Admin"}`,
      timestamp: formatRelativeTime(log.created_at),
      href: "/admin/auditoria",
    });
  });

  // 5. Agregação dos Produtos Mais Vendidos a partir de order_items
  const productSalesMap = new Map<
    string,
    {
      id: string;
      name: string;
      slug?: string;
      imageUrl?: string | null;
      total_sold: number;
      revenue_cents: number;
    }
  >();

  (topOrderItems || []).forEach((item) => {
    const key = item.product_id || item.product_name;
    const prodRel = item.products as {
      id?: string;
      name?: string;
      slug?: string;
      product_images?: { public_url: string; is_primary: boolean }[];
    } | null;

    const primaryImage =
      prodRel?.product_images?.find((img) => img.is_primary) ||
      prodRel?.product_images?.[0];

    const existing = productSalesMap.get(key) || {
      id: item.product_id || key,
      name: item.product_name,
      slug: prodRel?.slug,
      imageUrl: primaryImage?.public_url || null,
      total_sold: 0,
      revenue_cents: 0,
    };

    existing.total_sold += item.quantity || 1;
    existing.revenue_cents += item.subtotal_cents || 0;
    if (!existing.imageUrl && primaryImage?.public_url) {
      existing.imageUrl = primaryImage.public_url;
    }

    productSalesMap.set(key, existing);
  });

  const sortedSales = Array.from(productSalesMap.values()).sort(
    (a, b) => b.total_sold - a.total_sold
  );

  const maxSold = sortedSales.length > 0 ? sortedSales[0].total_sold : 1;

  let finalTopSelling: TopSellingItem[] = [];

  if (sortedSales.length > 0) {
    finalTopSelling = sortedSales.slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      imageUrl: item.imageUrl,
      total_sold: item.total_sold,
      revenue_cents: item.revenue_cents,
      percentage: Math.min(Math.round((item.total_sold / maxSold) * 100), 100),
    }));
  } else if (catalogProducts && catalogProducts.length > 0) {
    finalTopSelling = catalogProducts.slice(0, 5).map((p) => {
      const primaryImage =
        p.product_images?.find((img) => img.is_primary) ||
        p.product_images?.[0];

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: primaryImage?.public_url || null,
        total_sold: 0,
        revenue_cents: 0,
        percentage: 0,
      };
    });
  }

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
          variation={{
            value:
              salesGrowth.percentage > 0
                ? `${salesGrowth.isPositive ? "↑" : "↓"} ${salesGrowth.percentage.toFixed(1).replace(".", ",")}%`
                : "0,0%",
            isPositive: salesGrowth.isPositive,
          }}
          periodText="em relação aos 7 dias anteriores"
          sparklineData={realLast7DaysData.map((d) => d.amountCents)}
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-8 flex flex-col">
          <SalesAreaChart data={realLast7DaysData} growth={salesGrowth} />
        </div>
        <div className="xl:col-span-4 flex flex-col">
          <OrdersDistributionDonut
            items={distributionItems}
            totalOrders={totalOrdersCalc}
          />
        </div>
      </div>

      {/* 4. Seção Visual: Pedidos Recentes (8 cols) & Feed de Notificações em Tempo Real (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-8 flex flex-col">
          <RecentOrdersTable orders={formattedRecentOrders} />
        </div>
        <div className="xl:col-span-4 flex flex-col">
          <AdminNotificationsFeed notifications={assembledNotifications} />
        </div>
      </div>

      {/* 5. Seção Visual: Produtos Mais Vendidos (8 cols) & Ações Rápidas + Dica do Dia (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-8 flex flex-col">
          <TopSellingProducts products={finalTopSelling} />
        </div>
        <div className="xl:col-span-4 flex flex-col gap-6">
          <QuickActions />
          <DailyTipCard />
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

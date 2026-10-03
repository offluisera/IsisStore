import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { AccountHero } from "@/components/account/account-hero";
import { AccountShortcuts } from "@/components/account/account-shortcuts";
import {
  RecentOrdersCard,
  RecentOrderItemData,
} from "@/components/account/recent-orders-card";
import { AccountSummaryCard } from "@/components/account/account-summary-card";
import { PrimaryAddressCard } from "@/components/account/primary-address-card";
import { SupportCard } from "@/components/account/support-card";
import { TrustBar } from "@/components/account/trust-bar";
import { SocialConnect } from "@/components/account/social-connect";

interface ContaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function ContaPage({ searchParams }: ContaPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta");
  }

  // 1. Buscar Perfil, Pedidos, Endereços em paralelo
  const [
    { data: profile },
    { count: totalOrdersCount },
    { data: allCustomerOrders },
    { data: recentOrdersRaw },
    { data: defaultAddress },
    { count: totalAddressesCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", user.id),
    supabase
      .from("orders")
      .select("total_cents, status")
      .eq("customer_id", user.id),
    supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        total_cents,
        created_at,
        order_items (
          quantity,
          products (
            id,
            name,
            product_images (public_url, is_primary)
          )
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("addresses")
      .select("*")
      .eq("profile_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("addresses")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id),
  ]);

  const resolvedSearchParams = await searchParams;
  const isUnauthorizedAdmin =
    resolvedSearchParams.error === "unauthorized_admin";
  const isPasswordUpdated =
    resolvedSearchParams.message === "senha_atualizada";

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Cliente";

  // Calcular total investido pela cliente na loja (pedidos pagos/enviados/entregues)
  const paidOrders = (allCustomerOrders || []).filter((o) =>
    ["paid", "processing", "shipped", "delivered"].includes(o.status)
  );
  const totalSpentCents = paidOrders.reduce(
    (sum, ord) => sum + (ord.total_cents || 0),
    0
  );

  // Formatar pedidos recentes com fotos reais dos produtos
  const formattedRecentOrders: RecentOrderItemData[] = (
    recentOrdersRaw || []
  ).map((ord: any) => {
    const images: string[] = [];
    let itemsCount = 0;

    (ord.order_items || []).forEach((item: any) => {
      itemsCount += item.quantity || 1;
      const prodImages = item.products?.product_images;
      if (prodImages && Array.isArray(prodImages) && prodImages.length > 0) {
        const primary =
          prodImages.find((img: any) => img.is_primary) || prodImages[0];
        if (primary?.public_url && !images.includes(primary.public_url)) {
          images.push(primary.public_url);
        }
      }
    });

    return {
      id: ord.id,
      order_number: ord.order_number,
      created_at: ord.created_at,
      status: ord.status,
      total_cents: ord.total_cents,
      items_count: itemsCount,
      product_images: images,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Alerta de Restrição Administrativa (se houver) */}
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

      {/* Alerta de Senha Atualizada (se houver) */}
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

      {/* 1. Hero Banner de Boas-Vindas com Visual Isis Store */}
      <AccountHero displayName={displayName} />

      {/* 2. Grid de 4 Atalhos da Conta */}
      <AccountShortcuts
        ordersCount={totalOrdersCount ?? 0}
        addressesCount={totalAddressesCount ?? 0}
        favoritesCount={0}
        couponsCount={3}
      />

      {/* 3. Grid Principal de Duas Colunas: 8 cols (Esquerda) + 4 cols (Direita) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Últimos Pedidos + Faixa de Benefícios */}
        <div className="xl:col-span-8 space-y-6">
          <RecentOrdersCard orders={formattedRecentOrders} />
          <TrustBar />
        </div>

        {/* Coluna Direita: Resumo da Conta, Endereço Principal e Suporte */}
        <div className="xl:col-span-4 space-y-5">
          <AccountSummaryCard
            totalSpentCents={totalSpentCents}
            ordersCount={totalOrdersCount ?? 0}
          />
          <PrimaryAddressCard address={defaultAddress} />
          <SupportCard />
        </div>
      </div>

      {/* 4. Rodapé Social */}
      <SocialConnect />
    </div>
  );
}

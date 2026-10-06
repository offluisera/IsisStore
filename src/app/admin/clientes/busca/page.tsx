import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  CustomerAdvancedSearchView,
  CustomerFullProfile,
  CustomerOrder,
  OrderItemSnapshot,
} from "@/components/admin/customer-advanced-search-view";

export const metadata = {
  title: "Busca Avançada de Clientes — Isis Store Admin",
  description: "Pesquise clientes e visualize histórico de compras, ticket médio, cupons usados e último meio de pagamento.",
};

interface AdminBuscaClientesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBuscaClientesPage({
  searchParams,
}: AdminBuscaClientesPageProps) {
  const supabase = await createClient();
  const resolved = await searchParams;
  const initialSelectedId = typeof resolved.id === "string" ? resolved.id : undefined;
  const initialQuery = typeof resolved.q === "string" ? resolved.q : "";

  // 1. Buscar todos os perfis
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, cpf, role, created_at")
    .order("full_name", { ascending: true });

  // 2. Buscar pedidos
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, status, subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_code, notes, shipping_address, created_at"
    )
    .order("created_at", { ascending: false });

  // 3. Buscar itens dos pedidos
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, product_name, quantity, unit_price_cents, subtotal_cents");

  // 4. Buscar endereços
  const { data: addresses } = await supabase
    .from("addresses")
    .select(
      "profile_id, postal_code, street, number, complement, neighborhood, city, state, is_default"
    );

  // Mapear itens por order_id
  const orderItemsMap = new Map<string, OrderItemSnapshot[]>();
  orderItems?.forEach((item) => {
    const list = orderItemsMap.get(item.order_id) || [];
    list.push({
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      subtotal_cents: item.subtotal_cents,
    });
    orderItemsMap.set(item.order_id, list);
  });

  // Mapear pedidos por customer_id
  const customerOrdersMap = new Map<string, CustomerOrder[]>();
  orders?.forEach((o) => {
    if (!o.customer_id) return;
    const list = customerOrdersMap.get(o.customer_id) || [];

    const shippingAddr = (o.shipping_address as {
      payment_method?: string;
      shipping_method?: string;
    } | null) || {};

    list.push({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      subtotal_cents: o.subtotal_cents,
      shipping_cents: o.shipping_cents,
      discount_cents: o.discount_cents,
      total_cents: o.total_cents,
      coupon_code: o.coupon_code || null,
      notes: o.notes || null,
      created_at: o.created_at,
      payment_method: shippingAddr.payment_method || null,
      shipping_method: shippingAddr.shipping_method || null,
      items: orderItemsMap.get(o.id) || [],
    });
    customerOrdersMap.set(o.customer_id, list);
  });

  // Mapear endereço padrão por profile_id
  const addressMap = new Map<string, {
    postal_code: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  }>();

  addresses?.forEach((addr) => {
    if (!addressMap.has(addr.profile_id) || addr.is_default) {
      addressMap.set(addr.profile_id, {
        postal_code: addr.postal_code,
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
      });
    }
  });

  const fullProfiles: CustomerFullProfile[] = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name || "Sem Nome",
    email: p.email || "",
    phone: p.phone,
    cpf: p.cpf,
    role: (p.role as "customer" | "admin") || "customer",
    created_at: p.created_at,
    address: addressMap.get(p.id) || null,
    orders: customerOrdersMap.get(p.id) || [],
  }));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header com Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/clientes"
              className="hover:text-primaria transition-colors"
            >
              Clientes
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Busca Avançada</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2.5">
            <Search className="w-6 h-6 text-primaria" />
            <span>Busca Avançada de Clientes & Dossiê 360°</span>
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Raio-x detalhado com gastos na loja, ticket médio, cupons usados, últimos pedidos e meio de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/clientes"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar</span>
          </Link>
          <Link
            href="/admin/clientes/novo"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "flex items-center gap-1.5",
            })}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Cliente</span>
          </Link>
        </div>
      </div>

      {/* Visualização de Busca Avançada */}
      <CustomerAdvancedSearchView
        customers={fullProfiles}
        initialSelectedId={initialSelectedId}
        initialQuery={initialQuery}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CustomersListView, CustomerData } from "@/components/admin/customers-list-view";

export const metadata = {
  title: "Gestão de Clientes — Isis Store Admin",
  description: "Visualize, filtre e gerencie todos os clientes cadastrados na Isis Store.",
};

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // 1. Buscar todos os perfis cadastrados
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, cpf, role, created_at")
    .order("created_at", { ascending: false });

  // 2. Buscar pedidos para agregar métricas reais por cliente
  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_id, total_cents, status, created_at")
    .order("created_at", { ascending: false });

  // 3. Buscar endereços padrão
  const { data: addresses } = await supabase
    .from("addresses")
    .select("profile_id, city, state, is_default");

  // Agregações em Maps
  const orderCountMap = new Map<string, number>();
  const totalSpentMap = new Map<string, number>();
  const lastOrderDateMap = new Map<string, string>();

  orders?.forEach((o) => {
    if (!o.customer_id) return;

    // Contagem
    orderCountMap.set(o.customer_id, (orderCountMap.get(o.customer_id) || 0) + 1);

    // Soma de faturamento (pedidos que não foram cancelados)
    if (o.status !== "cancelled") {
      totalSpentMap.set(
        o.customer_id,
        (totalSpentMap.get(o.customer_id) || 0) + (o.total_cents || 0)
      );
    }

    // Último pedido
    if (!lastOrderDateMap.has(o.customer_id) && o.created_at) {
      lastOrderDateMap.set(o.customer_id, o.created_at);
    }
  });

  const addressMap = new Map<string, { city: string; state: string }>();
  addresses?.forEach((addr) => {
    if (!addressMap.has(addr.profile_id) || addr.is_default) {
      addressMap.set(addr.profile_id, { city: addr.city, state: addr.state });
    }
  });

  const customers: CustomerData[] = (profiles || []).map((p) => {
    const addr = addressMap.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name || "Sem Nome",
      email: p.email || "",
      phone: p.phone,
      cpf: p.cpf,
      role: (p.role as "customer" | "admin") || "customer",
      created_at: p.created_at,
      orderCount: orderCountMap.get(p.id) || 0,
      totalSpentCents: totalSpentMap.get(p.id) || 0,
      lastOrderDate: lastOrderDateMap.get(p.id) || null,
      city: addr ? addr.city : null,
      state: addr ? addr.state : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header com Navegação e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Clientes</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primaria" />
            <span>Gerenciamento de Clientes</span>
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Visualize as contas cadastradas, histórico de pedidos e controle privilégios.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Painel</span>
          </Link>
          <Link
            href="/admin/clientes/busca"
            className={buttonVariants({
              variant: "white",
              size: "sm",
              className: "flex items-center gap-1.5",
            })}
          >
            <Search className="w-3.5 h-3.5 text-primaria" />
            <span>Busca Avançada</span>
          </Link>
          <Link
            href="/admin/clientes/novo"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "flex items-center gap-1.5",
            })}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrar Cliente</span>
          </Link>
        </div>
      </div>

      {/* Visualização de Clientes com Filtros e Métricas (tabela interna com container overflow-x-auto) */}
      <div className="w-full min-w-0">
        <CustomersListView
          customers={customers}
          currentUserId={currentUser?.id || ""}
        />
      </div>
    </div>
  );
}

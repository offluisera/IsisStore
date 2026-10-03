import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Edit3, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  EditCustomerView,
  EditableCustomer,
} from "@/components/admin/edit-customer-view";

export const metadata = {
  title: "Editar Cliente — Isis Store Admin",
  description: "Modifique dados cadastrais, cargo, senha e endereço de entrega do cliente.",
};

interface AdminEditarClientePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminEditarClientePage({
  searchParams,
}: AdminEditarClientePageProps) {
  const supabase = await createClient();
  const resolved = await searchParams;
  const initialSelectedId = typeof resolved.id === "string" ? resolved.id : undefined;

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // 1. Buscar todos os clientes
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, cpf, role, created_at")
    .order("full_name", { ascending: true });

  // 2. Buscar pedidos
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_id, total_cents, status");

  // 3. Buscar endereços
  const { data: addresses } = await supabase
    .from("addresses")
    .select("profile_id, postal_code, street, number, complement, neighborhood, city, state, is_default");

  // Mapeamentos
  const orderCountMap = new Map<string, number>();
  const totalSpentMap = new Map<string, number>();

  orders?.forEach((o) => {
    if (!o.customer_id) return;
    orderCountMap.set(o.customer_id, (orderCountMap.get(o.customer_id) || 0) + 1);
    if (o.status !== "cancelled") {
      totalSpentMap.set(
        o.customer_id,
        (totalSpentMap.get(o.customer_id) || 0) + (o.total_cents || 0)
      );
    }
  });

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

  const editableCustomers: EditableCustomer[] = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name || "Sem Nome",
    email: p.email || "",
    phone: p.phone,
    cpf: p.cpf,
    role: (p.role as "customer" | "admin") || "customer",
    created_at: p.created_at,
    orderCount: orderCountMap.get(p.id) || 0,
    totalSpentCents: totalSpentMap.get(p.id) || 0,
    address: addressMap.get(p.id) || null,
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header com Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
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
            <span className="text-texto-escuro font-medium">Editar</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro flex items-center gap-2.5">
            <Edit3 className="w-6 h-6 text-primaria" />
            <span>Editar Informações do Cliente</span>
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Atualize dados de contato, redefina senhas, gerencie permissões de acesso e endereços.
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

      {/* Visualização de Edição */}
      <EditCustomerView
        customers={editableCustomers}
        initialSelectedId={initialSelectedId}
        currentUserId={currentUser?.id || ""}
      />
    </div>
  );
}

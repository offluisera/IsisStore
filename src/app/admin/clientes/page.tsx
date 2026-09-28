import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserRoleManager } from "@/components/admin/user-role-manager";

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  // Buscar contagem de pedidos por cliente
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_id");

  const orderCountMap = new Map<string, number>();
  orders?.forEach((o) => {
    if (o.customer_id) {
      orderCountMap.set(
        o.customer_id,
        (orderCountMap.get(o.customer_id) || 0) + 1
      );
    }
  });

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Clientes</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Gerenciamento de Clientes
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Visualize as contas cadastradas e controle privilégios de acesso.
          </p>
        </div>

        <div>
          <Link
            href="/admin"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Contato</th>
                <th className="px-5 py-3.5">Pedidos Realizados</th>
                <th className="px-5 py-3.5">Cadastro</th>
                <th className="px-5 py-3.5 text-right">Permissão (Role)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {profiles && profiles.length > 0 ? (
                profiles.map((p) => {
                  const ordersCount = orderCountMap.get(p.id) || 0;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-fundo/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria/20 font-bold uppercase text-xs">
                            {p.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-texto-escuro">
                              {p.full_name || "Sem Nome"}
                            </p>
                            <p className="text-[11px] text-texto-claro font-mono truncate max-w-xs">
                              {p.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-texto-medio">{p.email || "Sem e-mail"}</p>
                        {p.phone && (
                          <p className="text-[11px] text-texto-claro">{p.phone}</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-texto-escuro">
                          {ordersCount} {ordersCount === 1 ? "pedido" : "pedidos"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-texto-claro font-mono text-[11px]">
                        {formatDate(p.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end">
                          <UserRoleManager
                            userId={p.id}
                            currentRole={
                              (p.role as "customer" | "admin") || "customer"
                            }
                            currentUserId={currentUser?.id || ""}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-texto-claro">
                    Nenhum cliente cadastrado na base.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

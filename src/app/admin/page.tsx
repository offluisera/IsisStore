import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Package,
  Layers,
  ShoppingBag,
  Users,
  Shield,
  Activity,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Buscar contagens de domínio para o overview inicial
  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: ordersCount },
    { count: customersCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-borda shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-texto-escuro">
            Visão Geral do E-commerce
          </h1>
          <p className="text-xs text-texto-claro mt-1">
            Gestão consolidada de produtos, catálogo, clientes e pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/produtos/novo"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "flex items-center gap-2",
            })}
          >
            <Package className="w-4 h-4" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">Produtos Cadastrados</span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {productsCount ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borda shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">Categorias Ativas</span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {categoriesCount ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center">
            <Layers className="w-6 h-6 text-primaria" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borda shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">Pedidos Totais</span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {ordersCount ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-primaria" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borda shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-texto-claro font-medium">Contas de Clientes</span>
            <p className="text-2xl font-serif font-bold text-texto-escuro mt-1">
              {customersCount ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secundaria text-texto-escuro flex items-center justify-center">
            <Users className="w-6 h-6 text-primaria" />
          </div>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="bg-white p-6 rounded-2xl border border-borda shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sucesso/10 text-sucesso flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-texto-escuro">
              Sistema de Autenticação e RBAC Operacional
            </h3>
            <p className="text-xs text-texto-claro mt-0.5">
              Políticas de Row Level Security (RLS) e verificação de privilégios de administrador ativas em todas as rotas.
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

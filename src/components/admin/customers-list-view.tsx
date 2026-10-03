"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Edit3,
  ExternalLink,
  Phone,
  Mail,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserRoleManager } from "@/components/admin/user-role-manager";

export interface CustomerData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: "customer" | "admin";
  created_at: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderDate: string | null;
  city: string | null;
  state: string | null;
}

interface CustomersListViewProps {
  customers: CustomerData[];
  currentUserId: string;
}

export function CustomersListView({
  customers,
  currentUserId,
}: CustomersListViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "customer" | "admin">("all");
  const [orderFilter, setOrderFilter] = React.useState<"all" | "with_orders" | "no_orders">("all");

  // Métricas de resumo
  const totalCustomers = customers.length;
  const adminCount = customers.filter((c) => c.role === "admin").length;
  const customersWithOrders = customers.filter((c) => c.orderCount > 0).length;
  const totalSpentAll = customers.reduce((acc, c) => acc + c.totalSpentCents, 0);

  // Filtragem
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        searchTerm === "" ||
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.cpf && c.cpf.includes(searchTerm)) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "all" || c.role === roleFilter;

      const matchesOrders =
        orderFilter === "all" ||
        (orderFilter === "with_orders" && c.orderCount > 0) ||
        (orderFilter === "no_orders" && c.orderCount === 0);

      return matchesSearch && matchesRole && matchesOrders;
    });
  }, [customers, searchTerm, roleFilter, orderFilter]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Cards de Resumo Operacional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total de Clientes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro uppercase tracking-wider block truncate">
              Total de Clientes
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro">
              {totalCustomers}
            </p>
            <p className="text-[10px] text-texto-claro truncate">
              Cadastros registrados na base
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0 ml-2">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro uppercase tracking-wider block truncate">
              Administradores
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro">
              {adminCount}
            </p>
            <p className="text-[10px] text-texto-claro truncate">
              Contas com acesso ao painel
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 ml-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Com Compras */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro uppercase tracking-wider block truncate">
              Compradores Ativos
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro">
              {customersWithOrders}
            </p>
            <p className="text-[10px] text-texto-claro truncate">
              {totalCustomers > 0
                ? `${Math.round((customersWithOrders / totalCustomers) * 100)}% de conversão`
                : "0%"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 ml-2">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Total Gasto */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borda shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro uppercase tracking-wider block truncate">
              Volume Comprado
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro">
              {formatCurrency(totalSpentAll)}
            </p>
            <p className="text-[10px] text-texto-claro truncate">
              Acumulado em pedidos pagos
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 ml-2">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Ações Rápidas com Total Responsividade */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borda shadow-xs flex flex-col xl:flex-row gap-3 sm:gap-4 items-stretch xl:items-center justify-between min-w-0">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Campo de Busca Rápida Fluido */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-texto-claro absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, CPF..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
            />
          </div>

          {/* Filtros em Container Flex com Wrap */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro de Cargo */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-texto-claro shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "all" | "customer" | "admin")}
                className="w-full sm:w-auto text-xs bg-white border border-borda rounded-xl px-2.5 py-2 text-texto-medio focus:outline-none focus:border-primaria"
              >
                <option value="all">Todos os Cargos</option>
                <option value="customer">Apenas Clientes</option>
                <option value="admin">Apenas Administradores</option>
              </select>
            </div>

            {/* Filtro de Pedidos */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value as "all" | "with_orders" | "no_orders")}
                className="w-full sm:w-auto text-xs bg-white border border-borda rounded-xl px-2.5 py-2 text-texto-medio focus:outline-none focus:border-primaria"
              >
                <option value="all">Todos os Pedidos</option>
                <option value="with_orders">Com Pedidos Feitos</option>
                <option value="no_orders">Sem Pedidos Feitos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Ação com Quebra Limpa */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-start sm:justify-end flex-wrap pt-2 xl:pt-0 border-t xl:border-t-0 border-borda/40">
          <Link
            href="/admin/clientes/busca"
            className={buttonVariants({
              variant: "white",
              size: "sm",
              className: "flex items-center gap-1.5 shrink-0 text-xs",
            })}
          >
            <Search className="w-3.5 h-3.5 text-primaria shrink-0" />
            <span className="whitespace-nowrap">Busca Avançada</span>
          </Link>
          <Link
            href="/admin/clientes/novo"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "flex items-center gap-1.5 shrink-0 text-xs",
            })}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Registrar Cliente</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5F6] border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Contato & Local</th>
                <th className="px-5 py-3.5">Pedidos / Volume</th>
                <th className="px-5 py-3.5">Cadastro</th>
                <th className="px-5 py-3.5">Cargo (Role)</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const initial = c.full_name?.charAt(0) || "U";
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-primaria-soft/10 transition-colors group"
                    >
                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secundaria to-primaria text-white flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-2xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-texto-escuro truncate max-w-[200px]">
                                {c.full_name || "Sem Nome Cadastrado"}
                              </p>
                              {c.role === "admin" && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-texto-claro font-mono truncate max-w-[220px]">
                              {c.email}
                            </p>
                            {c.cpf && (
                              <p className="text-[10px] text-texto-claro/80 font-mono">
                                CPF: {c.cpf}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contato & Local */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {c.phone ? (
                            <p className="text-texto-medio flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-texto-claro" />
                              <span>{c.phone}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-texto-claro italic">Sem telefone</p>
                          )}
                          <p className="text-[11px] text-texto-claro">
                            {c.city && c.state
                              ? `${c.city} - ${c.state}`
                              : "Endereço não cadastrado"}
                          </p>
                        </div>
                      </td>

                      {/* Pedidos & Volume */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                c.orderCount > 0
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : "bg-fundo text-texto-claro"
                              }`}
                            >
                              {c.orderCount} {c.orderCount === 1 ? "pedido" : "pedidos"}
                            </span>
                          </div>
                          {c.totalSpentCents > 0 && (
                            <p className="text-[11px] font-bold text-primaria">
                              {formatCurrency(c.totalSpentCents)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Data de Cadastro */}
                      <td className="px-5 py-4 text-texto-claro font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-texto-claro/70" />
                          <span>{formatDate(c.created_at)}</span>
                        </div>
                      </td>

                      {/* Role Switcher */}
                      <td className="px-5 py-4">
                        <UserRoleManager
                          userId={c.id}
                          currentRole={c.role}
                          currentUserId={currentUserId}
                        />
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/clientes/busca?id=${c.id}`}
                            className="p-1.5 rounded-lg border border-borda hover:border-primaria hover:bg-primaria-soft/20 text-texto-medio hover:text-primaria transition-colors"
                            title="Ver Dossiê e Busca Avançada"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/clientes/editar?id=${c.id}`}
                            className="p-1.5 rounded-lg border border-borda hover:border-primaria hover:bg-primaria-soft/20 text-texto-medio hover:text-primaria transition-colors"
                            title="Editar Informações do Cliente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-texto-claro">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-texto-claro/40" />
                      <p className="font-medium text-sm text-texto-escuro">
                        Nenhum cliente encontrado
                      </p>
                      <p className="text-xs text-texto-claro">
                        Tente ajustar os termos de pesquisa ou os filtros selecionados.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="px-6 py-3 border-t border-borda bg-[#FAF8F8] flex items-center justify-between text-xs text-texto-claro">
          <span>
            Exibindo <strong>{filteredCustomers.length}</strong> de{" "}
            <strong>{customers.length}</strong> clientes
          </span>
          <span className="text-[11px] text-texto-claro">
            Isis Store &bull; Base Oficial
          </span>
        </div>
      </div>
    </div>
  );
}

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
        <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] uppercase tracking-wider block truncate">
              Total de Clientes
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {totalCustomers}
            </p>
            <p className="text-[10px] text-texto-claro dark:text-[#988087] truncate">
              Cadastros registrados na base
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0 ml-2">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] uppercase tracking-wider block truncate">
              Administradores
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {adminCount}
            </p>
            <p className="text-[10px] text-texto-claro dark:text-[#988087] truncate">
              Contas com acesso ao painel
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 ml-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Com Compras */}
        <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] uppercase tracking-wider block truncate">
              Compradores Ativos
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {customersWithOrders}
            </p>
            <p className="text-[10px] text-texto-claro dark:text-[#988087] truncate">
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
        <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] uppercase tracking-wider block truncate">
              Volume Comprado
            </span>
            <p className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {formatCurrency(totalSpentAll)}
            </p>
            <p className="text-[10px] text-texto-claro dark:text-[#988087] truncate">
              Acumulado em pedidos pagos
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primaria-soft dark:bg-primaria/20 text-primaria flex items-center justify-center shrink-0 ml-2">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Ações Rápidas com Total Responsividade */}
      <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex flex-col xl:flex-row gap-3 sm:gap-4 items-stretch xl:items-center justify-between min-w-0">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Campo de Busca Rápida Fluido */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-texto-claro dark:text-[#988087] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, CPF..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-fundo/40 dark:bg-[#151012] rounded-xl border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] focus:outline-none focus:border-primaria transition-colors"
            />
          </div>

          {/* Filtros em Container Flex com Wrap */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro de Cargo */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-texto-claro dark:text-[#988087] shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "all" | "customer" | "admin")}
                className="w-full sm:w-auto text-xs bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl px-2.5 py-2 text-texto-medio dark:text-[#F8EFF1] focus:outline-none focus:border-primaria"
              >
                <option value="all" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Todos os Cargos</option>
                <option value="customer" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Apenas Clientes</option>
                <option value="admin" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Apenas Administradores</option>
              </select>
            </div>

            {/* Filtro de Pedidos */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value as "all" | "with_orders" | "no_orders")}
                className="w-full sm:w-auto text-xs bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl px-2.5 py-2 text-texto-medio dark:text-[#F8EFF1] focus:outline-none focus:border-primaria"
              >
                <option value="all" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Todos os Pedidos</option>
                <option value="with_orders" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Com Pedidos Feitos</option>
                <option value="no_orders" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Sem Pedidos Feitos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Ação com Quebra Limpa */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-start sm:justify-end flex-wrap pt-2 xl:pt-0 border-t xl:border-t-0 border-borda/40 dark:border-[#38262C]/60">
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
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5F6] dark:bg-[#251A1E] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#D4BFC5] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Contato & Local</th>
                <th className="px-5 py-3.5">Pedidos / Volume</th>
                <th className="px-5 py-3.5">Cadastro</th>
                <th className="px-5 py-3.5">Cargo (Role)</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 dark:divide-[#38262C] text-texto-escuro dark:text-[#F8EFF1]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const initial = c.full_name?.charAt(0) || "U";
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-primaria-soft/10 dark:hover:bg-[#251A1E]/50 transition-colors group"
                    >
                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secundaria to-primaria text-white flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-2xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1] truncate max-w-[200px]">
                                {c.full_name || "Sem Nome Cadastrado"}
                              </p>
                              {c.role === "admin" && (
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-texto-claro dark:text-[#988087] font-mono truncate max-w-[220px]">
                              {c.email}
                            </p>
                            {c.cpf && (
                              <p className="text-[10px] text-texto-claro/80 dark:text-[#988087]/80 font-mono">
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
                            <p className="text-texto-medio dark:text-[#D4BFC5] flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-texto-claro dark:text-[#988087]" />
                              <span>{c.phone}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-texto-claro dark:text-[#988087] italic">Sem telefone</p>
                          )}
                          <p className="text-[11px] text-texto-claro dark:text-[#988087]">
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
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-800/40"
                                  : "bg-fundo dark:bg-[#151012] text-texto-claro dark:text-[#988087] border border-borda dark:border-[#38262C]"
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
                      <td className="px-5 py-4 text-texto-claro dark:text-[#988087] font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-texto-claro/70 dark:text-[#988087]/70" />
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
                            className="p-1.5 rounded-lg border border-borda dark:border-[#38262C] hover:border-primaria hover:bg-primaria-soft/20 dark:hover:bg-primaria/20 text-texto-medio dark:text-[#D4BFC5] hover:text-primaria transition-colors"
                            title="Ver Dossiê e Busca Avançada"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/clientes/editar?id=${c.id}`}
                            className="p-1.5 rounded-lg border border-borda dark:border-[#38262C] hover:border-primaria hover:bg-primaria-soft/20 dark:hover:bg-primaria/20 text-texto-medio dark:text-[#D4BFC5] hover:text-primaria transition-colors"
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
                  <td colSpan={6} className="px-5 py-12 text-center text-texto-claro dark:text-[#988087]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-texto-claro/40 dark:text-[#988087]/40" />
                      <p className="font-medium text-sm text-texto-escuro dark:text-[#F8EFF1]">
                        Nenhum cliente encontrado
                      </p>
                      <p className="text-xs text-texto-claro dark:text-[#988087]">
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
        <div className="px-6 py-3 border-t border-borda dark:border-[#38262C] bg-[#FAF8F8] dark:bg-[#1A1215] flex items-center justify-between text-xs text-texto-claro dark:text-[#988087]">
          <span>
            Exibindo <strong>{filteredCustomers.length}</strong> de{" "}
            <strong>{customers.length}</strong> clientes
          </span>
          <span className="text-[11px] text-texto-claro dark:text-[#988087]">
            Isis Store &bull; Base Oficial
          </span>
        </div>
      </div>
    </div>
  );
}

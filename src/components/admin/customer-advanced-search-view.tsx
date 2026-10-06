"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Tag,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export interface OrderItemSnapshot {
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_code?: string | null;
  notes?: string | null;
  created_at: string;
  payment_method?: string | null;
  shipping_method?: string | null;
  items: OrderItemSnapshot[];
}

export interface CustomerFullProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: "customer" | "admin";
  created_at: string;
  address?: {
    postal_code: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  orders: CustomerOrder[];
}

interface CustomerAdvancedSearchViewProps {
  customers: CustomerFullProfile[];
  initialSelectedId?: string;
  initialQuery?: string;
}

export function CustomerAdvancedSearchView({
  customers,
  initialSelectedId,
  initialQuery = "",
}: CustomerAdvancedSearchViewProps) {
  const router = useRouter();

  // Estados de busca e seleção
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedId, setSelectedId] = React.useState<string>(() => {
    if (initialSelectedId && customers.some((c) => c.id === initialSelectedId)) {
      return initialSelectedId;
    }
    return customers[0]?.id || "";
  });

  // Filtragem de clientes para a lista de resultados da busca
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.cpf && c.cpf.includes(q)) ||
        c.orders.some((o) => o.order_number.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Se o selecionado atual não estiver nos resultados da busca, auto-seleciona o primeiro resultado
  React.useEffect(() => {
    if (searchResults.length > 0 && !searchResults.some((c) => c.id === selectedId)) {
      setSelectedId(searchResults[0].id);
    }
  }, [searchResults, selectedId]);

  const activeCustomer = React.useMemo(() => {
    return customers.find((c) => c.id === selectedId);
  }, [customers, selectedId]);

  const handleSelectCustomer = (id: string) => {
    setSelectedId(id);
    router.replace(`/admin/clientes/busca?id=${id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  // Cálculos financeiros e de inteligência do cliente ativo
  const customerAnalytics = React.useMemo(() => {
    if (!activeCustomer) return null;

    const orders = activeCustomer.orders || [];
    const validOrders = orders.filter((o) => o.status !== "cancelled");

    // Total gasto
    const totalSpentCents = validOrders.reduce((acc, o) => acc + o.total_cents, 0);

    // Ticket médio
    const averageTicketCents =
      validOrders.length > 0 ? Math.round(totalSpentCents / validOrders.length) : 0;

    // Último pedido
    const lastOrder = orders.length > 0 ? orders[0] : null;

    // Último meio de pagamento
    let lastPaymentMethod = "Não identificado";
    if (lastOrder && lastOrder.payment_method) {
      const pm = lastOrder.payment_method.toLowerCase();
      if (pm.includes("pix")) lastPaymentMethod = "Pix";
      else if (pm.includes("credit") || pm.includes("card") || pm.includes("cartao"))
        lastPaymentMethod = "Cartão de Crédito";
      else if (pm.includes("ticket") || pm.includes("boleto"))
        lastPaymentMethod = "Boleto Bancário";
      else lastPaymentMethod = lastOrder.payment_method;
    }

    // Cupons e Descontos Usados
    const ordersWithDiscounts = orders.filter((o) => o.discount_cents > 0);
    const totalDiscountCents = orders.reduce((acc, o) => acc + (o.discount_cents || 0), 0);

    // Mapeamento dos cupons/descontos
    const usedCoupons = ordersWithDiscounts.map((o) => {
      let code = o.coupon_code;
      if (!code) {
        if (o.notes && o.notes.toLowerCase().includes("isis10")) code = "ISIS10";
        else if (o.payment_method?.toLowerCase().includes("pix")) code = "Desconto Pix (5%)";
        else code = "Cupom Promocional";
      }
      return {
        order_number: o.order_number,
        order_id: o.id,
        code,
        discount_cents: o.discount_cents,
        date: o.created_at,
      };
    });

    return {
      totalSpentCents,
      averageTicketCents,
      totalOrders: orders.length,
      paidOrders: validOrders.length,
      lastOrder,
      lastPaymentMethod,
      totalDiscountCents,
      usedCoupons,
    };
  }, [activeCustomer]);

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

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Pago</span>;
      case "processing":
        return <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Processando</span>;
      case "shipped":
        return <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Enviado</span>;
      case "delivered":
        return <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Entregue</span>;
      case "cancelled":
        return <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelado</span>;
      case "refunded":
        return <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Reembolsado</span>;
      default:
        return <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full">Pendente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Busca de Destaque */}
      <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
                Busca Avançada de Clientes
              </h2>
              <p className="text-xs text-texto-claro dark:text-[#988087]">
                Pesquise por nome, e-mail, telefone, CPF ou número de pedido para acessar o dossiê completo.
              </p>
            </div>
          </div>

          <div className="text-xs text-texto-claro dark:text-[#988087]">
            Base de dados: <strong className="text-texto-escuro dark:text-[#F8EFF1]">{customers.length}</strong> clientes
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-texto-claro dark:text-[#988087] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o nome, e-mail, CPF (ex: 000.000.000-00) ou número do pedido..."
            className="w-full pl-12 pr-4 py-3 text-sm bg-fundo/40 dark:bg-[#151012] rounded-2xl border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] focus:outline-none focus:border-primaria transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1]"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Grid Principal: Lista Lateral de Resultados + Dossiê do Cliente Ativo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Lista de Resultados (4 colunas em lg) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-[#FAF5F6] dark:bg-[#251A1E] border-b border-borda dark:border-[#38262C] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primaria" />
              <span>Clientes Encontrados ({searchResults.length})</span>
            </span>
          </div>

          <div className="divide-y divide-borda/60 dark:divide-[#38262C] max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-primaria/20">
            {searchResults.length > 0 ? (
              searchResults.map((c) => {
                const isSelected = c.id === selectedId;
                const initial = c.full_name?.charAt(0) || "U";
                const totalSpent = c.orders
                  .filter((o) => o.status !== "cancelled")
                  .reduce((acc, o) => acc + o.total_cents, 0);

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c.id)}
                    className={`w-full p-4 text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-primaria-soft/30 dark:bg-primaria/20 border-l-4 border-primaria"
                        : "hover:bg-fundo/50 dark:hover:bg-[#251A1E]/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-serif font-bold text-sm ${
                        isSelected
                          ? "bg-primaria text-white shadow-2xs"
                          : "bg-primaria/10 text-primaria"
                      }`}
                    >
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs text-texto-escuro dark:text-[#F8EFF1] truncate">
                          {c.full_name}
                        </p>
                        {c.role === "admin" && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 font-bold px-1 rounded-sm uppercase">
                            Admin
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-texto-claro dark:text-[#988087] truncate font-mono">
                        {c.email}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-texto-claro/90 dark:text-[#988087] pt-1.5">
                        <span>
                          {c.orders.length} {c.orders.length === 1 ? "pedido" : "pedidos"}
                        </span>
                        {totalSpent > 0 && (
                          <span className="font-bold text-primaria">
                            {formatCurrency(totalSpent)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-texto-claro dark:text-[#988087] space-y-2">
                <Search className="w-6 h-6 mx-auto opacity-40" />
                <p className="text-xs font-medium">Nenhum cliente com esses termos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Dossiê 360° do Cliente Selecionado (8 colunas em lg) */}
        <div className="lg:col-span-8 space-y-6">
          {activeCustomer && customerAnalytics ? (
            <>
              {/* Card de Identificação do Cliente */}
              <div className="bg-white dark:bg-[#1E1518] p-6 sm:p-8 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secundaria to-primaria text-white flex items-center justify-center font-serif font-bold text-2xl shadow-sm shrink-0">
                      {activeCustomer.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
                          {activeCustomer.full_name}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            activeCustomer.role === "admin"
                              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40"
                              : "bg-primaria-soft dark:bg-primaria/20 text-primaria"
                          }`}
                        >
                          {activeCustomer.role === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </div>
                      <p className="text-xs text-texto-claro dark:text-[#988087] font-mono mt-0.5">
                        {activeCustomer.email}
                      </p>
                      <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Cliente desde {formatDate(activeCustomer.created_at)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Ações Rápidas do Cabeçalho */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/clientes/editar?id=${activeCustomer.id}`}
                      className={buttonVariants({
                        variant: "default",
                        size: "sm",
                        className: "flex items-center gap-1.5",
                      })}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Cadastro</span>
                    </Link>
                  </div>
                </div>

                {/* Grid de Dados Cadastrais Detalhados */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Telefone */}
                  <div className="p-3.5 rounded-xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefone
                    </span>
                    <p className="font-mono font-medium text-texto-escuro dark:text-[#F8EFF1]">
                      {activeCustomer.phone || "Não informado"}
                    </p>
                    {activeCustomer.phone && (
                      <a
                        href={`https://wa.me/55${activeCustomer.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold block"
                      >
                        Abrir WhatsApp &rarr;
                      </a>
                    )}
                  </div>

                  {/* CPF */}
                  <div className="p-3.5 rounded-xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087] flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      CPF
                    </span>
                    <p className="font-mono font-medium text-texto-escuro dark:text-[#F8EFF1]">
                      {activeCustomer.cpf || "Não informado"}
                    </p>
                  </div>

                  {/* Endereço */}
                  <div className="p-3.5 rounded-xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Endereço Principal
                    </span>
                    <p className="text-texto-escuro dark:text-[#F8EFF1] truncate">
                      {activeCustomer.address
                        ? `${activeCustomer.address.street}, ${activeCustomer.address.number}`
                        : "Não informado"}
                    </p>
                    {activeCustomer.address && (
                      <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                        {activeCustomer.address.city} - {activeCustomer.address.state} (CEP: {activeCustomer.address.postal_code})
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Cards de Métricas Comerciais do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gastos na Loja */}
                <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087]">
                    Gastos na Loja
                  </span>
                  <p className="font-serif text-xl font-bold text-primaria">
                    {formatCurrency(customerAnalytics.totalSpentCents)}
                  </p>
                  <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                    {customerAnalytics.paidOrders} pedidos aprovados
                  </p>
                </div>

                {/* Ticket Médio */}
                <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087]">
                    Ticket Médio
                  </span>
                  <p className="font-serif text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    {formatCurrency(customerAnalytics.averageTicketCents)}
                  </p>
                  <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                    Por pedido aprovado
                  </p>
                </div>

                {/* Último Meio de Pagamento */}
                <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087]">
                    Último Pagamento
                  </span>
                  <p className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1] truncate">
                    {customerAnalytics.lastPaymentMethod}
                  </p>
                  <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                    Preferência registrada
                  </p>
                </div>

                {/* Economia em Cupons */}
                <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-texto-claro dark:text-[#988087]">
                    Descontos Recebidos
                  </span>
                  <p className="font-serif text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(customerAnalytics.totalDiscountCents)}
                  </p>
                  <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                    {customerAnalytics.usedCoupons.length} cupons aplicados
                  </p>
                </div>
              </div>

              {/* Destaque: Último Pedido Realizado */}
              {customerAnalytics.lastOrder ? (
                <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primaria" />
                      <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
                        Último Pedido Efetuado
                      </h3>
                    </div>
                    <Link
                      href={`/admin/pedidos/${customerAnalytics.lastOrder.id}`}
                      className="text-xs text-primaria hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Ver detalhes do pedido</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-fundo/30 dark:bg-[#151012] p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-texto-claro dark:text-[#988087] block text-[10px] uppercase font-semibold">
                        Número
                      </span>
                      <span className="font-mono font-bold text-texto-escuro dark:text-[#F8EFF1]">
                        #{customerAnalytics.lastOrder.order_number}
                      </span>
                    </div>

                    <div>
                      <span className="text-texto-claro dark:text-[#988087] block text-[10px] uppercase font-semibold">
                        Data e Hora
                      </span>
                      <span className="text-texto-escuro dark:text-[#F8EFF1]">
                        {formatDateTime(customerAnalytics.lastOrder.created_at)}
                      </span>
                    </div>

                    <div>
                      <span className="text-texto-claro dark:text-[#988087] block text-[10px] uppercase font-semibold">
                        Status
                      </span>
                      <div className="mt-0.5">
                        {getStatusBadge(customerAnalytics.lastOrder.status)}
                      </div>
                    </div>

                    <div>
                      <span className="text-texto-claro dark:text-[#988087] block text-[10px] uppercase font-semibold">
                        Total Pago
                      </span>
                      <span className="font-bold text-primaria text-sm">
                        {formatCurrency(customerAnalytics.lastOrder.total_cents)}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Último Pedido */}
                  {customerAnalytics.lastOrder.items.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] block mb-2">
                        Itens comprados no pedido:
                      </span>
                      <div className="space-y-1.5">
                        {customerAnalytics.lastOrder.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-[#151012] border border-borda/60 dark:border-[#38262C]/60"
                          >
                            <span className="font-medium text-texto-escuro dark:text-[#F8EFF1]">
                              {it.quantity}x {it.product_name}
                            </span>
                            <span className="font-mono text-texto-claro dark:text-[#988087]">
                              {formatCurrency(it.subtotal_cents)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] text-center text-xs text-texto-claro dark:text-[#988087]">
                  Este cliente ainda não realizou nenhum pedido na Isis Store.
                </div>
              )}

              {/* Seção de Cupons & Descontos Utilizados */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <Tag className="w-4 h-4 text-primaria" />
                  <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Cupons & Descontos Utilizados
                  </h3>
                </div>

                {customerAnalytics.usedCoupons.length > 0 ? (
                  <div className="space-y-2">
                    {customerAnalytics.usedCoupons.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C] text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 px-2 py-0.5 rounded-md text-[11px]">
                              {c.code}
                            </span>
                            <p className="text-[10px] text-texto-claro dark:text-[#988087] mt-1">
                              Pedido #{c.order_number} &bull; {formatDate(c.date)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                            - {formatCurrency(c.discount_cents)}
                          </span>
                          <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                            Economia gerada
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-texto-claro dark:text-[#988087] italic py-2">
                    Nenhum cupom de desconto foi utilizado por este cliente até o momento.
                  </p>
                )}
              </div>

              {/* Tabela de Todos os Pedidos do Cliente */}
              <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden space-y-0">
                <div className="p-5 border-b border-borda dark:border-[#38262C] flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primaria" />
                    <span>Histórico Completo de Pedidos ({activeCustomer.orders.length})</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF5F6] dark:bg-[#251A1E] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#D4BFC5] uppercase font-semibold text-[10px] tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Pedido</th>
                        <th className="px-5 py-3">Data</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Meio Pgto</th>
                        <th className="px-5 py-3">Desconto</th>
                        <th className="px-5 py-3">Total</th>
                        <th className="px-5 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borda/60 dark:divide-[#38262C] text-texto-escuro dark:text-[#F8EFF1]">
                      {activeCustomer.orders.length > 0 ? (
                        activeCustomer.orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-fundo/40 dark:hover:bg-[#251A1E]/50 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold">
                              #{ord.order_number}
                            </td>
                            <td className="px-5 py-3.5 text-texto-claro dark:text-[#988087] font-mono text-[11px]">
                              {formatDate(ord.created_at)}
                            </td>
                            <td className="px-5 py-3.5">
                              {getStatusBadge(ord.status)}
                            </td>
                            <td className="px-5 py-3.5 text-texto-medio dark:text-[#D4BFC5] capitalize">
                              {ord.payment_method ? ord.payment_method.replace("_", " ") : "Pendente"}
                            </td>
                            <td className="px-5 py-3.5">
                              {ord.discount_cents > 0 ? (
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  - {formatCurrency(ord.discount_cents)}
                                </span>
                              ) : (
                                <span className="text-texto-claro/60 dark:text-[#988087]/60">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-primaria">
                              {formatCurrency(ord.total_cents)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Link
                                href={`/admin/pedidos/${ord.id}`}
                                className="inline-flex items-center gap-1 text-[11px] text-primaria font-semibold hover:underline"
                              >
                                <span>Ver</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-texto-claro dark:text-[#988087]">
                            Nenhum pedido registrado para este cliente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-[#1E1518] p-12 rounded-2xl border border-borda dark:border-[#38262C] text-center text-texto-claro dark:text-[#988087]">
              Selecione um cliente para visualizar o dossiê completo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

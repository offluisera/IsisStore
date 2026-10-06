"use client";

import * as React from "react";
import Link from "next/link";
import {
  TicketPercent,
  Plus,
  Search,
  Check,
  Copy,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Percent,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";
import { Dialog } from "@/components/ui/dialog";
import type { Coupon, CouponDiscountType } from "@/lib/coupons/types";
import {
  adminSaveCouponAction,
  adminToggleCouponAction,
  adminDeleteCouponAction,
} from "@/features/coupons/actions";

interface CouponsManagerViewProps {
  initialCoupons: Coupon[];
}

interface FormState {
  id?: string;
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number; // % if percentage, or R$ if fixed
  min_subtotal_reais: number;
  max_discount_reais: number | "";
  usage_limit: number | "";
  expires_at: string;
  is_active: boolean;
}

const DEFAULT_FORM: FormState = {
  id: undefined,
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_subtotal_reais: 0,
  max_discount_reais: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

export function CouponsManagerView({ initialCoupons }: CouponsManagerViewProps) {
  const { toast } = useToast();
  const [coupons, setCoupons] = React.useState<Coupon[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive" | "expired">("all");
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);
  const [formData, setFormData] = React.useState<FormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Delete State
  const [couponToDelete, setCouponToDelete] = React.useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Toggle Loading tracker
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // Update coupons when initialCoupons changes
  React.useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  // KPIs
  const totalCount = coupons.length;
  const activeCount = coupons.filter((c) => {
    if (!c.is_active) return false;
    if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
    if (c.usage_limit && c.used_count >= c.usage_limit) return false;
    return true;
  }).length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const percentageCount = coupons.filter((c) => c.discount_type === "percentage").length;

  // Filtragem
  const filteredCoupons = React.useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
      const isLimitReached = c.usage_limit ? c.used_count >= c.usage_limit : false;

      if (statusFilter === "active") {
        return c.is_active && !isExpired && !isLimitReached;
      }
      if (statusFilter === "inactive") {
        return !c.is_active;
      }
      if (statusFilter === "expired") {
        return isExpired || isLimitReached;
      }
      return true;
    });
  }, [coupons, searchTerm, statusFilter]);

  // Copiar código
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Código copiado!", `Código ${code} copiado para a área de transferência.`);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      toast.error("Falha ao copiar código");
    }
  };

  // Abrir Modal de Criação
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(DEFAULT_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormError(null);

    // Formata datetime-local se existir
    let formattedExpires = "";
    if (coupon.expires_at) {
      const d = new Date(coupon.expires_at);
      if (!isNaN(d.getTime())) {
        formattedExpires = d.toISOString().slice(0, 16);
      }
    }

    setFormData({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value:
        coupon.discount_type === "fixed"
          ? coupon.discount_value / 100 // centavos para reais
          : coupon.discount_value,
      min_subtotal_reais: coupon.min_subtotal_cents ? coupon.min_subtotal_cents / 100 : 0,
      max_discount_reais: coupon.max_discount_cents ? coupon.max_discount_cents / 100 : "",
      usage_limit: coupon.usage_limit || "",
      expires_at: formattedExpires,
      is_active: coupon.is_active,
    });
    setIsModalOpen(true);
  };

  // Salvar Cupom (Criar ou Atualizar)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim()) {
      setFormError("O código do cupom é obrigatório.");
      return;
    }

    if (Number(formData.discount_value) <= 0) {
      setFormError("Informe um valor de desconto válido maior que zero.");
      return;
    }

    if (formData.discount_type === "percentage" && Number(formData.discount_value) > 100) {
      setFormError("Desconto percentual não pode ser maior que 100%.");
      return;
    }

    setIsSubmitting(true);

    try {
      const f = new FormData();
      if (formData.id) f.append("id", formData.id);
      f.append("code", formData.code.trim().toUpperCase());
      f.append("description", formData.description.trim());
      f.append("discount_type", formData.discount_type);
      f.append("discount_value", String(formData.discount_value));
      f.append("min_subtotal_reais", String(formData.min_subtotal_reais || 0));
      if (formData.max_discount_reais !== "") {
        f.append("max_discount_reais", String(formData.max_discount_reais));
      }
      if (formData.usage_limit !== "") {
        f.append("usage_limit", String(formData.usage_limit));
      }
      if (formData.expires_at) {
        f.append("expires_at", new Date(formData.expires_at).toISOString());
      }
      f.append("is_active", formData.is_active ? "true" : "false");

      const result = await adminSaveCouponAction(f);

      if (!result.success) {
        setFormError(result.message);
        toast.error("Erro ao salvar cupom", result.message);
        return;
      }

      toast.success(
        editingCoupon ? "Cupom atualizado!" : "Cupom criado com sucesso!",
        `O cupom ${formData.code.toUpperCase()} já está disponível.`
      );

      // Atualiza lista local otimisticamente
      if (result.coupon) {
        const saved = result.coupon;
        setCoupons((prev) => {
          const index = prev.findIndex((c) => c.id === saved.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = saved;
            return next;
          }
          return [saved, ...prev];
        });
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(msg);
      toast.error("Erro inesperado", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternar Status Ativo / Inativo
  const handleToggleActive = async (coupon: Coupon) => {
    const nextStatus = !coupon.is_active;
    setTogglingId(coupon.id);

    // Otimista
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextStatus } : c))
    );

    try {
      const res = await adminToggleCouponAction(coupon.id, nextStatus);
      if (!res.success) {
        // Rollback
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !nextStatus } : c))
        );
        toast.error("Erro ao alterar status", res.message);
      } else {
        toast.success(
          nextStatus ? "Cupom ativado" : "Cupom pausado",
          `O cupom ${coupon.code} ${nextStatus ? "pode ser utilizado" : "foi desativado"}.`
        );
      }
    } catch {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !nextStatus } : c))
      );
      toast.error("Erro de comunicação ao alterar status");
    } finally {
      setTogglingId(null);
    }
  };

  // Confirmar Exclusão
  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);

    try {
      const res = await adminDeleteCouponAction(couponToDelete.id);
      if (!res.success) {
        toast.error("Falha ao excluir", res.message);
      } else {
        toast.success("Cupom excluído!", `O cupom ${couponToDelete.code} foi removido.`);
        setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
        setCouponToDelete(null);
      }
    } catch {
      toast.error("Erro ao excluir cupom");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper formatação de moeda
  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Cupons & Descontos</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Gerenciamento de Cupons
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primaria/10 dark:bg-primaria/20 text-primaria border border-primaria/20">
              <Sparkles className="w-3 h-3" />
              Checkout Ativo
            </span>
          </div>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-1 max-w-2xl leading-relaxed">
            Crie, personalize regras e acompanhe os cupons promocionais aplicados pelos clientes durante o checkout da Isis Store.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primaria text-white font-medium text-sm hover:bg-primaria-hover transition-all duration-200 shadow-sm shadow-primaria/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Cupom</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-texto-claro dark:text-[#988087]">Total de Cupons</span>
            <div className="text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] mt-1">{totalCount}</div>
            <span className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5 block">
              {percentageCount} em porcentagem / {totalCount - percentageCount} fixos
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center shrink-0">
            <TicketPercent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-texto-claro dark:text-[#988087]">Cupons Ativos</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
            <span className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5 block">
              Disponíveis para uso imediato
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-texto-claro dark:text-[#988087]">Resgates Realizados</span>
            <div className="text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] mt-1">{totalUses}</div>
            <span className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5 block">
              Vezes resgatados no checkout
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/40">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-texto-claro dark:text-[#988087]">Regras e Validações</span>
            <div className="text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] mt-1">100% Automático</div>
            <span className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5 block">
              Checagem em tempo real no servidor
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/40">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros & Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1E1518] p-4 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código ou descrição..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-fundo-card dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] focus:outline-none focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "active", label: "Ativos" },
              { key: "inactive", label: "Pausados" },
              { key: "expired", label: "Expirados/Esgotados" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-xl transition-all shrink-0",
                statusFilter === filter.key
                  ? "bg-primaria text-white shadow-xs"
                  : "bg-fundo-card dark:bg-[#151012] text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-cinza-claro dark:hover:bg-[#251A1E]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista / Tabela de Cupons */}
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primaria/10 text-primaria flex items-center justify-center mb-3">
              <TicketPercent className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Nenhum cupom encontrado
            </h3>
            <p className="text-xs text-texto-claro dark:text-[#988087] mt-1 max-w-sm">
              {searchTerm || statusFilter !== "all"
                ? "Não encontramos cupons para o filtro selecionado. Tente alterar os critérios de busca."
                : "Você ainda não possui cupons cadastrados. Crie o primeiro cupom da loja agora!"}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-primaria hover:underline"
              >
                Limpar filtros
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primaria text-white text-xs font-semibold hover:bg-primaria-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar Primeiro Cupom
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borda dark:border-[#38262C] bg-cinza-claro/50 dark:bg-[#251A1E] text-[11px] font-semibold text-texto-claro dark:text-[#D4BFC5] uppercase tracking-wider">
                  <th className="py-3 px-5">Cupom & Código</th>
                  <th className="py-3 px-4">Desconto</th>
                  <th className="py-3 px-4">Critérios & Regras</th>
                  <th className="py-3 px-4">Utilizações</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda dark:divide-[#38262C] text-xs">
                {filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expires_at
                    ? new Date(coupon.expires_at) < new Date()
                    : false;
                  const isLimitReached = coupon.usage_limit
                    ? coupon.used_count >= coupon.usage_limit
                    : false;

                  return (
                    <tr
                      key={coupon.id}
                      className={cn(
                        "hover:bg-primaria-soft/10 dark:hover:bg-[#251A1E]/50 transition-colors group",
                        !coupon.is_active && "opacity-75 bg-cinza-claro/20 dark:bg-[#151012]/50"
                      )}
                    >
                      {/* Código & Descrição */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-primaria/10 text-primaria border border-primaria/20 px-2.5 py-1 rounded-lg">
                            <span>{coupon.code}</span>
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className="text-primaria hover:text-primaria-hover transition-colors p-0.5 rounded"
                              title="Copiar código"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-1 line-clamp-1 max-w-xs">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Desconto */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <Percent className="w-3 h-3" />
                              <span>{coupon.discount_value}% OFF</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3 h-3" />
                              <span>{formatMoney(coupon.discount_value)} OFF</span>
                            </>
                          )}
                        </div>
                        {coupon.discount_type === "percentage" && coupon.max_discount_cents && (
                          <div className="text-[10px] text-texto-claro dark:text-[#988087] mt-0.5">
                            Teto máx: {formatMoney(coupon.max_discount_cents)}
                          </div>
                        )}
                      </td>

                      {/* Critérios */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 text-[11px] text-texto-escuro dark:text-[#F8EFF1]">
                          <div className="flex items-center gap-1 text-texto-claro dark:text-[#988087]">
                            <span>Mínimo:</span>
                            <span className="font-medium text-texto-escuro dark:text-[#F8EFF1]">
                              {coupon.min_subtotal_cents > 0
                                ? formatMoney(coupon.min_subtotal_cents)
                                : "Sem valor mínimo"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-texto-claro dark:text-[#988087]">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>
                              {coupon.expires_at ? (
                                <span
                                  className={cn(
                                    isExpired
                                      ? "text-rose-600 dark:text-rose-400 font-semibold"
                                      : "text-texto-escuro dark:text-[#F8EFF1]"
                                  )}
                                >
                                  {isExpired ? "Expirou em " : "Válido até "}
                                  {new Date(coupon.expires_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              ) : (
                                "Sem expiração"
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Utilizações */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                            {coupon.used_count}{" "}
                            <span className="text-[11px] font-normal text-texto-claro dark:text-[#988087]">
                              / {coupon.usage_limit ? coupon.usage_limit : "∞"}
                            </span>
                          </div>
                        </div>
                        {isLimitReached && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                            Esgotado
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={coupon.is_active}
                            disabled={togglingId === coupon.id}
                            onClick={() => handleToggleActive(coupon)}
                            className={cn(
                              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaria/20",
                              coupon.is_active ? "bg-emerald-500" : "bg-cinza-escuro/30 dark:bg-[#38262C]",
                              togglingId === coupon.id && "opacity-50 cursor-wait"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                coupon.is_active ? "translate-x-4" : "translate-x-0"
                              )}
                            />
                          </button>
                          <span
                            className={cn(
                              "text-[11px] font-medium",
                              coupon.is_active ? "text-emerald-700 dark:text-emerald-400" : "text-texto-claro dark:text-[#988087]"
                            )}
                          >
                            {coupon.is_active ? "Ativo" : "Pausado"}
                          </span>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded-lg text-texto-claro dark:text-[#988087] hover:text-primaria hover:bg-primaria/10 transition-colors"
                            title="Editar cupom"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setCouponToDelete(coupon)}
                            className="p-1.5 rounded-lg text-texto-claro dark:text-[#988087] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Excluir cupom"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Cupom */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingCoupon ? `Editar Cupom: ${editingCoupon.code}` : "Criar Novo Cupom"}
        description="Defina o código, tipo de desconto e critérios de uso no checkout da loja."
        className="max-w-2xl max-h-[92vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmitForm} className="space-y-5 mt-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Ticket Preview Interativo em Tempo Real */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primaria/40 bg-gradient-to-br from-primaria/5 via-fundo-card to-primaria-soft/20 dark:from-primaria/10 dark:via-[#1A1215] dark:to-primaria-soft/10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primaria uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Preview do Cupom do Cliente</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-texto-escuro dark:text-[#F8EFF1] tracking-wider">
                    {formData.code.trim().toUpperCase() || "SEUCODIGO"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                    {formData.discount_type === "percentage"
                      ? `${formData.discount_value || 0}% OFF`
                      : `${Number(formData.discount_value || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })} OFF`}
                  </span>
                </div>
                <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-1 line-clamp-1">
                  {formData.description || "Descrição de desconto exibida ao cliente"}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-primaria/20 dark:sm:border-primaria/30 sm:pl-4 text-[11px] text-texto-claro dark:text-[#988087] space-y-0.5">
                <div>
                  Mínimo:{" "}
                  <strong className="text-texto-escuro dark:text-[#F8EFF1] font-semibold">
                    {formData.min_subtotal_reais > 0
                      ? Number(formData.min_subtotal_reais).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "Sem mínimo"}
                  </strong>
                </div>
                {formData.discount_type === "percentage" && formData.max_discount_reais !== "" && (
                  <div>
                    Teto máx:{" "}
                    <strong className="text-texto-escuro dark:text-[#F8EFF1] font-semibold">
                      {Number(formData.max_discount_reais).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>
                )}
                {formData.expires_at && (
                  <div className="text-primaria font-medium">
                    Expira em {new Date(formData.expires_at).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código do Cupom */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                <span>Código Promocional *</span>
                <span className="text-[11px] text-texto-claro dark:text-[#988087] font-normal">
                  Letras e números sem espaços (ex: ISIS10, VERAO20)
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                  }))
                }
                placeholder="Ex: PRIMEIRACOMPRA"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria uppercase transition-all"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                Descrição do Cupom
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Ex: 10% de desconto para todos os pedidos de boas-vindas"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
              />
            </div>

            {/* Tipo de Desconto Selector */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                Tipo de Desconto *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_type: "percentage",
                      discount_value: prev.discount_type === "percentage" ? prev.discount_value : 10,
                    }))
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all",
                    formData.discount_type === "percentage"
                      ? "border-primaria bg-primaria/10 text-primaria"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-claro dark:text-[#988087] hover:border-cinza-escuro dark:hover:border-[#4E353E]"
                  )}
                >
                  <Percent className="w-4 h-4" />
                  <span>Porcentagem (% OFF)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_type: "fixed",
                      discount_value: prev.discount_type === "fixed" ? prev.discount_value : 20,
                    }))
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all",
                    formData.discount_type === "fixed"
                      ? "border-primaria bg-primaria/10 text-primaria"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-claro dark:text-[#988087] hover:border-cinza-escuro dark:hover:border-[#4E353E]"
                  )}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Valor Fixo (R$ OFF)</span>
                </button>
              </div>
            </div>

            {/* Valor do Desconto */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                {formData.discount_type === "percentage"
                  ? "Porcentagem de Desconto (%) *"
                  : "Valor do Desconto em Reais (R$) *"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={formData.discount_type === "percentage" ? "1" : "0.50"}
                  min="0.01"
                  max={formData.discount_type === "percentage" ? "100" : "10000"}
                  required
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_value: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087] text-xs font-semibold">
                  {formData.discount_type === "percentage" ? "%" : "R$"}
                </span>
              </div>
            </div>

            {/* Pedido Mínimo */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                Pedido Mínimo (R$)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.min_subtotal_reais}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      min_subtotal_reais: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0 para sem mínimo"
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087] text-xs font-semibold">
                  R$
                </span>
              </div>
            </div>

            {/* Teto Máximo (apenas para porcentagem) */}
            {formData.discount_type === "percentage" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                  <span>Teto Máximo de Desconto</span>
                  <span className="text-[10px] text-texto-claro dark:text-[#988087] font-normal">Opcional</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formData.max_discount_reais}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_discount_reais:
                          e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 50.00"
                    className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087] text-xs font-semibold">
                    R$
                  </span>
                </div>
              </div>
            )}

            {/* Limite de Usos */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                <span>Limite Global de Usos</span>
                <span className="text-[10px] text-texto-claro dark:text-[#988087] font-normal">
                  Vazio = Ilimitado
                </span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    usage_limit: e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0,
                  }))
                }
                placeholder="Ex: 100"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
              />
            </div>

            {/* Data de Expiração */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                <span>Data e Hora de Expiração</span>
                <span className="text-[10px] text-texto-claro dark:text-[#988087] font-normal">
                  Vazio = Sem prazo de validade
                </span>
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:ring-2 focus:ring-primaria/20 focus:border-primaria transition-all"
              />
            </div>

            {/* Ativo Inicial */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-primaria focus:ring-primaria border-borda dark:border-[#38262C] bg-white dark:bg-[#151012]"
                />
                <div>
                  <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Cupom Ativo para Uso Imediato
                  </span>
                  <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                    Clientes poderão validar e aplicar este cupom na etapa de checkout.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-borda dark:border-[#38262C]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1] transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primaria text-white text-xs font-semibold hover:bg-primaria-hover transition-all shadow-sm shadow-primaria/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando cupom...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingCoupon ? "Salvar Alterações" : "Criar Cupom"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <Dialog
        isOpen={Boolean(couponToDelete)}
        onClose={() => !isDeleting && setCouponToDelete(null)}
        title="Excluir Cupom"
        description="Esta ação removerá o cupom definitivamente. Pedidos já concluídos manterão o histórico do desconto intacto."
        className="max-w-md"
      >
        <div className="space-y-4 mt-3">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Deseja realmente excluir o cupom{" "}
                <span className="font-mono">{couponToDelete?.code}</span>?
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Novos pedidos não poderão mais resgatar este código.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setCouponToDelete(null)}
              className="px-4 py-2 text-xs font-medium text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1]"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Definitivamente</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

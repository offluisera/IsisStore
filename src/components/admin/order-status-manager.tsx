"use client";

import * as React from "react";
import { updateOrderStatusAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, Save } from "lucide-react";

interface OrderStatusManagerProps {
  orderId: string;
  orderNumber: string;
  initialStatus:
    | "pending_payment"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  initialNotes?: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Aguardando Pagamento", color: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/40" },
  paid: { label: "Pago", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/40" },
  processing: { label: "Em Separação", color: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/40" },
  shipped: { label: "Enviado", color: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/40" },
  delivered: { label: "Entregue", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700/50" },
  cancelled: { label: "Cancelado", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/40" },
  refunded: { label: "Reembolsado", color: "bg-neutral-100 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700" },
};

export function OrderStatusManager({
  orderId,
  orderNumber,
  initialStatus,
  initialNotes,
}: OrderStatusManagerProps) {
  const [status, setStatus] = React.useState(initialStatus);
  const [notes, setNotes] = React.useState(initialNotes || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateOrderStatusAction({
        orderId,
        status,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Ocorreu uma falha ao atualizar o status do pedido.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
        <div>
          <h2 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Gerenciamento do Pedido #{orderNumber}
          </h2>
          <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5">
            Atualize a situação operacional e informe o código de rastreio
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            STATUS_LABELS[status]?.color || "bg-neutral-100 text-neutral-800"
          }`}
        >
          {STATUS_LABELS[status]?.label || status}
        </span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-sucesso/10 text-sucesso border border-sucesso/20"
              : "bg-erro/10 text-erro border border-erro/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
            Alterar Status do Pedido *
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as
                  | "pending_payment"
                  | "paid"
                  | "processing"
                  | "shipped"
                  | "delivered"
                  | "cancelled"
                  | "refunded"
              )
            }
            className="w-full bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl p-3 text-xs font-medium text-texto-escuro dark:text-[#F8EFF1] focus:outline-none focus:ring-1 focus:ring-primaria"
          >
            <option value="pending_payment">Aguardando Pagamento</option>
            <option value="paid">Pago (Aprovado)</option>
            <option value="processing">Em Separação / Embalagem</option>
            <option value="shipped">Enviado (Em Trânsito)</option>
            <option value="delivered">Entregue ao Destinatário</option>
            <option value="cancelled">Cancelado (Reverte Estoque)</option>
            <option value="refunded">Reembolsado (Reverte Estoque)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
            Código de Rastreamento / Observações Internas
          </label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Correios Sedex BR123456789BR ou nota para a equipe"
            className="text-xs dark:bg-[#151012] dark:border-[#38262C] dark:text-[#F8EFF1]"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-xs font-semibold gap-2 shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Salvando Alterações...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações do Pedido</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

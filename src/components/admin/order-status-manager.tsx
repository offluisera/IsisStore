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
  pending_payment: { label: "Aguardando Pagamento", color: "bg-amber-100 text-amber-800 border-amber-300" },
  paid: { label: "Pago", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  processing: { label: "Em Separação", color: "bg-blue-100 text-blue-800 border-blue-300" },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800 border-purple-300" },
  delivered: { label: "Entregue", color: "bg-emerald-100 text-emerald-900 border-emerald-400" },
  cancelled: { label: "Cancelado", color: "bg-rose-100 text-rose-800 border-rose-300" },
  refunded: { label: "Reembolsado", color: "bg-neutral-100 text-neutral-800 border-neutral-300" },
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
    <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-borda/60">
        <div>
          <h2 className="font-serif text-sm font-bold text-texto-escuro">
            Gerenciamento do Pedido #{orderNumber}
          </h2>
          <p className="text-[11px] text-texto-claro mt-0.5">
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
          <label className="block font-semibold text-texto-escuro mb-1.5">
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
            className="w-full bg-white border border-borda rounded-xl p-3 text-xs font-medium text-texto-escuro focus:outline-none focus:ring-1 focus:ring-primaria"
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
          <label className="block font-semibold text-texto-escuro mb-1.5">
            Código de Rastreamento / Observações Internas
          </label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Correios Sedex BR123456789BR ou nota para a equipe"
            className="text-xs"
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

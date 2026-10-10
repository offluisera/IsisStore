"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import {
  updateProductStockAction,
  updateProductStatusAction,
} from "@/features/admin/actions";
import { Check, Loader2, Minus, Plus } from "lucide-react";

interface QuickProductEditorProps {
  productId: string;
  initialStock: number;
  initialStatus: "published" | "draft" | "archived";
}

export function QuickProductEditor({
  productId,
  initialStock,
  initialStatus,
}: QuickProductEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [stock, setStock] = React.useState(initialStock);
  const [status, setStatus] = React.useState(initialStatus);
  const [loadingStock, setLoadingStock] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleStockChange = async (newStock: number) => {
    if (newStock < 0 || newStock === stock) return;
    setLoadingStock(true);
    setStock(newStock);
    try {
      const res = await updateProductStockAction(productId, newStock);
      if (res.success) {
        setFeedback("Estoque atualizado!");
        setTimeout(() => setFeedback(null), 2000);
      } else {
        setStock(stock); // Reverte se falhou
      }
    } catch {
      setStock(stock);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "published" | "draft" | "archived"
  ) => {
    if (newStatus === status) return;
    setLoadingStatus(true);
    setStatus(newStatus);
    try {
      const res = await updateProductStatusAction(productId, newStatus);
      if (res.success) {
        const msg =
          newStatus === "draft"
            ? "Movido para Rascunhos!"
            : newStatus === "published"
            ? "Publicado na loja!"
            : "Arquivado!";
        setFeedback(msg);
        toast.success(
          "Status Atualizado",
          newStatus === "draft"
            ? "O produto foi ocultado da loja pública e movido para a guia Rascunhos."
            : newStatus === "published"
            ? "O produto agora está visível e disponível para compra na loja."
            : "O produto foi arquivado."
        );
        setTimeout(() => setFeedback(null), 2500);
        router.refresh();
      } else {
        setStatus(status);
        toast.error("Erro ao alterar status", res.message);
      }
    } catch {
      setStatus(status);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs shrink-0">
      {/* Controle Rápido de Estoque */}
      <div className="flex items-center border border-borda dark:border-[#38262C] rounded-xl bg-white dark:bg-[#151012] p-0.5 shadow-2xs">
        <button
          type="button"
          disabled={loadingStock || stock <= 0}
          onClick={() => handleStockChange(stock - 1)}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] disabled:opacity-30 transition-colors"
          title="Diminuir estoque"
        >
          <Minus className="w-3 h-3" />
        </button>

        <span
          className={`w-9 text-center font-mono font-semibold text-xs ${
            stock <= 0
              ? "text-erro"
              : stock <= 5
              ? "text-amber-600 dark:text-amber-400"
              : "text-texto-escuro dark:text-[#F8EFF1]"
          }`}
        >
          {loadingStock ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-primaria" />
          ) : (
            stock
          )}
        </span>

        <button
          type="button"
          disabled={loadingStock}
          onClick={() => handleStockChange(stock + 1)}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors"
          title="Aumentar estoque"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Seletor de Status */}
      <select
        value={status}
        disabled={loadingStatus}
        onChange={(e) =>
          handleStatusChange(
            e.target.value as "published" | "draft" | "archived"
          )
        }
        className="bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl px-2 py-1 text-[11px] font-semibold text-texto-escuro dark:text-[#F8EFF1] focus:outline-none focus:ring-1 focus:ring-primaria transition-all"
      >
        <option value="published" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Publicado</option>
        <option value="draft" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Rascunho</option>
        <option value="archived" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Arquivado</option>
      </select>

      {feedback && (
        <span className="flex items-center gap-1 text-[10px] text-sucesso font-semibold animate-in fade-in">
          <Check className="w-3 h-3" />
          <span>{feedback}</span>
        </span>
      )}
    </div>
  );
}

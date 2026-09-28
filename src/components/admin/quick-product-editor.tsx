"use client";

import * as React from "react";
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
        setFeedback("Status atualizado!");
        setTimeout(() => setFeedback(null), 2000);
      } else {
        setStatus(status);
      }
    } catch {
      setStatus(status);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="flex items-center gap-4 text-xs">
      {/* Controle Rápido de Estoque */}
      <div className="flex items-center border border-borda rounded-xl bg-white p-0.5 shadow-2xs">
        <button
          type="button"
          disabled={loadingStock || stock <= 0}
          onClick={() => handleStockChange(stock - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-texto-medio hover:text-texto-escuro hover:bg-fundo disabled:opacity-30 transition-colors"
          title="Diminuir estoque"
        >
          <Minus className="w-3 h-3" />
        </button>

        <span
          className={`w-12 text-center font-mono font-semibold text-xs ${
            stock <= 0
              ? "text-erro"
              : stock <= 5
              ? "text-amber-600"
              : "text-texto-escuro"
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
          className="w-7 h-7 flex items-center justify-center rounded-lg text-texto-medio hover:text-texto-escuro hover:bg-fundo transition-colors"
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
        className="bg-white border border-borda rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-texto-escuro focus:outline-none focus:ring-1 focus:ring-primaria transition-all"
      >
        <option value="published">Publicado</option>
        <option value="draft">Rascunho</option>
        <option value="archived">Arquivado</option>
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

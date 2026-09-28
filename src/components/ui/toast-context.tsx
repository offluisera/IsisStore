"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const VARIANT_CONFIGS = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-200",
    bg: "bg-emerald-50/95",
    text: "text-emerald-900",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    border: "border-rose-200",
    bg: "bg-rose-50/95",
    text: "text-rose-900",
    iconColor: "text-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200",
    bg: "bg-amber-50/95",
    text: "text-amber-900",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    border: "border-primaria-border",
    bg: "bg-white/95",
    text: "text-texto-escuro",
    iconColor: "text-primaria",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    ({ variant, title, description, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastItem = { id, variant, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = React.useMemo(
    () => ({
      success: (title: string, description?: string) =>
        addToast({ variant: "success", title, description }),
      error: (title: string, description?: string) =>
        addToast({ variant: "error", title, description }),
      warning: (title: string, description?: string) =>
        addToast({ variant: "warning", title, description }),
      info: (title: string, description?: string) =>
        addToast({ variant: "info", title, description }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        toast: toastHelpers,
      }}
    >
      {children}

      {/* Container Flutuante de Toasts com Animação Acelerada por GPU */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4 sm:p-0"
      >
        {toasts.map((t) => {
          const cfg = VARIANT_CONFIGS[t.variant];
          const Icon = cfg.icon;

          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ease-out",
                cfg.border,
                cfg.bg,
                cfg.text
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", cfg.iconColor)} />

              <div className="flex-1 pr-1">
                <h4 className="font-semibold text-xs leading-snug">{t.title}</h4>
                {t.description && (
                  <p className="text-[11px] text-texto-medio mt-0.5 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-texto-claro hover:text-texto-escuro hover:bg-black/5 transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser utilizado dentro de um ToastProvider.");
  }
  return context;
}

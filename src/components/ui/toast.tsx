import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "relative flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-md transition-all duration-300",
  {
    variants: {
      variant: {
        success: "border-emerald-200 bg-sucesso-fundo text-sucesso",
        warning: "border-amber-200 bg-alerta-fundo text-alerta",
        error: "border-red-200 bg-erro-fundo text-erro",
        info: "border-sky-200 bg-info-fundo text-info",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  onClose?: () => void;
}

export function Toast({
  className,
  variant = "info",
  title,
  description,
  onClose,
  ...props
}: ToastProps) {
  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "warning"
      ? AlertTriangle
      : variant === "error"
      ? XCircle
      : Info;

  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 pr-2">
        <h4 className="text-sm font-semibold leading-tight text-texto-escuro">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-xs text-texto-medio leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-texto-claro hover:text-texto-escuro transition-colors p-1 rounded-lg"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primaria focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primaria-soft text-primaria border border-primaria-border",
        primary:
          "bg-primaria text-white shadow-sm",
        secondary:
          "bg-secundaria text-texto-escuro",
        outline:
          "border border-borda text-texto-medio bg-fundo-card",
        success:
          "bg-sucesso-fundo text-sucesso border border-emerald-200",
        warning:
          "bg-alerta-fundo text-alerta border border-amber-200",
        destructive:
          "bg-erro-fundo text-erro border border-red-200",
        discount:
          "bg-primaria text-white font-bold tracking-tight shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

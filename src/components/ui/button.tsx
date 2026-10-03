import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primaria text-white shadow-sm hover:bg-primaria-hover hover:shadow active:bg-primaria-active",
        primary:
          "bg-primaria text-white shadow-sm hover:bg-primaria-hover hover:shadow active:bg-primaria-active",
        secondary:
          "bg-secundaria text-texto-escuro hover:bg-secundaria-hover active:bg-secundaria-clara",
        outline:
          "border-2 border-primaria text-primaria bg-transparent hover:bg-primaria-soft active:bg-secundaria-clara",
        ghost:
          "text-texto-escuro hover:bg-primaria-soft hover:text-primaria",
        link:
          "text-primaria underline-offset-4 hover:underline p-0 h-auto font-medium",
        white:
          "bg-fundo-card text-texto-escuro border border-borda hover:bg-fundo hover:border-primaria-border shadow-sm",
        destructive:
          "bg-erro text-white hover:bg-red-700 shadow-sm",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-7 text-base font-semibold",
        icon: "h-10 w-10 rounded-xl p-0",
        "icon-sm": "h-8 w-8 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isRequired?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      isRequired,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-texto-escuro flex items-center gap-1 select-none"
          >
            {label}
            {isRequired && <span className="text-erro font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {iconLeft && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-texto-claro">
              {iconLeft}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-borda bg-white px-3.5 py-2 text-sm text-texto-escuro placeholder:text-texto-claro transition-all duration-150 outline-none",
              "hover:border-primaria-border",
              "focus:border-primaria focus:ring-2 focus:ring-primaria/20",
              "disabled:cursor-not-allowed disabled:bg-fundo disabled:opacity-60",
              iconLeft && "pl-10",
              iconRight && "pr-10",
              error && "border-erro focus:border-erro focus:ring-erro/20",
              className
            )}
            ref={ref}
            {...props}
          />

          {iconRight && (
            <div className="absolute right-3.5 flex items-center text-texto-claro">
              {iconRight}
            </div>
          )}
        </div>

        {error ? (
          <span className="text-xs font-medium text-erro transition-all">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-texto-claro">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

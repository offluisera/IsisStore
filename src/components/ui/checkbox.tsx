import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none text-sm text-texto-escuro",
          props.disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-md border border-borda bg-white transition-all duration-150 flex items-center justify-center",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primaria peer-focus-visible:ring-offset-1",
              "peer-checked:bg-primaria peer-checked:border-primaria text-white",
              "hover:border-primaria"
            )}
          >
            <Check className="h-3.5 w-3.5 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {label && <span className="text-xs sm:text-sm">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

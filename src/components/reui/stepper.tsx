"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "active" | "completed" | "inactive" | "loading";

export type StepIndicators = {
  active?: React.ReactNode;
  completed?: React.ReactNode;
  inactive?: React.ReactNode;
  loading?: React.ReactNode;
};

interface StepperContextValue {
  activeStep: number;
  setActiveStep: (step: number) => void;
  orientation: StepperOrientation;
  registerTrigger: (node: HTMLButtonElement | null) => void;
  triggerNodes: HTMLButtonElement[];
  indicators?: StepIndicators;
}

interface StepItemContextValue {
  step: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(undefined);
const StepItemContext = React.createContext<StepItemContextValue | undefined>(undefined);

export function useStepper() {
  const ctx = React.useContext(StepperContext);
  if (!ctx) throw new Error("useStepper must be used within a Stepper");
  return ctx;
}

export function useStepItem() {
  const ctx = React.useContext(StepItemContext);
  if (!ctx) throw new Error("useStepItem must be used within a StepperItem");
  return ctx;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  indicators?: StepIndicators;
}

export function Stepper({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
  indicators,
  ...props
}: StepperProps) {
  const [activeStepState, setActiveStepState] = React.useState(defaultValue);
  const [triggerNodes, setTriggerNodes] = React.useState<HTMLButtonElement[]>([]);

  const registerTrigger = React.useCallback((node: HTMLButtonElement | null) => {
    setTriggerNodes((prev) => {
      if (node && !prev.includes(node)) {
        return [...prev, node];
      } else if (!node && prev.includes(node!)) {
        return prev.filter((n) => n !== node);
      }
      return prev;
    });
  }, []);

  const handleSetActiveStep = React.useCallback(
    (step: number) => {
      if (value === undefined) {
        setActiveStepState(step);
      }
      onValueChange?.(step);
    },
    [value, onValueChange]
  );

  const currentStep = value ?? activeStepState;

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      activeStep: currentStep,
      setActiveStep: handleSetActiveStep,
      orientation,
      registerTrigger,
      triggerNodes,
      indicators,
    }),
    [currentStep, handleSetActiveStep, orientation, registerTrigger, triggerNodes, indicators]
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        role="tablist"
        aria-orientation={orientation}
        data-slot="stepper"
        data-orientation={orientation}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function StepperItem({
  step,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { activeStep } = useStepper();

  const state: StepState =
    completed || step < activeStep
      ? "completed"
      : activeStep === step
      ? "active"
      : "inactive";

  const isLoading = loading && step === activeStep;

  return (
    <StepItemContext.Provider
      value={{ step, state, isDisabled: disabled, isLoading }}
    >
      <div
        data-slot="stepper-item"
        data-state={state}
        data-loading={isLoading ? true : undefined}
        className={cn(
          "group/step flex items-center justify-center not-last:flex-1",
          "group-data-[orientation=horizontal]/stepper-nav:flex-row",
          "group-data-[orientation=vertical]/stepper-nav:flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

export interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function StepperTrigger({
  className,
  children,
  tabIndex,
  onClick,
  ...props
}: StepperTriggerProps) {
  const { state, isLoading, step, isDisabled } = useStepItem();
  const { setActiveStep, activeStep, registerTrigger } = useStepper();
  const isSelected = activeStep === step;

  const btnRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (btnRef.current) {
      registerTrigger(btnRef.current);
    }
  }, [registerTrigger]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!isDisabled) {
      setActiveStep(step);
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      role="tab"
      id={`stepper-tab-${step}`}
      aria-selected={isSelected}
      aria-controls={`stepper-panel-${step}`}
      tabIndex={typeof tabIndex === "number" ? tabIndex : isSelected ? 0 : -1}
      data-slot="stepper-trigger"
      data-state={state}
      data-loading={isLoading ? true : undefined}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        "inline-flex cursor-pointer items-center outline-none transition-all disabled:pointer-events-none disabled:opacity-50",
        "gap-2.5 rounded-full select-none",
        "focus-visible:ring-2 focus-visible:ring-primaria/40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StepperIndicator({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { state, isLoading } = useStepItem();
  const { indicators } = useStepper();

  let renderedContent = children;
  if (indicators) {
    if (isLoading && indicators.loading) renderedContent = indicators.loading;
    else if (state === "completed" && indicators.completed) renderedContent = indicators.completed;
    else if (state === "active" && indicators.active) renderedContent = indicators.active;
    else if (state === "inactive" && indicators.inactive) renderedContent = indicators.inactive;
  } else if (state === "completed") {
    renderedContent = <Check className="w-3.5 h-3.5 stroke-[2.5]" />;
  } else if (isLoading) {
    renderedContent = <Loader2 className="w-3.5 h-3.5 animate-spin" />;
  }

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold transition-all duration-200",
        // Estados padrão elegantes com o design system Isis Store
        "data-[state=active]:bg-primaria data-[state=active]:text-white data-[state=active]:ring-4 data-[state=active]:ring-primaria/20",
        "data-[state=completed]:bg-emerald-600 data-[state=completed]:text-white shadow-xs",
        "data-[state=inactive]:bg-fundo-card data-[state=inactive]:border data-[state=inactive]:border-borda dark:data-[state=inactive]:border-[#38262C] data-[state=inactive]:text-texto-claro dark:data-[state=inactive]:text-[#8E787C]",
        className
      )}
      {...props}
    >
      {renderedContent}
    </div>
  );
}

export function StepperSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { state } = useStepItem();

  return (
    <div
      data-slot="stepper-separator"
      data-state={state}
      className={cn(
        "rounded-full transition-colors duration-200",
        "group-data-[orientation=horizontal]/stepper-nav:h-0.5 group-data-[orientation=horizontal]/stepper-nav:flex-1 group-data-[orientation=horizontal]/stepper-nav:mx-2",
        "group-data-[orientation=vertical]/stepper-nav:w-0.5 group-data-[orientation=vertical]/stepper-nav:h-10 group-data-[orientation=vertical]/stepper-nav:my-1",
        "bg-borda dark:bg-[#38262C]",
        "group-data-[state=completed]/step:bg-emerald-500 dark:group-data-[state=completed]/step:bg-emerald-600",
        className
      )}
      {...props}
    />
  );
}

export function StepperTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { state } = useStepItem();

  return (
    <h3
      data-slot="stepper-title"
      data-state={state}
      className={cn(
        "text-xs sm:text-sm font-semibold transition-colors",
        state === "active" && "text-primaria",
        state === "completed" && "text-texto-escuro dark:text-[#F8EFF1]",
        state === "inactive" && "text-texto-claro dark:text-[#8E787C]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function StepperDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { state } = useStepItem();

  return (
    <p
      data-slot="stepper-description"
      data-state={state}
      className={cn("text-[11px] text-texto-claro dark:text-[#A8949A] transition-colors", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function StepperNav({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { activeStep, orientation } = useStepper();

  return (
    <nav
      data-slot="stepper-nav"
      data-state={activeStep}
      data-orientation={orientation}
      className={cn(
        "group/stepper-nav inline-flex items-center",
        "data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row",
        "data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export function StepperPanel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { activeStep } = useStepper();

  return (
    <div
      data-slot="stepper-panel"
      data-state={activeStep}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StepperContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  forceMount?: boolean;
}

export function StepperContent({
  value,
  forceMount,
  children,
  className,
  ...props
}: StepperContentProps) {
  const { activeStep } = useStepper();
  const isActive = value === activeStep;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`stepper-panel-${value}`}
      aria-labelledby={`stepper-tab-${value}`}
      data-slot="stepper-content"
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive && forceMount}
      className={cn(
        "w-full transition-all duration-200",
        !isActive && forceMount && "hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

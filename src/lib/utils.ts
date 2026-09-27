import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função utilitária padrão para combinar classes Tailwind e condicionais com segurança.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

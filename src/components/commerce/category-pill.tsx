import * as React from "react";
import Link from "next/link";
import { Gift, Baby, Shirt, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName: "gift" | "baby" | "shirt" | "home" | "sparkles";
}

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  { id: "1", name: "Personalizados", slug: "personalizados", iconName: "gift" },
  { id: "2", name: "Infantil / Baby", slug: "infantil-baby", iconName: "baby" },
  { id: "3", name: "Masculino / Feminino", slug: "masculino-feminino", iconName: "shirt" },
  { id: "4", name: "Casa / Eletrônicos", slug: "casa-eletronicos", iconName: "home" },
  { id: "5", name: "Acessórios", slug: "acessorios", iconName: "sparkles" },
];

export function CategoryPill({
  category,
  isActive = false,
  className,
}: {
  category: CategoryItem;
  isActive?: boolean;
  className?: string;
}) {
  const Icon =
    category.iconName === "gift"
      ? Gift
      : category.iconName === "baby"
      ? Baby
      : category.iconName === "shirt"
      ? Shirt
      : category.iconName === "home"
      ? Home
      : Sparkles;

  return (
    <Link
      href={`/categoria/${category.slug}`}
      className={cn(
        "group flex flex-col items-center gap-2.5 text-center transition-transform duration-200 active:scale-95",
        className
      )}
    >
      <div
        className={cn(
          "flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-xs",
          isActive
            ? "border-primaria bg-primaria text-white shadow-md scale-105"
            : "border-borda bg-fundo-card text-texto-escuro group-hover:border-primaria group-hover:bg-primaria-soft group-hover:text-primaria group-hover:shadow-sm"
        )}
      >
        <Icon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[1.5] transition-transform duration-300 group-hover:scale-110" />
      </div>
      <span className="font-serif text-xs sm:text-sm font-semibold text-texto-escuro group-hover:text-primaria transition-colors">
        {category.name}
      </span>
    </Link>
  );
}

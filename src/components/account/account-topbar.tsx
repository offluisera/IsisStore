"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Heart,
  Sun,
  Moon,
  Menu,
  Store,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

interface AccountTopbarProps {
  onOpenMobile?: () => void;
  displayName: string;
  email?: string;
  favoritesCount?: number;
}

export function AccountTopbar({
  onOpenMobile,
  displayName,
  email,
  favoritesCount = 0,
}: AccountTopbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const firstName = displayName.split(" ")[0] || "Cliente";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IS";

  return (
    <header className="h-20 bg-white/90 dark:bg-[#1A1316]/95 backdrop-blur-md border-b border-[#F0E5E7] dark:border-[#38262C] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors select-none">
      {/* Lado Esquerdo: Trigger Mobile + Busca Global */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-texto-escuro dark:text-[#F8EFF1] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2A1F24] transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Formulário de Busca */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E787C] dark:text-[#A0888F]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O que você está procurando?"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[#FAF7F8] dark:bg-[#241A1E] hover:bg-[#F7F2F4] dark:hover:bg-[#2A1F24] focus:bg-white dark:focus:bg-[#1E1518] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/80 dark:placeholder:text-[#907A81] border border-[#F0E5E7] dark:border-[#3D2B32] focus:border-primaria focus:ring-2 focus:ring-primaria/15 outline-none transition-all"
          />
        </form>
      </div>

      {/* Lado Direito: Ações (Loja, Tema, Favoritos, Notificações, Perfil) */}
      <div className="flex items-center gap-2 sm:gap-3 pl-3">
        {/* Ir para a Loja */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-texto-medio dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] transition-colors"
        >
          <Store className="w-3.5 h-3.5 text-primaria" />
          <span>Ir para Loja</span>
        </Link>

        {/* Toggle Tema (Claro / Escuro) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#786467] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] border border-transparent hover:border-[#F0E5E7] dark:hover:border-[#38262C] transition-all"
          title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-primaria transition-transform duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-[#786467] transition-transform duration-200" />
          )}
        </button>

        {/* Favoritos */}
        <Link
          href="/conta/favoritos"
          className="w-9 h-9 rounded-xl flex items-center justify-center relative text-[#786467] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] border border-transparent hover:border-[#F0E5E7] dark:hover:border-[#38262C] transition-all"
          title="Meus Favoritos"
          aria-label="Ver meus produtos favoritos"
        >
          <Heart className="w-4 h-4" />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primaria text-[10px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-[#1A1316]">
              {favoritesCount}
            </span>
          )}
        </Link>

        {/* Divisor Vertical */}
        <div className="h-6 w-px bg-[#F0E5E7] dark:bg-[#38262C] hidden sm:block" />

        {/* Saudação e Perfil da Cliente */}
        <Link
          href="/conta/dados"
          className="flex items-center gap-3 p-1 rounded-xl hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] transition-colors group"
          title="Minha Conta"
        >
          {/* Avatar Circular com Gradiente Isis Store */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primaria to-secundaria text-white font-serif font-semibold text-xs flex items-center justify-center shadow-xs ring-2 ring-primaria/20 group-hover:ring-primaria/40 transition-all">
            {initials}
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-serif font-bold text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors leading-tight">
              Olá, {firstName}! ♡
            </span>
            <span className="text-[10px] font-medium text-texto-claro dark:text-[#9E858C] leading-tight mt-0.5">
              Seja muito bem-vinda de volta!
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

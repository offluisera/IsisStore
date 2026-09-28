"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  ShieldCheck,
  Store,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTopbarProps {
  onOpenMobile?: () => void;
  adminName?: string | null;
  adminEmail?: string | null;
}

export function AdminTopbar({
  onOpenMobile,
  adminName = "Fernanda Oliveira",
  adminEmail,
}: AdminTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Atalho global ⌘ K / Ctrl K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Iniciais do Administrador para Avatar
  const displayName = adminName || adminEmail?.split("@")[0] || "Fernanda Oliveira";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#F0E5E7] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-all select-none">
      {/* Lado Esquerdo: Trigger Mobile + Busca Global */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-texto-escuro hover:text-primaria hover:bg-fundo transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Campo de Busca Global */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E787C]">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por produtos, pedidos, clientes..."
            className="w-full pl-10 pr-16 py-2 rounded-xl text-xs bg-[#FAF7F8] hover:bg-[#F7F2F4] focus:bg-white text-texto-escuro placeholder:text-texto-claro/80 border border-[#F0E5E7] focus:border-primaria focus:ring-2 focus:ring-primaria/15 outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-texto-claro/80 bg-white border border-[#E8DCDE] rounded-md shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas + Notificações + Perfil Admin */}
      <div className="flex items-center gap-2 sm:gap-4 pl-3">
        {/* Toggle Tema (Claro / Escuro sutil) */}
        <button
          type="button"
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className="p-2 rounded-xl text-[#786467] hover:text-primaria hover:bg-[#FFF5F6] transition-colors"
          title="Alternar tema"
          aria-label="Alternar tema"
        >
          {isDarkTheme ? (
            <Moon className="w-4 h-4 text-primaria" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        {/* Central de Notificações com Badge */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "relative p-2 rounded-xl transition-colors",
              isNotificationsOpen
                ? "bg-[#FDF2F4] text-primaria"
                : "text-[#786467] hover:text-primaria hover:bg-[#FFF5F6]"
            )}
            aria-label="Notificações administrativas"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primaria text-[9px] font-bold text-white shadow-2xs ring-2 ring-white">
              3
            </span>
          </button>

          {/* Painel Dropdown de Notificações */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-88 rounded-2xl bg-white border border-[#F0E5E7] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1]">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-texto-escuro">
                    Notificações
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primaria/10 text-primaria">
                    3 novas
                  </span>
                </div>
                <Link
                  href="/admin/pedidos"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[11px] text-primaria hover:text-primaria-hover font-semibold transition-colors"
                >
                  Ver todas &rarr;
                </Link>
              </div>

              <div className="divide-y divide-[#F7EFF1] max-h-72 overflow-y-auto">
                {/* Item 1 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sucesso/10 text-sucesso flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-texto-escuro truncate">
                      Novo pedido #IS54872
                    </p>
                    <p className="text-[11px] text-texto-claro">
                      Cliente Maria Silva &bull; R$ 279,80
                    </p>
                    <span className="text-[10px] text-texto-claro/80">
                      12 min atrás
                    </span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primaria/10 text-primaria flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-texto-escuro truncate">
                      Pagamento aprovado
                    </p>
                    <p className="text-[11px] text-texto-claro">
                      Pedido #IS54871 &bull; R$ 159,90
                    </p>
                    <span className="text-[10px] text-texto-claro/80">
                      27 min atrás
                    </span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-alerta/15 text-alerta flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-texto-escuro truncate">
                      Produto com estoque baixo
                    </p>
                    <p className="text-[11px] text-texto-claro">
                      Headphone Bluetooth (3 unidades)
                    </p>
                    <span className="text-[10px] text-texto-claro/80">
                      1 hora atrás
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divisor Vertical */}
        <div className="h-6 w-px bg-[#F0E5E7] hidden sm:block" />

        {/* Perfil do Administrador Logado */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#FFF5F6] transition-colors group"
            aria-expanded={isProfileOpen}
            aria-label="Menu de perfil do administrador"
          >
            {/* Avatar Circular */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primaria to-secundaria text-white font-serif font-semibold text-xs flex items-center justify-center shadow-xs ring-2 ring-primaria/20 group-hover:ring-primaria/40 transition-all">
              {initials}
            </div>

            {/* Nome e Papel (Desktop) */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-texto-escuro group-hover:text-primaria transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] font-medium text-texto-claro uppercase tracking-wider">
                Administrador
              </span>
            </div>

            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#8E787C] group-hover:text-primaria transition-transform duration-150 hidden sm:block",
                isProfileOpen && "rotate-180 text-primaria"
              )}
            />
          </button>

          {/* Dropdown Menu do Usuário */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-[#F0E5E7] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#F7EFF1]">
                <p className="text-xs font-bold text-texto-escuro truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-texto-claro truncate">
                  {adminEmail || "admin@isisstore.com.br"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#6B5558] hover:text-primaria hover:bg-[#FFF5F6] rounded-xl transition-colors"
                >
                  <Store className="w-4 h-4 text-primaria" />
                  <span>Visualizar Loja</span>
                </Link>

                <Link
                  href="/admin/auditoria"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#6B5558] hover:text-primaria hover:bg-[#FFF5F6] rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-primaria" />
                  <span>Auditoria &amp; Logs</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#F7EFF1]">
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-erro hover:bg-erro/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Encerrar Sessão</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

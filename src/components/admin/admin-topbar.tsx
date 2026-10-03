"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ShoppingBag,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme/theme-context";
import {
  getAdminNotificationsAction,
  type AdminNotification,
} from "@/features/admin/actions";

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
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notificações reais da administração
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Carregar notificações ao montar
  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      setIsLoadingNotifications(true);
      try {
        const res = await getAdminNotificationsAction();
        if (isMounted && res.success) {
          setNotifications(res.notifications);
        }
      } catch {
        // Fallback silencioso mantendo estado anterior
      } finally {
        if (isMounted) setIsLoadingNotifications(false);
      }
    }
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleMarkAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const handleNotificationClick = (item: AdminNotification) => {
    setReadIds((prev) => new Set([...prev, item.id]));
    setIsNotificationsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  // Iniciais do Administrador para Avatar
  const displayName = adminName || adminEmail?.split("@")[0] || "Fernanda Oliveira";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-20 bg-white/90 dark:bg-[#1A1316]/95 backdrop-blur-md border-b border-[#F0E5E7] dark:border-[#38262C] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors select-none">
      {/* Lado Esquerdo: Trigger Mobile + Busca Global */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-texto-escuro dark:text-[#F8EFF1] hover:text-primaria hover:bg-fundo dark:hover:bg-[#2A1F24] transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Campo de Busca Global */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E787C] dark:text-[#A0888F]">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por produtos, pedidos, clientes..."
            className="w-full pl-10 pr-16 py-2 rounded-xl text-xs bg-[#FAF7F8] dark:bg-[#241A1E] hover:bg-[#F7F2F4] dark:hover:bg-[#2A1F24] focus:bg-white dark:focus:bg-[#1E1518] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/80 dark:placeholder:text-[#907A81] border border-[#F0E5E7] dark:border-[#3D2B32] focus:border-primaria focus:ring-2 focus:ring-primaria/15 outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-texto-claro/80 dark:text-[#B09AA2] bg-white dark:bg-[#2A1F24] border border-[#E8DCDE] dark:border-[#422F37] rounded-md shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas + Modo Noturno + Notificações + Perfil Admin */}
      <div className="flex items-center gap-2 sm:gap-3 pl-3">
        {/* Toggle Tema Oficial (Claro / Escuro) */}
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

        {/* Central de Notificações com Badge */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center relative transition-all border",
              isNotificationsOpen
                ? "bg-[#FDF2F4] dark:bg-[#352028] text-primaria border-primaria/30"
                : "text-[#786467] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] border-transparent hover:border-[#F0E5E7] dark:hover:border-[#38262C]"
            )}
            title="Notificações da loja"
            aria-label="Notificações administrativas"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primaria text-[10px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-[#1A1316] pointer-events-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Painel Dropdown de Notificações */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-92 rounded-2xl bg-white dark:bg-[#20171A] border border-[#F0E5E7] dark:border-[#38262C] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1] dark:border-[#302026]">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-texto-escuro dark:text-[#F8EFF1]">
                    Notificações
                  </span>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primaria/10 dark:bg-primaria/20 text-primaria">
                      {unreadCount} novas
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-texto-claro">
                      Lidas
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-texto-claro hover:text-primaria transition-colors flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" />
                      <span>Marcar lidas</span>
                    </button>
                  )}
                  <Link
                    href="/admin/pedidos"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[11px] text-primaria hover:text-primaria-hover font-semibold transition-colors"
                  >
                    Ver todas &rarr;
                  </Link>
                </div>
              </div>

              {/* Lista de Notificações */}
              <div className="divide-y divide-[#F7EFF1] dark:divide-[#302026] max-h-80 overflow-y-auto pt-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-texto-claro dark:text-[#907A81]">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isRead = readIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={cn(
                          "py-3 px-2 flex items-start gap-3 rounded-xl cursor-pointer transition-colors",
                          isRead
                            ? "opacity-60 hover:opacity-90 hover:bg-[#FAF7F8] dark:hover:bg-[#281D21]"
                            : "hover:bg-[#FDF2F4]/60 dark:hover:bg-[#2C1D23]"
                        )}
                      >
                        {/* Ícone Semântico */}
                        {item.type === "new_order" && (
                          <div className="w-8 h-8 rounded-full bg-sucesso/15 text-sucesso flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === "payment_approved" && (
                          <div className="w-8 h-8 rounded-full bg-primaria/15 text-primaria flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === "low_stock" && (
                          <div className="w-8 h-8 rounded-full bg-alerta/15 text-alerta flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === "audit" && (
                          <div className="w-8 h-8 rounded-full bg-info/15 text-info flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] truncate">
                              {item.title}
                            </p>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primaria shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-texto-medio dark:text-[#D1BFC4] truncate mt-0.5">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-texto-claro dark:text-[#8E787C] block mt-1">
                            {item.timeAgo}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divisor Vertical */}
        <div className="h-6 w-px bg-[#F0E5E7] dark:bg-[#38262C] hidden sm:block" />

        {/* Perfil do Administrador Logado */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] transition-colors group"
            aria-expanded={isProfileOpen}
            aria-label="Menu de perfil do administrador"
          >
            {/* Avatar Circular */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primaria to-secundaria text-white font-serif font-semibold text-xs flex items-center justify-center shadow-xs ring-2 ring-primaria/20 group-hover:ring-primaria/40 transition-all">
              {initials}
            </div>

            {/* Nome e Papel (Desktop) */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] font-medium text-texto-claro dark:text-[#9E858C] uppercase tracking-wider">
                Administrador
              </span>
            </div>

            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#8E787C] dark:text-[#9E858C] group-hover:text-primaria transition-transform duration-150 hidden sm:block",
                isProfileOpen && "rotate-180 text-primaria"
              )}
            />
          </button>

          {/* Dropdown Menu do Usuário */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-[#20171A] border border-[#F0E5E7] dark:border-[#38262C] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#F7EFF1] dark:border-[#302026]">
                <p className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-texto-claro dark:text-[#9E858C] truncate">
                  {adminEmail || "admin@isisstore.com.br"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#6B5558] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] rounded-xl transition-colors"
                >
                  <Store className="w-4 h-4 text-primaria" />
                  <span>Visualizar Loja</span>
                </Link>

                <Link
                  href="/admin/auditoria"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#6B5558] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2E1F25] rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-primaria" />
                  <span>Auditoria &amp; Logs</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#F7EFF1] dark:border-[#302026]">
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

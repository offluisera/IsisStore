"use client";

import { useState, useEffect } from "react";
import { AccountSidebar } from "./account-sidebar";
import { AccountTopbar } from "./account-topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface AccountShellProps {
  children: React.ReactNode;
  displayName: string;
  email?: string;
  isAdmin?: boolean;
  counts?: {
    orders?: number;
    favorites?: number;
    addresses?: number;
    coupons?: number;
  };
}

export function AccountShell({
  children,
  displayName,
  email,
  isAdmin = false,
  counts,
}: AccountShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Bloquear scroll do body quando drawer mobile estiver aberto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // Fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen flex bg-[#FFF5F6]/40 dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] selection:bg-secundaria selection:text-texto-escuro transition-colors">
      {/* 1. Sidebar Fixa Desktop (≥ 1024px) */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-30 shadow-xs">
        <AccountSidebar
          isAdmin={isAdmin}
          counts={counts}
        />
      </div>

      {/* 2. Drawer Mobile / Tablet (< 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-texto-escuro/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Painel Lateral Deslizante */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            <AccountSidebar
              isMobile={true}
              isAdmin={isAdmin}
              counts={counts}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Coluna Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar Superior */}
        <AccountTopbar
          onOpenMobile={() => setIsMobileOpen(true)}
          displayName={displayName}
          email={email}
          favoritesCount={counts?.favorites}
        />

        {/* Área Central / Páginas da Conta do Cliente */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>

        {/* 4. Barra de Navegação Inferior para Mobile */}
        <MobileBottomNav
          favoritesCount={counts?.favorites}
          ordersCount={counts?.orders}
        />
      </div>
    </div>
  );
}

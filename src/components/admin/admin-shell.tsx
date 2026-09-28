"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface AdminShellProps {
  children: React.ReactNode;
  adminName?: string | null;
  adminEmail?: string | null;
}

export function AdminShell({
  children,
  adminName,
  adminEmail,
}: AdminShellProps) {
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
    <div className="min-h-screen flex bg-[#FFF5F6]/40 text-texto-escuro selection:bg-secundaria selection:text-texto-escuro">
      {/* 1. Sidebar Fixa Desktop (≥ 1024px) */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-30 shadow-xs">
        <AdminSidebar />
      </div>

      {/* 2. Drawer Mobile / Tablet (< 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-texto-escuro/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Painel Lateral Deslizante */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            <AdminSidebar
              isMobile={true}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Coluna Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar Superior */}
        <AdminTopbar
          onOpenMobile={() => setIsMobileOpen(true)}
          adminName={adminName}
          adminEmail={adminEmail}
        />

        {/* Área Central / Páginas da Administração */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* Rodapé Oficial da Administração */}
        <footer className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#F0E5E7] text-xs text-[#8E787C] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-texto-escuro">Isis Store</span>
            <span>&bull;</span>
            <span>Painel Administrativo</span>
            <span>&bull;</span>
            <span className="text-[11px] font-mono">v1.0.0</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/auditoria"
              className="flex items-center gap-1.5 text-sucesso hover:text-primaria transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px]">Auditoria &amp; Proteção RLS Ativa</span>
            </Link>

            <span className="hidden sm:inline text-texto-claro/50">&bull;</span>

            <span className="inline-flex items-center gap-1 font-serif italic text-primaria text-[11px]">
              Mais que produtos, é sobre você!
              <Heart className="w-3 h-3 fill-primaria text-primaria" />
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

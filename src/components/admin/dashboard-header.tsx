"use client";

import { ReactNode } from "react";

interface DashboardHeaderProps {
  adminName?: string | null;
  actions?: ReactNode;
}

export function DashboardHeader({
  adminName = "Fernanda",
  actions,
}: DashboardHeaderProps) {
  const firstName = adminName ? adminName.split(" ")[0] : "Fernanda";

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-[#F0E5E7]/70 min-w-0 w-full">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 min-w-0 w-full">
        {/* Lado Esquerdo: Saudação e Título Principal */}
        <div className="space-y-1 shrink-0 max-w-md">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primaria bg-primaria/10 px-2.5 py-0.5 rounded-full">
              Painel de Controle
            </span>
            <span className="text-xs text-texto-claro flex items-center gap-1">
              <span>Bem-vinda de volta, {firstName}!</span>
              <span role="img" aria-label="Aceno de mão">👋</span>
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-texto-escuro">
            Painel Administrativo
          </h1>

          <p className="text-xs sm:text-sm text-texto-claro max-w-sm">
            Aqui você gerencia sua loja de forma simples e eficiente.
          </p>
        </div>

        {/* Lado Direito: Ações Rápidas - 100% responsivo sem estourar margem */}
        {actions && (
          <div className="w-full xl:flex-1 xl:max-w-2xl 2xl:max-w-3xl min-w-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

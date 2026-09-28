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
    <div className="flex flex-col gap-4 pb-6 border-b border-[#F0E5E7]/70">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Lado Esquerdo: Saudação e Título Principal */}
        <div className="space-y-1 shrink-0">
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

        {/* Lado Direito: Ações Rápidas com espaço amplo sem truncamento */}
        {actions && (
          <div className="w-full lg:max-w-2xl xl:max-w-3xl lg:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

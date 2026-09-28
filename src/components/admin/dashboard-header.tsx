"use client";

import { useState, useEffect } from "react";
import { Calendar, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  adminName?: string | null;
  lastSyncIso?: string;
}

export function DashboardHeader({
  adminName = "Fernanda",
  lastSyncIso,
}: DashboardHeaderProps) {
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    // Exemplo: "12 de abril de 2025"
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const timeStr = lastSyncIso
      ? new Date(lastSyncIso).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

    setCurrentDateFormatted(`Hoje, ${dateStr}`);
    setCurrentTimeFormatted(timeStr);
  }, [lastSyncIso]);

  const firstName = adminName ? adminName.split(" ")[0] : "Fernanda";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F0E5E7]/70">
      {/* Lado Esquerdo: Saudação e Título Principal */}
      <div className="space-y-1">
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

        <p className="text-xs sm:text-sm text-texto-claro max-w-xl">
          Aqui você gerencia sua loja de forma simples e eficiente.
        </p>
      </div>

      {/* Lado Direito: Widget Dinâmico de Calendário & Afeto de Marca */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="bg-white border border-[#F0E5E7] rounded-2xl p-3.5 sm:px-4 sm:py-3 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-texto-escuro">
              {currentDateFormatted || "Hoje"}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-texto-claro">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-primaria animate-spin-reverse" />
                <span>Atualizado: {currentTimeFormatted || "Agora"}</span>
              </span>
            </div>
            <span className="font-serif italic text-[11px] text-primaria font-medium mt-0.5">
              Juntos fazemos o Isis crescer! ♡
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

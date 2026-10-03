"use client";

import * as React from "react";
import { Download, Shield, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportUserDataAction } from "@/features/account/actions";

export function PrivacyDataCard() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [downloadReady, setDownloadReady] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setDownloadReady(false);

    try {
      const result = await exportUserDataAction();
      if (result.success && result.data) {
        // Criar arquivo para download no navegador
        const blob = new Blob([result.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `isis-store-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadReady(true);
        setTimeout(() => setDownloadReady(false), 4000);
      }
    } catch (err) {
      console.error("Erro ao exportar dados:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] p-6 sm:p-8 shadow-xs max-w-2xl transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-primaria-soft dark:bg-[#381F27] text-primaria flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Privacidade & Seus Dados (LGPD)
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-0.5 leading-relaxed">
            Na Isis Store respeitamos rigorosamente a sua privacidade. Você pode baixar uma cópia
            completa de todos os seus dados cadastrais, pedidos e endereços a qualquer momento.
          </p>

          <div className="mt-4 pt-4 border-t border-borda dark:border-[#332228] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-texto-claro dark:text-[#A89299] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-primaria" />
              <span>Arquivo seguro em formato JSON</span>
            </div>

            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] hover:bg-primaria-soft dark:hover:bg-[#251A1E] self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-primaria" />
              <span>{isExporting ? "Gerando arquivo..." : downloadReady ? "Arquivo Baixado!" : "Baixar Meus Dados"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

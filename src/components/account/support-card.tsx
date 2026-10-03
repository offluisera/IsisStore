import Link from "next/link";
import { Headphones } from "lucide-react";

export function SupportCard() {
  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs select-none">
      {/* Cabeçalho */}
      <div className="pb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <h3 className="font-serif font-bold text-sm sm:text-base text-texto-escuro dark:text-[#F8EFF1]">
          Suporte
        </h3>
      </div>

      <div className="pt-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0 mt-0.5">
            <Headphones className="w-4 h-4" />
          </div>

          <div>
            <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Precisa de ajuda?
            </p>
            <p className="text-[11px] text-texto-claro dark:text-[#A89299] mt-0.5 leading-snug">
              Nossa equipe está pronta para te atender com carinho e agilidade.
            </p>
          </div>
        </div>

        <Link
          href="/conta/suporte"
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-center border border-primaria/30 text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23] transition-colors block mt-2"
        >
          Falar com o suporte &rarr;
        </Link>
      </div>
    </div>
  );
}

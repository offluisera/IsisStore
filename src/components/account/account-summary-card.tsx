import Link from "next/link";
import { Crown, Ticket, ArrowRight } from "lucide-react";

interface AccountSummaryCardProps {
  totalSpentCents?: number;
  ordersCount?: number;
}

export function AccountSummaryCard({
  totalSpentCents = 0,
  ordersCount = 0,
}: AccountSummaryCardProps) {
  // Cálculo do nível da cliente (Bronze, Prata, Ouro) baseado em faturamento
  const nextTierGoalCents = 50000; // R$ 500,00 para nível Ouro
  const remainingCents = Math.max(nextTierGoalCents - totalSpentCents, 0);
  const progressPercentage = Math.min(
    Math.round((totalSpentCents / nextTierGoalCents) * 100),
    100
  );

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const tier = totalSpentCents >= nextTierGoalCents ? "Ouro" : "Prata";

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <h3 className="font-serif font-bold text-sm sm:text-base text-texto-escuro dark:text-[#F8EFF1]">
          Resumo da conta
        </h3>
        <span className="w-2 h-2 rounded-full bg-primaria animate-pulse" />
      </div>

      <div className="pt-4 space-y-4">
        {/* Nível do Cliente */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-texto-claro dark:text-[#A89299]">
              Nível da cliente
            </span>
            <span className="text-amber-500 font-serif font-bold text-xs flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{tier}</span>
            </span>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-2 h-2 bg-[#F7EFF1] dark:bg-[#2C1D23] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primaria via-secundaria to-primaria rounded-full transition-all duration-700"
              style={{ width: `${Math.max(progressPercentage, 12)}%` }}
            />
          </div>

          <p className="text-[10px] text-texto-claro dark:text-[#A89299] mt-1.5 leading-tight">
            {remainingCents > 0
              ? `Faltam ${formatPrice(remainingCents)} para o próximo nível.`
              : "Parabéns! Você atingiu o nível máximo de benefícios exclusivos."}
          </p>
        </div>

        {/* Saldo de Cupons */}
        <Link
          href="/conta/cupons"
          className="flex items-center justify-between p-3 rounded-xl bg-[#FFF5F6] dark:bg-[#251A1E] border border-secundaria/30 dark:border-[#422932] group hover:border-primaria transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-texto-claro dark:text-[#A89299]">
                Cupons disponíveis
              </p>
              <p className="font-serif font-bold text-xs text-primaria">
                3 cupons ativos
              </p>
            </div>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-primaria group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Botão Ver Meus Cupons */}
        <Link
          href="/conta/cupons"
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center text-white bg-primaria hover:bg-primaria-hover transition-colors shadow-2xs block active:scale-98"
        >
          Ver meus cupons &rarr;
        </Link>
      </div>
    </div>
  );
}

import { Sparkles, Heart, CheckCircle2 } from "lucide-react";

export function DailyTipCard() {
  return (
    <div className="bg-gradient-to-br from-[#FFF5F6] via-[#FFF9FA] to-white border border-[#F9C7D4]/70 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden select-none flex flex-col justify-between h-full">
      {/* Detalhe de fundo decorativo sutil */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-primaria/5 blur-xl pointer-events-none" />
      <Heart className="absolute -bottom-2 -right-2 w-20 h-20 text-primaria/[0.04] -rotate-12 pointer-events-none" />

      {/* Cabeçalho do Card Editorial */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#F9C7D4] text-[11px] font-bold text-primaria shadow-2xs">
            <Sparkles className="w-3 h-3 text-primaria" />
            <span>Dica do dia</span>
          </span>

          <span className="text-[10px] font-serif text-texto-claro italic">
            Isis Store Insights
          </span>
        </div>

        {/* Conteúdo Editorial Principal */}
        <div className="space-y-2 py-1">
          <h3 className="font-serif font-bold text-base sm:text-lg text-texto-escuro leading-snug">
            Mantenha seus produtos em destaque com boas imagens e descrições!
          </h3>
          <p className="text-xs text-texto-claro leading-relaxed">
            Fotos nítidas com boa iluminação e detalhes claros aumentam a confiança das clientes e elevam a conversão da sua loja em até 35%.
          </p>
        </div>

        {/* Lista de Boas Práticas Recomendadas */}
        <div className="mt-4 pt-3 border-t border-[#F9C7D4]/30 space-y-2.5">
          <div className="flex items-start gap-2 text-xs text-texto-escuro">
            <CheckCircle2 className="w-3.5 h-3.5 text-primaria shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px]">
              Cadastre pelo menos 3 imagens em ângulos diferentes com boa iluminação.
            </span>
          </div>
          <div className="flex items-start gap-2 text-xs text-texto-escuro">
            <CheckCircle2 className="w-3.5 h-3.5 text-primaria shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px]">
              Especifique materiais, dimensões e cuidados da peça para reduzir devoluções.
            </span>
          </div>
          <div className="flex items-start gap-2 text-xs text-texto-escuro">
            <CheckCircle2 className="w-3.5 h-3.5 text-primaria shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px]">
              Notifique a cliente rapidamente com código de rastreamento no despacho.
            </span>
          </div>
        </div>
      </div>

      {/* Rodapé com Assinatura */}
      <div className="pt-4 mt-4 border-t border-[#F9C7D4]/40 flex items-center justify-between text-xs">
        <span className="font-medium text-primaria text-[11px]">
          Mais que produtos, é sobre você!
        </span>
        <span className="text-primaria font-serif">♡</span>
      </div>
    </div>
  );
}

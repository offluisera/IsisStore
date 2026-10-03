"use client";

import { useState } from "react";
import Link from "next/link";
import { Ticket, Copy, Check, Sparkles, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface Coupon {
  code: string;
  discount: string;
  description: string;
  minAmount?: string;
  expiresAt: string;
  isHighlight?: boolean;
}

const COUPONS: Coupon[] = [
  {
    code: "BEMVINDA10",
    discount: "10% OFF",
    description: "Desconto especial de boas-vindas na sua primeira compra na loja.",
    minAmount: "Sem valor mínimo",
    expiresAt: "Válido por 30 dias",
    isHighlight: true,
  },
  {
    code: "FRETEGRATIS",
    discount: "Frete Cortesia",
    description: "Frete grátis para todo o Brasil em compras acima de R$ 199,00.",
    minAmount: "Compras a partir de R$ 199,00",
    expiresAt: "Tempo limitado",
  },
  {
    code: "ISISVIP5",
    discount: "5% OFF",
    description: "Desconto exclusivo para clientes cadastradas em qualquer categoria.",
    minAmount: "Compras a partir de R$ 120,00",
    expiresAt: "Válido até o fim do mês",
  },
];

export default function CuponsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0E5E7] dark:border-[#38262C]">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primaria" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Meus Cupons &amp; Benefícios
            </h1>
          </div>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-1">
            Aproveite descontos especiais e vantagens exclusivas reservadas para sua conta.
          </p>
        </div>

        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primaria hover:text-primaria-hover transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Ir às compras</span>
        </Link>
      </div>

      {/* Grid de Cupons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COUPONS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;

          return (
            <div
              key={coupon.code}
              className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {coupon.isHighlight && (
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-primaria/10 dark:bg-primaria/20 rounded-full blur-xl pointer-events-none" />
              )}

              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
                  <span className="text-base sm:text-lg font-serif font-bold text-primaria">
                    {coupon.discount}
                  </span>
                  {coupon.isHighlight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primaria bg-primaria/10 dark:bg-primaria/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      <span>Destaque</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-texto-escuro dark:text-[#F8EFF1] leading-relaxed mb-3">
                  {coupon.description}
                </p>

                <div className="space-y-1 text-[11px] text-texto-claro dark:text-[#A89299]">
                  {coupon.minAmount && <p>&bull; {coupon.minAmount}</p>}
                  <p>&bull; {coupon.expiresAt}</p>
                </div>
              </div>

              {/* Botão de Código com Cópia Rápida */}
              <div className="mt-5 pt-4 border-t border-[#F7EFF1] dark:border-[#2C1D23] flex items-center justify-between gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F8] dark:bg-[#251A1E] border border-dashed border-primaria/40 font-mono font-bold text-xs text-primaria tracking-wider">
                  {coupon.code}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(coupon.code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-primaria hover:bg-primaria-hover transition-colors shadow-2xs"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informativo de Uso */}
      <div className="bg-[#FFF5F6] dark:bg-[#24171C] rounded-2xl border border-secundaria/40 dark:border-[#422932] p-5 text-xs text-texto-escuro dark:text-[#F8EFF1] space-y-2">
        <p className="font-bold flex items-center gap-1.5 text-primaria">
          <Sparkles className="w-4 h-4" />
          Como aplicar seus cupons
        </p>
        <p className="text-[11px] text-texto-medio dark:text-[#C2B0B4] leading-relaxed">
          Copie o código desejado e cole no campo de cupom na tela de finalização do carrinho (checkout). Os descontos são calculados automaticamente sobre o subtotal dos produtos participantes.
        </p>
      </div>
    </div>
  );
}

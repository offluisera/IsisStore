import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";

interface AccountHeroProps {
  displayName: string;
}

export function AccountHero({ displayName }: AccountHeroProps) {
  const firstName = displayName.split(" ")[0] || "Cliente";
  const isFemale = !firstName.toLowerCase().endsWith("o") && !firstName.toLowerCase().endsWith("s");
  const greeting = isFemale ? `Bem-vinda, ${firstName}! ♡` : `Bem-vindo, ${firstName}! ♡`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FDEEF1] via-[#FDF5F6] to-[#FCEEF1] dark:from-[#28181E] dark:via-[#201418] dark:to-[#26161C] border border-secundaria/50 dark:border-[#422932] p-6 sm:p-8 shadow-xs select-none">
      {/* Detalhes decorativos de fundo */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-primaria/10 dark:bg-primaria/15 blur-2xl pointer-events-none" />
      <Heart className="absolute top-4 right-12 w-8 h-8 text-primaria/15 -rotate-12 pointer-events-none" />
      <Heart className="absolute bottom-4 right-52 w-6 h-6 text-primaria/10 rotate-12 pointer-events-none hidden sm:block" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Lado Esquerdo: Mensagem e Ação */}
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#1E1518]/80 border border-primaria/20 shadow-2xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-primaria animate-pulse" />
            <span className="text-[11px] font-semibold text-primaria uppercase tracking-wider">
              Área Exclusiva da Cliente
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1] leading-tight">
            {greeting}
          </h1>

          <p className="text-xs sm:text-sm text-texto-medio dark:text-[#D1BFC4] leading-relaxed">
            Aqui você acompanha o andamento dos seus pedidos, gerencia seus endereços cadastrados, consulta cupons exclusivos e muito mais.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/conta/pedidos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primaria hover:bg-primaria-hover text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all group active:scale-98"
            >
              <span>Ver meus pedidos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/produtos"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#251A1E] hover:bg-white dark:hover:bg-[#2C1D23] border border-[#F0E5E7] dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] text-xs font-semibold transition-all shadow-2xs"
            >
              <span>Explorar catálogo</span>
            </Link>
          </div>
        </div>

        {/* Lado Direito: Composição Fotográfica de Produtos Isis Store conforme cliente.png */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 relative">
          <div className="flex flex-col items-end text-right pr-2">
            <span className="font-serif italic text-xs text-primaria font-semibold leading-tight">
              Obrigada por fazer
            </span>
            <span className="font-serif italic text-xs text-primaria font-semibold leading-tight">
              parte dessa história! ♡
            </span>
          </div>

          {/* Miniatura Urso */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-[#302026] shadow-md transform -rotate-3 hover:rotate-0 transition-transform">
            <Image
              src="/images/products/ursinho-de-pelucia-carinho.jpg"
              alt="Mimos Isis Store"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          {/* Miniatura Headphone */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-[#302026] shadow-lg transform rotate-3 hover:rotate-0 transition-transform z-10">
            <Image
              src="/images/products/headphone-bluetooth-rosa-soft.jpg"
              alt="Produtos Isis Store"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>

          {/* Miniatura Mochila */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-[#302026] shadow-md transform -rotate-6 hover:rotate-0 transition-transform hidden xl:block">
            <Image
              src="/images/products/mochila-feminina-elegante.jpg"
              alt="Acessórios Isis Store"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

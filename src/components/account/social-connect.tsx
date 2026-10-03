import { Heart, MessageCircle, Globe } from "lucide-react";

export function SocialConnect() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#FFF5F6] via-white to-[#FFF5F6] dark:from-[#22161A] dark:via-[#1A1215] dark:to-[#22161A] border border-[#F0E5E7] dark:border-[#38262C] p-6 text-center select-none shadow-xs space-y-4">
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-center gap-1.5">
          <span>Conecte-se com a gente!</span>
          <Heart className="w-4 h-4 text-primaria fill-primaria" />
        </h3>
        <p className="text-xs text-texto-claro dark:text-[#A89299]">
          Siga nossas redes sociais e fique por dentro de lançamentos exclusivos, tendências e mimos especiais.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-white dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#332228] text-primaria hover:bg-primaria hover:text-white transition-all shadow-2xs flex items-center justify-center hover:scale-105"
          aria-label="Instagram da Isis Store"
        >
          <svg
            className="w-4 h-4 fill-none stroke-currentColor stroke-2 stroke-linecap-round stroke-linejoin-round"
            viewBox="0 0 24 24"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-white dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#332228] text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs flex items-center justify-center hover:scale-105"
          aria-label="WhatsApp da Isis Store"
        >
          <MessageCircle className="w-4 h-4" />
        </a>

        {/* Site Oficial */}
        <a
          href="/"
          className="w-10 h-10 rounded-full bg-white dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] hover:bg-primaria hover:text-white transition-all shadow-2xs flex items-center justify-center hover:scale-105"
          aria-label="Loja Virtual"
        >
          <Globe className="w-4 h-4" />
        </a>
      </div>

      <div className="pt-2 text-[11px] font-serif italic text-primaria">
        Do seu jeito, com muito amor! ♡
      </div>
    </div>
  );
}

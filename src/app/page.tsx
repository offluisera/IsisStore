import { Sparkles, ShieldCheck, Palette, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16">
      {/* Top Bar / Header inicial */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-borda-suave">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-texto-escuro">
            Isis Store
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primaria-soft text-primaria font-medium border border-primaria-border">
            Fase 01 — Fundação
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-texto-medio">
          <span className="inline-flex items-center gap-1.5 font-medium text-sucesso">
            <span className="h-2 w-2 rounded-full bg-sucesso animate-pulse" />
            Base Técnica Ativa
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primaria-soft text-primaria text-xs font-semibold uppercase tracking-wider mb-6 border border-primaria-border">
          <Sparkles className="w-3.5 h-3.5" />
          E-commerce Feminino & Presenteável
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-texto-escuro font-normal tracking-tight max-w-3xl leading-[1.15]">
          Delicadeza, afeto e elegância em cada detalhe.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-texto-medio max-w-2xl font-normal leading-relaxed">
          Fundação arquitetural do projeto Isis Store configurada com sucesso. Next.js App Router, TypeScript, Tailwind CSS, design tokens e tipografia oficial prontos para a fase de Design System.
        </p>

        {/* Pilares da Fundação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-12 text-left">
          <div className="p-6 rounded-2xl bg-fundo-card border border-borda shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-4">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-lg font-bold text-texto-escuro mb-1">
              Design Tokens
            </h2>
            <p className="text-xs sm:text-sm text-texto-claro leading-relaxed">
              Paleta oficial aplicada via variáveis CSS com contraste verificado e suporte a acessibilidade.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-fundo-card border border-borda shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-lg font-bold text-texto-escuro mb-1">
              Segurança & Rigor
            </h2>
            <p className="text-xs sm:text-sm text-texto-claro leading-relaxed">
              Diretrizes de RLS, idempotência financeira e proteção de segredos arquitetadas desde o início.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-fundo-card border border-borda shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-lg font-bold text-texto-escuro mb-1">
              Storefront Real
            </h2>
            <p className="text-xs sm:text-sm text-texto-claro leading-relaxed">
              Arquitetura pronta para receber catálogo de produtos, carrinho persistido e checkout Mercado Pago.
            </p>
          </div>
        </div>
      </main>

      {/* Footer inicial */}
      <footer className="w-full max-w-5xl mx-auto py-6 border-t border-borda-suave flex flex-col sm:flex-row items-center justify-between text-xs text-texto-claro gap-3">
        <p>© 2026 Isis Store. Todos os direitos reservados.</p>
        <p className="font-mono">Next.js 16 • React 19 • Tailwind CSS 4 • TypeScript</p>
      </footer>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Scale,
  ArrowRight,
} from "lucide-react";
import {
  getStoreSettings,
  DEFAULT_TERMS_PAGE_SETTINGS,
} from "@/lib/settings/store-settings";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso — Isis Store",
  description:
    "Termos e Condições Gerais de Uso e Compra da Isis Store. Políticas de compra, envio, garantia de semijoias e devolução conforme o Código de Defesa do Consumidor.",
};

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const terms = settings.terms_page_settings || DEFAULT_TERMS_PAGE_SETTINGS;
  const storeName = settings.store_name || "Isis Store";

  const sections =
    terms.sections && terms.sections.length > 0
      ? terms.sections
      : DEFAULT_TERMS_PAGE_SETTINGS.sections;

  return (
    <div className="min-h-screen bg-fundo/40 dark:bg-[#140D10] text-texto-escuro dark:text-[#F8EFF1] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#A89299]"
        >
          <Link href="/" className="hover:text-primaria transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-texto-escuro dark:text-white">
            {terms.hero_title || "Termos de Uso"}
          </span>
        </nav>

        {/* Header Editorial */}
        <div className="space-y-3 border-b border-borda-suave dark:border-[#38262C] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaria/10 dark:bg-primaria/20 text-primaria text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>{terms.hero_badge || "Transparência & Conformidade Legal"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1]">
            {terms.hero_title || "Termos e Condições de Uso"}
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro dark:text-[#A89299]">
            {terms.last_updated_text || "Última atualização: Outubro de 2026 • Versão 2.0"}
          </p>
        </div>

        {/* Card Destaque CDC */}
        <div className="rounded-3xl border border-primaria/20 bg-gradient-to-r from-primaria/10 via-white to-primaria/5 dark:from-[#25171D] dark:via-[#1A1215] dark:to-[#22161A] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primaria text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
              {terms.cdc_banner_title || "Compromisso com o Código de Defesa do Consumidor"}
            </h3>
            <p className="text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
              {terms.cdc_banner_text ||
                `Todas as relações de compra e venda realizadas na ${storeName} são regidas pela Lei Federal nº 8.078/1990 (CDC). Garantimos transparência absoluta em preços, prazos, política de trocas e direito de arrependimento em até 7 dias corridos sem qualquer encargo.`}
            </p>
          </div>
        </div>

        {/* Conteúdo dos Termos com Seções Estruturadas Dinâmicas */}
        <div className="bg-white dark:bg-[#1A1215] rounded-3xl border border-borda-suave dark:border-[#38262C] p-6 sm:p-10 shadow-xs space-y-10 text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
          {sections.map((sec, idx) => (
            <section key={sec.id || idx} id={sec.id} className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{sec.title}</span>
              </h2>

              {sec.highlight && (
                <div className="p-4 rounded-2xl bg-fundo dark:bg-[#201518] border border-borda-suave dark:border-[#38262C] space-y-1">
                  <p className="font-semibold text-primaria">
                    {sec.highlight}
                  </p>
                </div>
              )}

              <div className="space-y-2 whitespace-pre-line">
                {sec.content}
              </div>
            </section>
          ))}
        </div>

        {/* Rodapé da Página com CTA de Dúvidas */}
        <div className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1A1215] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1]">
              Ficou com alguma dúvida sobre nossos termos?
            </h4>
            <p className="text-xs text-texto-claro dark:text-[#A89299]">
              Nossa equipe de suporte está pronta para te explicar cada detalhe.
            </p>
          </div>

          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primaria text-white text-xs font-bold hover:bg-primaria/90 transition-all shadow-xs"
          >
            <span>Falar com o Atendimento</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}


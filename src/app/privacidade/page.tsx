import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import {
  getStoreSettings,
  DEFAULT_PRIVACY_PAGE_SETTINGS,
} from "@/lib/settings/store-settings";

export const metadata: Metadata = {
  title: "Política de Privacidade & Proteção de Dados (LGPD) — Isis Store",
  description:
    "Saiba como a Isis Store protege, armazena e respeita seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).",
};

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const privacy = settings.privacy_page_settings || DEFAULT_PRIVACY_PAGE_SETTINGS;
  const storeName = settings.store_name || "Isis Store";
  const dpoEmail = privacy.dpo_email || settings.support_email || "contato@isisstore.com.br";

  const sections =
    privacy.sections && privacy.sections.length > 0
      ? privacy.sections
      : DEFAULT_PRIVACY_PAGE_SETTINGS.sections;

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
            {privacy.hero_title || "Política de Privacidade"}
          </span>
        </nav>

        {/* Header Editorial */}
        <div className="space-y-3 border-b border-borda-suave dark:border-[#38262C] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>{privacy.hero_badge || "Conformidade com a LGPD (Lei 13.709/2018)"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1]">
            {privacy.hero_title || "Política de Privacidade & Dados"}
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro dark:text-[#A89299]">
            {privacy.last_updated_text || "Última atualização: Outubro de 2026 • Versão 2.0"}
          </p>
        </div>

        {/* Card Destaque LGPD */}
        <div className="rounded-3xl border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/30 dark:from-[#1A261D] dark:via-[#1A1215] dark:to-[#172019] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
              {privacy.lgpd_banner_title || "Sua Privacidade é Sagrada para Nós"}
            </h3>
            <p className="text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
              {privacy.lgpd_banner_text ||
                `Na ${storeName}, tratamos suas informações com o mesmo carinho e cuidado que dedicamos à seleção das nossas semijoias. Seus dados nunca são comercializados, alugados ou compartilhados com terceiros para fins publicitários não autorizados.`}
            </p>
          </div>
        </div>

        {/* Conteúdo com Seções Detalhadas Dinâmicas */}
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
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {sec.highlight}
                  </p>
                </div>
              )}

              <div className="space-y-2 whitespace-pre-line">
                {sec.content}
              </div>
            </section>
          ))}

          {/* Seção DPO / Encarregado */}
          <section id="dpo" className="space-y-3 pt-4 border-t border-borda-suave/50 dark:border-[#2E1E24]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-sans font-bold flex items-center justify-center">
                DPO
              </span>
              <span>{privacy.dpo_name || "Encarregado de Proteção de Dados (DPO)"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3]">
              {privacy.dpo_role || "Canal oficial para atendimento a titulares e solicitações LGPD"}
            </p>
            <div className="p-4 rounded-2xl bg-primaria/5 dark:bg-primaria/10 border border-primaria/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-primaria shrink-0" />
                <span className="font-bold text-texto-escuro dark:text-white break-all">
                  {dpoEmail}
                </span>
              </div>
              <Link
                href={`mailto:${dpoEmail}?subject=Solicitacao%20LGPD%20-%20Titular%20de%20Dados`}
                className="text-xs font-bold text-primaria hover:underline"
              >
                Enviar Requisição LGPD →
              </Link>
            </div>
          </section>
        </div>

        {/* Rodapé da Página com CTA */}
        <div className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1A1215] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1]">
              Dúvidas sobre o tratamento dos seus dados?
            </h4>
            <p className="text-xs text-texto-claro dark:text-[#A89299]">
              Estamos à total disposição para garantir sua tranquilidade e segurança.
            </p>
          </div>

          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primaria text-white text-xs font-bold hover:bg-primaria/90 transition-all shadow-xs"
          >
            <span>Falar com o Suporte</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

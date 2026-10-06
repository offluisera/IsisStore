import { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Clock,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import {
  getStoreSettings,
  DEFAULT_CONTACT_PAGE_SETTINGS,
} from "@/lib/settings/store-settings";
import { ContactForm } from "@/components/commerce/contact-form";

export const metadata: Metadata = {
  title: "Fale Conosco & Atendimento — Isis Store",
  description:
    "Entre em contato com a equipe Isis Store. Atendimento humanizado via WhatsApp, e-mail e canais oficiais para dúvidas, pedidos e trocas.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const contact = settings.contact_page_settings || DEFAULT_CONTACT_PAGE_SETTINGS;

  const rawPhone = contact.whatsapp_number || settings.support_phone || "(17) 99249-5308";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const supportEmail = contact.email_address || settings.support_email || "contato@isisstore.com.br";
  const supportHours =
    contact.hours_text ||
    settings.support_hours ||
    "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h";

  return (
    <div className="min-h-screen bg-fundo/40 dark:bg-[#140D10] text-texto-escuro dark:text-[#F8EFF1] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#A89299]"
        >
          <Link
            href="/"
            className="hover:text-primaria transition-colors"
          >
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-texto-escuro dark:text-white">
            {contact.hero_title || "Fale Conosco"}
          </span>
        </nav>

        {/* Hero Editorial */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaria/10 dark:bg-primaria/20 text-primaria text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{contact.hero_badge || "Estamos Aqui por Você"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1]">
            {contact.hero_title || "Fale Conosco"}
          </h1>
          <p className="text-sm sm:text-base text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
            {contact.hero_description ||
              "Dúvidas sobre semijoias, medidas, status do seu pedido ou trocas? Nossa equipe está sempre pronta para te acolher e ajudar com todo o carinho."}
          </p>
        </div>

        {/* Grade de Canais Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Canal WhatsApp */}
          <div className="rounded-3xl border border-emerald-100 dark:border-emerald-950/40 bg-white dark:bg-[#1C1417] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1]">
                {contact.whatsapp_title || "WhatsApp Oficial"}
              </h3>
              <p className="text-xs text-texto-claro dark:text-[#A89299] leading-relaxed">
                {contact.whatsapp_description ||
                  "Atendimento rápido para dúvidas sobre compras e pedidos."}
              </p>
            </div>

            <div className="pt-4">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{contact.whatsapp_button_text || "Chamar no WhatsApp"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Canal E-mail */}
          <div className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primaria/10 border border-primaria/20 text-primaria flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1]">
                {contact.email_title || "E-mail de Suporte"}
              </h3>
              <p className="text-xs text-texto-claro dark:text-[#A89299] leading-relaxed">
                {contact.email_description ||
                  "Para assuntos formais, trocas, parcerias e pós-venda."}
              </p>
            </div>

            <div className="pt-4">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-primaria hover:underline break-all"
              >
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>

          {/* Horário de Atendimento */}
          <div className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1]">
                {contact.hours_title || "Horário de Atendimento"}
              </h3>
              <p className="text-xs text-texto-claro dark:text-[#A89299] leading-relaxed">
                {supportHours}
              </p>
            </div>

            <div className="pt-4 text-[11px] text-texto-claro dark:text-[#8E797F]">
              {contact.hours_description ||
                "Mensagens fora do horário são respondidas no próximo dia útil."}
            </div>
          </div>

          {/* Garantia & Segurança */}
          <div className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-texto-escuro dark:text-[#F8EFF1]">
                {contact.guarantee_title || "Segurança & Garantia"}
              </h3>
              <p className="text-xs text-texto-claro dark:text-[#A89299] leading-relaxed">
                {contact.guarantee_description ||
                  "Todas as nossas semijoias possuem certificado de qualidade e garantia de banho."}
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/termos#garantia"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-texto-escuro dark:text-[#E8DCE0] hover:text-primaria transition-colors"
              >
                <span>Ver Termos de Garantia</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Formulário & Dúvidas Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulário Interativo */}
          <div className="lg:col-span-7">
            <ContactForm supportPhone={rawPhone} />
          </div>

          {/* FAQ e Informações Adicionais */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1A1215] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primaria" />
                <h3 className="font-serif font-bold text-lg text-texto-escuro dark:text-[#F8EFF1]">
                  {contact.faq_title || "Perguntas Frequentes"}
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {(contact.faq_items && contact.faq_items.length > 0
                  ? contact.faq_items
                  : DEFAULT_CONTACT_PAGE_SETTINGS.faq_items
                ).map((item, idx, arr) => (
                  <div
                    key={item.id || idx}
                    className={`${
                      idx < arr.length - 1
                        ? "border-b border-borda-suave/60 dark:border-[#2C1D22] pb-3"
                        : ""
                    } space-y-1`}
                  >
                    <h4 className="font-semibold text-texto-escuro dark:text-white">
                      {item.question}
                    </h4>
                    <p className="text-texto-claro dark:text-[#A89299] leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Caixa institucional */}
            <div className="rounded-3xl border border-primaria/15 bg-gradient-to-br from-primaria/5 to-transparent dark:from-primaria/10 dark:to-transparent p-6 text-center space-y-2">
              <h4 className="font-serif font-bold text-sm text-texto-escuro dark:text-[#F8EFF1]">
                {settings.store_name || "Isis Store"}
              </h4>
              <p className="text-xs text-texto-claro dark:text-[#A89299]">
                {settings.store_tagline || "Semijoias e Acessórios com Afeto"}
              </p>
              {settings.cnpj && (
                <p className="text-[11px] text-texto-claro/80 dark:text-[#7A676C]">
                  CNPJ: {settings.cnpj}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


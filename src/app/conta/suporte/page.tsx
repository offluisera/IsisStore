import Link from "next/link";
import {
  Headphones,
  MessageCircle,
  Mail,
  Clock,
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const FAQS = [
  {
    q: "Como faço para rastrear o meu pedido?",
    a: "Assim que o seu pedido for faturado e postado, você receberá o código de rastreamento no seu e-mail cadastrado e também poderá acompanhar diretamente na aba 'Meus Pedidos' da sua conta.",
    icon: Truck,
  },
  {
    q: "Quais cuidados devo ter com as minhas peças?",
    a: "Evite contato direto com perfumes, cremes, água do mar e produtos de limpeza. Guarde cada peça individualmente em local seco para preservar o brilho e acabamento impecável.",
    icon: Sparkles,
  },
  {
    q: "Qual a política de troca e devolução?",
    a: "Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução sem custo em caso de desistência ou defeito, conforme o Código de Defesa do Consumidor.",
    icon: RotateCcw,
  },
  {
    q: "As compras pelo site são seguras?",
    a: "Totalmente. Nossos pagamentos são processados via Mercado Pago com criptografia de ponta a ponta e seus dados pessoais estão protegidos por rigorosas políticas de privacidade.",
    icon: ShieldCheck,
  },
];

export default function SuportePage() {
  return (
    <div className="space-y-8 select-none">
      {/* Cabeçalho */}
      <div className="pb-5 border-b border-[#F0E5E7] dark:border-[#38262C]">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primaria" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Central de Suporte &amp; Ajuda
          </h1>
        </div>
        <p className="text-xs text-texto-claro dark:text-[#A89299] mt-1">
          Nossa equipe está pronta para te atender com todo o carinho e dedicação.
        </p>
      </div>

      {/* Canais Oficiais de Atendimento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* WhatsApp */}
        <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
              WhatsApp Oficial
            </h3>
            <p className="text-xs text-texto-claro dark:text-[#A89299] mt-1 leading-relaxed">
              Atendimento rápido para tirar dúvidas sobre pedidos, produtos e entregas.
            </p>
          </div>

          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full py-2 px-3 rounded-xl text-xs font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            Conversar no WhatsApp
          </a>
        </div>

        {/* E-mail */}
        <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
              E-mail de Suporte
            </h3>
            <p className="text-xs text-texto-claro dark:text-[#A89299] mt-1 leading-relaxed">
              Envie sua solicitação ou comprovante com resposta em até 24 horas úteis.
            </p>
          </div>

          <a
            href="mailto:contato@isisstore.com.br"
            className="mt-5 w-full py-2 px-3 rounded-xl text-xs font-semibold text-center border border-primaria text-primaria hover:bg-primaria hover:text-white transition-all shadow-2xs"
          >
            contato@isisstore.com.br
          </a>
        </div>

        {/* Horários */}
        <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Horário de Atendimento
            </h3>
            <div className="text-xs text-texto-claro dark:text-[#A89299] mt-2 space-y-1">
              <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                Segunda a Sexta-feira
              </p>
              <p>09h00 às 18h00 (horário de Brasília)</p>
              <p className="pt-1 text-[11px] italic">Exceto feriados nacionais</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#F7EFF1] dark:border-[#2C1D23] text-[11px] text-texto-claro dark:text-[#A89299] text-center">
            Resposta média: &lt; 30 min em horário comercial
          </div>
        </div>
      </div>

      {/* Dúvidas Frequentes (FAQ) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primaria" />
          <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Dúvidas Frequentes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, idx) => {
            const Icon = faq.icon;
            return (
              <div
                key={idx}
                className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2 text-primaria font-serif font-bold text-sm">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-texto-claro dark:text-[#A89299] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

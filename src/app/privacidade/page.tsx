import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  Database,
  UserCheck,
  Mail,
  ArrowRight,
} from "lucide-react";
import { getStoreSettings } from "@/lib/settings/store-settings";

export const metadata: Metadata = {
  title: "Política de Privacidade & Proteção de Dados (LGPD) — Isis Store",
  description:
    "Saiba como a Isis Store protege, armazena e respeita seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).",
};

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const storeName = settings.store_name || "Isis Store";
  const supportEmail = settings.support_email || "contato@isisstore.com.br";

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
            Política de Privacidade
          </span>
        </nav>

        {/* Header Editorial */}
        <div className="space-y-3 border-b border-borda-suave dark:border-[#38262C] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Conformidade com a LGPD (Lei 13.709/2018)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1]">
            Política de Privacidade & Dados
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro dark:text-[#A89299]">
            Última atualização: Outubro de 2026 • Versão 2.0
          </p>
        </div>

        {/* Card Destaque LGPD */}
        <div className="rounded-3xl border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/30 dark:from-[#1A261D] dark:via-[#1A1215] dark:to-[#172019] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
              Sua Privacidade é Sagrada para Nós
            </h3>
            <p className="text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
              Na <strong>{storeName}</strong>, tratamos suas informações com o mesmo carinho e cuidado que dedicamos à seleção das nossas semijoias. Seus dados nunca são comercializados, alugados ou compartilhados com terceiros para fins publicitários não autorizados.
            </p>
          </div>
        </div>

        {/* Conteúdo com Seções Detalhadas */}
        <div className="bg-white dark:bg-[#1A1215] rounded-3xl border border-borda-suave dark:border-[#38262C] p-6 sm:p-10 shadow-xs space-y-10 text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
          {/* Seção 1 */}
          <section id="compromisso" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                1
              </span>
              <span>Nosso Compromisso com a sua Privacidade</span>
            </h2>
            <p>
              Esta Política de Privacidade descreve com transparência e clareza como a <strong>{storeName}</strong> coleta, armazena, utiliza e protege os dados pessoais de seus clientes e visitantes, em conformidade integral com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
            </p>
          </section>

          {/* Seção 2 */}
          <section id="dados-coletados" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                2
              </span>
              <span>Dados Pessoais que Coletamos</span>
            </h2>
            <p>
              Coletamos apenas os dados estritamente necessários para a correta prestação dos nossos serviços de e-commerce:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Dados Cadastrais:</strong> Nome completo, CPF, data de nascimento (opcional) e gênero.
              </li>
              <li>
                <strong>Dados de Contato:</strong> Endereço de e-mail e número de telefone/WhatsApp para envio de notificações de pedido e atendimento.
              </li>
              <li>
                <strong>Dados de Entrega:</strong> Endereço postal completo (logradouro, número, complemento, bairro, cidade, estado e CEP) para despacho das mercadorias.
              </li>
              <li>
                <strong>Dados de Pagamento:</strong> Processados em ambiente criptografado e seguro pelos gateways integrados (Mercado Pago / adquirente bancária). A {storeName} <strong>não armazena números de cartões de crédito</strong> ou códigos CVV em seus servidores.
              </li>
              <li>
                <strong>Dados Técnicos de Navegação:</strong> Endereço IP, tipo de navegador, sistema operacional e identificadores de sessão com foco exclusivo em segurança e prevenção antifraude.
              </li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section id="finalidades" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                3
              </span>
              <span>Finalidades e Bases Legais do Tratamento</span>
            </h2>
            <p>
              Tratamos seus dados com base nas seguintes hipóteses legais autorizadas pela LGPD:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-fundo/80 dark:bg-[#201518] border border-borda-suave dark:border-[#38262C] space-y-1">
                <h4 className="font-bold text-texto-escuro dark:text-white">Execução de Contrato:</h4>
                <p>Processamento do pedido, cobrança, emissão de faturamento e entrega das semijoias no seu endereço.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-fundo/80 dark:bg-[#201518] border border-borda-suave dark:border-[#38262C] space-y-1">
                <h4 className="font-bold text-texto-escuro dark:text-white">Cumprimento de Obrigação Legal:</h4>
                <p>Emissão de documentos fiscais e atendimento a exigências tributárias perante órgãos públicos.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-fundo/80 dark:bg-[#201518] border border-borda-suave dark:border-[#38262C] space-y-1">
                <h4 className="font-bold text-texto-escuro dark:text-white">Legítimo Interesse & Segurança:</h4>
                <p>Prevenção a fraudes financeiras, proteção contra invasões e melhoria na experiência de navegação.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-fundo/80 dark:bg-[#201518] border border-borda-suave dark:border-[#38262C] space-y-1">
                <h4 className="font-bold text-texto-escuro dark:text-white">Consentimento:</h4>
                <p>Envio de novidades, lançamentos e cupons promocionais especiais (o qual você pode cancelar a qualquer momento).</p>
              </div>
            </div>
          </section>

          {/* Seção 4 */}
          <section id="compartilhamento" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                4
              </span>
              <span>Compartilhamento Seguro de Dados</span>
            </h2>
            <p>
              O compartilhamento de dados ocorre unicamente com parceiros indispensáveis para a operação comercial da loja:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Gateways de Pagamento:</strong> Para processamento de Pix e transações com cartão em ambiente auditado e certificado PCI-DSS.
              </li>
              <li>
                <strong>Transportadoras e Correios:</strong> Apenas os dados essenciais para o transporte e entrega da sua encomenda (nome, telefone e endereço).
              </li>
              <li>
                <strong>Autoridades Fiscais e Policiais:</strong> Quando exigido por ordem judicial ou cumprimento de legislação tributária.
              </li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section id="cookies" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                5
              </span>
              <span>Uso de Cookies e Tecnologias de Navegação</span>
            </h2>
            <p>
              Utilizamos cookies estritamente necessários para permitir o funcionamento da sua sacola de compras, login seguro e preferências de tema (modo claro/escuro). Não utilizamos cookies invasivos de rastreamento entre sites de terceiros sem a sua ciência.
            </p>
          </section>

          {/* Seção 6 */}
          <section id="seguranca" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                6
              </span>
              <span>Segurança da Informação e Armazenamento</span>
            </h2>
            <p>
              Adotamos elevados padrões técnicos de cibersegurança:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Tráfego criptografado de ponta a ponta via <strong>HTTPS / TLS 1.3</strong>.</li>
              <li>Isolamento de dados por cliente no banco de dados via <strong>Row Level Security (RLS)</strong> no PostgreSQL.</li>
              <li>Proteção contra acessos administrativos indevidos com autenticação e trilha de auditoria contínua.</li>
            </ul>
          </section>

          {/* Seção 7 */}
          <section id="direitos" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                7
              </span>
              <span>Seus Direitos como Titular de Dados (Art. 18 da LGPD)</span>
            </h2>
            <p>
              Você é o proprietário dos seus dados pessoais. A qualquer momento, você pode exercer seus direitos legais:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-fundo dark:bg-[#201518]">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Confirmar a existência de tratamento</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-fundo dark:bg-[#201518]">
                <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Acessar e consultar seus dados</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-fundo dark:bg-[#201518]">
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Corrigir dados incompletos ou inexatos</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-fundo dark:bg-[#201518]">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Solicitar a exclusão ou anonimização</span>
              </div>
            </div>
          </section>

          {/* Seção 8 */}
          <section id="dpo" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                8
              </span>
              <span>Canal do Encarregado de Dados (DPO) e Contato</span>
            </h2>
            <p>
              Para solicitar acesso, atualização, exclusão de dados pessoais ou tirar dúvidas sobre esta política, basta entrar em contato com o nosso Encarregado pelo e-mail:
            </p>
            <div className="p-4 rounded-2xl bg-primaria/5 dark:bg-primaria/10 border border-primaria/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-primaria shrink-0" />
                <span className="font-bold text-texto-escuro dark:text-white break-all">
                  {supportEmail}
                </span>
              </div>
              <Link
                href={`mailto:${supportEmail}?subject=Solicitacao%20LGPD%20-%20Titular%20de%20Dados`}
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

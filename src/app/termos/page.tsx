import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Scale,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { getStoreSettings } from "@/lib/settings/store-settings";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso — Isis Store",
  description:
    "Termos e Condições Gerais de Uso e Compra da Isis Store. Políticas de compra, envio, garantia de semijoias e devolução conforme o Código de Defesa do Consumidor.",
};

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const storeName = settings.store_name || "Isis Store";

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
            Termos de Uso
          </span>
        </nav>

        {/* Header Editorial */}
        <div className="space-y-3 border-b border-borda-suave dark:border-[#38262C] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaria/10 dark:bg-primaria/20 text-primaria text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Transparência & Conformidade Legal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1]">
            Termos e Condições de Uso
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro dark:text-[#A89299]">
            Última atualização: Outubro de 2026 • Versão 2.0
          </p>
        </div>

        {/* Card Destaque CDC */}
        <div className="rounded-3xl border border-primaria/20 bg-gradient-to-r from-primaria/10 via-white to-primaria/5 dark:from-[#25171D] dark:via-[#1A1215] dark:to-[#22161A] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primaria text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
              Compromisso com o Código de Defesa do Consumidor
            </h3>
            <p className="text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
              Todas as relações de compra e venda realizadas na {storeName} são regidas pela Lei Federal nº 8.078/1990 (CDC). Garantimos transparência absoluta em preços, prazos, política de trocas e direito de arrependimento em até 7 dias corridos sem qualquer encargo.
            </p>
          </div>
        </div>

        {/* Conteúdo dos Termos com Seções Estruturadas */}
        <div className="bg-white dark:bg-[#1A1215] rounded-3xl border border-borda-suave dark:border-[#38262C] p-6 sm:p-10 shadow-xs space-y-10 text-xs sm:text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
          {/* Seção 1 */}
          <section id="aceitacao" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                1
              </span>
              <span>Aceitação e Objeto</span>
            </h2>
            <p>
              Ao navegar, cadastrar-se ou realizar compras na plataforma digital da <strong>{storeName}</strong>, o usuário declara ter lido, compreendido e concordado integralmente com estes Termos e Condições Gerais de Uso, bem como com a nossa Política de Privacidade.
            </p>
            <p>
              Estes termos aplicam-se a todos os visitantes, clientes cadastrados e compradores de semijoias, joias, personalizados e acessórios comercializados em nosso storefront.
            </p>
          </section>

          {/* Seção 2 */}
          <section id="cadastro" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                2
              </span>
              <span>Cadastro e Segurança da Conta</span>
            </h2>
            <p>
              Para efetuar pedidos, o usuário pode criar uma conta pessoal ou fornecer os dados necessários durante o fluxo de checkout. Todas as informações cadastrais prestadas (nome, CPF, e-mail, telefone e endereço) devem ser verídicas e atualizadas.
            </p>
            <p>
              O usuário é o único responsável pela guarda e confidencialidade de sua senha de acesso. Em caso de suspeita de uso indevido de sua conta, notifique imediatamente nossa equipe pelos canais de atendimento.
            </p>
          </section>

          {/* Seção 3 */}
          <section id="produtos" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                3
              </span>
              <span>Catálogo, Preços e Disponibilidade</span>
            </h2>
            <p>
              Nos esforçamos para que as fotografias e descrições dos produtos representem fielmente o tamanho, brilho, acabamento e banho das peças. Pequenas variações de tonalidade podem ocorrer em função da calibração de cor de diferentes monitores e telas de smartphones.
            </p>
            <p>
              Os preços são informados em moeda corrente nacional (Real brasileiro - BRL) e contemplam todos os tributos devidos. A inclusão de um item no carrinho de compras não garante a reserva do produto ou congelamento de preço; a reserva de estoque ocorre apenas no momento da conclusão do pedido no checkout.
            </p>
          </section>

          {/* Seção 4 */}
          <section id="pagamentos" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                4
              </span>
              <span>Formas de Pagamento e Aprovação</span>
            </h2>
            <p>
              Disponibilizamos métodos de pagamento seguros e auditados:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Pix:</strong> Aprovação imediata com emissão de QR Code e código copia e cola dinâmico.
              </li>
              <li>
                <strong>Cartão de Crédito:</strong> Parcelamento em até 12 vezes com verificação criptográfica antifraude via adquirente autorizada.
              </li>
              <li>
                <strong>WhatsApp Checkout:</strong> Atendimento humanizado direto para combinações específicas e confirmação de estoque assistida.
              </li>
            </ul>
            <p>
              Pedidos com pagamento não concluído dentro do prazo estipulado serão cancelados automaticamente pelo sistema e os itens liberados novamente ao catálogo.
            </p>
          </section>

          {/* Seção 5 */}
          <section id="entregas" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                5
              </span>
              <span>Prazos de Postagem e Frete</span>
            </h2>
            <p>
              Após a confirmação do pagamento, as peças passam por rigorosa inspeção de qualidade e higienização, sendo embaladas e despachadas em até <strong>1 a 2 dias úteis</strong>.
            </p>
            <p>
              O prazo total de entrega e o valor do frete variam conforme o CEP de destino e a modalidade de transporte selecionada (Correios Sedex, PAC ou transportadora parceira). Campanhas de frete grátis obedecem aos regulamentos vigentes divulgados na loja.
            </p>
          </section>

          {/* Seção 6 */}
          <section id="trocas" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                6
              </span>
              <span>Política de Trocas, Devoluções e Arrependimento (CDC)</span>
            </h2>
            <div className="p-4 rounded-2xl bg-fundo dark:bg-[#201518] border border-borda-suave dark:border-[#38262C] space-y-2">
              <h4 className="font-semibold text-texto-escuro dark:text-white">
                Direito de Arrependimento (Artigo 49 do CDC):
              </h4>
              <p>
                O cliente tem o direito de desistir da compra em até <strong>7 (sete) dias corridos</strong> contados a partir da data de recebimento do produto no endereço indicado. Nesse caso, o valor pago será integralmente restituído, incluindo o frete, desde que a peça não apresente sinais de uso e esteja em sua embalagem original.
              </p>
            </div>
            <p>
              Para defeitos de fabricação aparentes, garantimos a troca ou reparo no prazo de até 90 dias, conforme preconiza o Código de Defesa do Consumidor. A solicitação deve ser formalizada através do nosso canal de atendimento ao cliente com fotos ou vídeos da peça.
            </p>
          </section>

          {/* Seção 7 */}
          <section id="garantia" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                7
              </span>
              <span>Garantia de Qualidade & Cuidados com as Semijoias</span>
            </h2>
            <p>
              Nossas semijoias recebem banho nobre de alta espessura e verniz hipoalergênico protetor. Para preservar o brilho e a durabilidade das suas peças:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Evite contato direto com perfumes, cremes, cosméticos, álcool em gel e produtos químicos de limpeza.</li>
              <li>Retire as peças antes de entrar no mar, piscinas ou durante banhos quentes.</li>
              <li>Guarde as semijoias individualmente em saquinhos aveludados para evitar atrito entre metais e pedrarias.</li>
              <li>A garantia não cobre avarias decorrentes de quedas, quebra por tração, arranhões ou mau uso evidente.</li>
            </ul>
          </section>

          {/* Seção 8 */}
          <section id="propriedade" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                8
              </span>
              <span>Propriedade Intelectual</span>
            </h2>
            <p>
              Todo o conteúdo disponibilizado nesta plataforma digital, incluindo marcas, logotipos, textos, ilustrações, layouts, fotografias autorais e códigos-fonte, pertence com exclusividade à <strong>{storeName}</strong> ou a seus licenciantes, sendo estritamente vedada a reprodução ou cópia não autorizada.
            </p>
          </section>

          {/* Seção 9 */}
          <section id="foro" className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primaria/10 text-primaria text-xs font-sans font-bold flex items-center justify-center">
                9
              </span>
              <span>Legislação Aplicável e Foro</span>
            </h2>
            <p>
              Estes Termos são regidos e interpretados em conformidade com as Leis da República Federativa do Brasil. Para a solução de controvérsias decorrentes deste contrato, as partes elegem preferencialmente o foro do domicílio do consumidor, em observância às normas de proteção ao consumidor.
            </p>
          </section>
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

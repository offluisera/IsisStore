import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PixPaymentBox } from "@/components/commerce/pix-payment-box";

interface ShippingAddressSnapshot {
  recipient_name?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  payment_method?: string;
  shipping_method?: string;
}

interface CheckoutSucessoPageProps {
  searchParams: Promise<{
    orderId?: string;
    order_id?: string;
    orderNumber?: string;
    gateway?: string;
    whatsapp?: string;
    waUrl?: string;
    wa?: string;
    status?: string;
    collection_status?: string;
    payment_id?: string;
    preference_id?: string;
  }>;
}

export default async function CheckoutSucessoPage({
  searchParams,
}: CheckoutSucessoPageProps) {
  const {
    orderId,
    order_id,
    orderNumber,
    gateway,
    waUrl,
    whatsapp,
    wa,
    status,
    collection_status,
  } = await searchParams;

  const effectiveOrderId = orderId || order_id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar detalhes do pedido garantindo que pertença ao usuário logado
  let orderData = null;
  let paymentData = null;

  if (effectiveOrderId) {
    const { data } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal_cents,
        shipping_cents,
        discount_cents,
        total_cents,
        shipping_address,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price_cents,
          subtotal_cents
        )
      `)
      .eq("id", effectiveOrderId)
      .eq("customer_id", user.id)
      .maybeSingle();

    orderData = data;

    const { data: pay } = await supabase
      .from("payments")
      .select("payment_method, gateway, status, qr_code, qr_code_base64, ticket_url")
      .eq("order_id", effectiveOrderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    paymentData = pay;

    // Atualização reativa se o cliente retornou do Mercado Pago com status aprovado
    const isMpApproved = status === "approved" || collection_status === "approved";
    if (isMpApproved && orderData && orderData.status !== "paid") {
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", effectiveOrderId);
      await supabase
        .from("payments")
        .update({ status: "approved" })
        .eq("order_id", effectiveOrderId);
      orderData.status = "paid";
      if (paymentData) {
        paymentData.status = "approved";
      }
    }
  }

  const shippingAddr =
    (orderData?.shipping_address as unknown as ShippingAddressSnapshot) || null;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const isPix = shippingAddr?.payment_method === "pix";
  const isInfinitePay =
    shippingAddr?.payment_method === "infinitepay" ||
    paymentData?.gateway === "infinitepay" ||
    paymentData?.payment_method === "infinitepay_checkout" ||
    gateway === "infinitepay";
  const isWhatsApp =
    shippingAddr?.payment_method === "whatsapp" ||
    paymentData?.payment_method === "whatsapp" ||
    Boolean(waUrl) ||
    whatsapp === "1" ||
    wa === "1";

  const effectiveOrderNumber =
    orderData?.order_number || orderNumber || "ISIS-CONFIRMADO";

  const isApproved =
    orderData?.status === "paid" ||
    paymentData?.status === "approved" ||
    status === "approved" ||
    collection_status === "approved";

  // Buscar WhatsApp do gateway se necessário
  let effectiveWhatsAppUrl = waUrl || paymentData?.ticket_url;
  if (isWhatsApp && !effectiveWhatsAppUrl) {
    const { data: waGateway } = await supabase
      .from("payment_gateways")
      .select("settings")
      .eq("name", "whatsapp")
      .maybeSingle();

    const waSettings = (waGateway?.settings as { phone?: string; message_template?: string } | null) || {};
    const waPhone = (waSettings.phone || "5511999998888").replace(/\D/g, "");
    const productNames = orderData?.order_items?.map((i) => i.product_name).join(", ") || "produtos selecionados";
    const totalFormatted = orderData ? formatPrice(orderData.total_cents) : "R$ 0,00";
    const template =
      waSettings.message_template ||
      "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação";
    const msg = template
      .replace(/\{produto\}/gi, productNames)
      .replace(/\{pedido\}/gi, effectiveOrderNumber)
      .replace(/\{valor\}/gi, totalFormatted);
    effectiveWhatsAppUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between selection:bg-primaria-soft selection:text-primaria">
      {/* Top Header */}
      <header className="bg-fundo-card border-b border-borda sticky top-0 z-30 shadow-xs transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-primaria/20 shadow-xs">
              <Image
                src="/images/logo/logo.jpeg"
                alt="Isis Store"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-texto-escuro">
              Isis Store
            </span>
          </Link>

          <Link
            href="/conta/pedidos"
            className="text-xs font-semibold text-primaria hover:underline"
          >
            Meus Pedidos
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-fundo-card rounded-3xl border border-borda p-6 sm:p-12 shadow-sm space-y-8 text-center sm:text-left transition-colors">
          {/* Hero de Sucesso */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-borda/60">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs animate-in zoom-in-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Pedido Realizado com Sucesso
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro mt-2">
                Obrigado pela sua compra!
              </h1>
              <p className="text-xs sm:text-sm text-texto-claro mt-1 leading-relaxed">
                Seu pedido foi registrado em nossa base e já está em processo de validação.
              </p>
            </div>
          </div>

          {/* Destaque do Número do Pedido */}
          <div className="p-4 sm:p-5 rounded-2xl bg-fundo/50 border border-borda flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-texto-claro block">Código do Pedido:</span>
              <span className="font-serif text-lg font-bold text-texto-escuro">
                #{effectiveOrderNumber}
              </span>
            </div>
            {orderData && (
              <div className="sm:text-right">
                <span className="text-texto-claro block">Valor Total:</span>
                <span className="font-serif text-lg font-bold text-primaria">
                  {formatPrice(orderData.total_cents)}
                </span>
              </div>
            )}
          </div>

          {/* Instruções de Pagamento Pix (se aplicável) */}
          {isPix && (
            <PixPaymentBox
              qrCode={
                paymentData?.qr_code ||
                "00020126580014br.gov.bcb.pix0136isisstore@pagamentos.com.br520400005303986540"
              }
              qrCodeBase64={paymentData?.qr_code_base64}
              amountFormatted={
                orderData ? formatPrice(orderData.total_cents) : "R$ 0,00"
              }
            />
          )}

          {/* Atendimento & Fechamento via WhatsApp (se aplicável) */}
          {isWhatsApp && effectiveWhatsAppUrl && (
            <div className="p-6 rounded-3xl border border-emerald-300 bg-emerald-50/50 shadow-xs space-y-4 text-xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-bold text-texto-escuro">
                      Conclua seu Pedido pelo WhatsApp
                    </h2>
                    <p className="text-[11px] text-emerald-800">
                      Seu pedido #{effectiveOrderNumber} foi registrado com sucesso em nosso sistema!
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
                  Baixa Manual Após Atendimento
                </span>
              </div>

              <p className="text-texto-medio leading-relaxed">
                Clique no botão abaixo para abrir a conversa no WhatsApp oficial da Isis Store. A mensagem com os dados exatos do seu pedido já está pronta para envio imediato ao nosso atendente.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <a
                  href={effectiveWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Abrir Conversa no WhatsApp Agora</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <span className="text-[11px] text-texto-claro">
                  Horário de Atendimento: Seg a Sáb das 09h às 19h
                </span>
              </div>
            </div>
          )}

          {/* InfinitePay Checkout (se aplicável) */}
          {isInfinitePay && (
            <div className="p-6 rounded-3xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs space-y-4 text-xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200 dark:border-amber-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-bold text-texto-escuro">
                      {isApproved
                        ? "Pagamento Confirmado na InfinitePay"
                        : "Pagamento via InfinitePay"}
                    </h2>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      {isApproved
                        ? "Transação aprovada com sucesso! Seu pedido já está sendo preparado com todo carinho."
                        : "Pedido registrado com sucesso! Se você ainda não concluiu o pagamento, clique no botão abaixo para abrir a página de pagamento."}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    isApproved
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isApproved ? "Aprovado" : "Aguardando Confirmação"}
                </span>
              </div>

              {!isApproved && paymentData?.ticket_url && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <a
                    href={paymentData.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Concluir Pagamento na InfinitePay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Mercado Pago Checkout Pro (se aplicável e não for WhatsApp/Pix/InfinitePay) */}
          {!isWhatsApp && !isPix && !isInfinitePay && (
            <div className="p-6 rounded-3xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs space-y-4 text-xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/60 dark:border-blue-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-bold text-texto-escuro">
                      {isApproved ? "Pagamento Aprovado no Mercado Pago" : "Pagamento Mercado Pago"}
                    </h2>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300">
                      {isApproved
                        ? "Sua transação foi confirmada com sucesso pela operadora."
                        : "Aguardando confirmação da operadora ou conclusão do checkout."}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    isApproved
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isApproved ? "Aprovado" : "Pendente"}
                </span>
              </div>

              {!isApproved && paymentData?.ticket_url && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <a
                    href={paymentData.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <span>Concluir Pagamento no Mercado Pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[11px] text-texto-claro">
                    Clique para reabrir a tela de pagamento segura caso tenha fechado
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Resumo de Entrega e Itens */}
          {shippingAddr && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
              <div className="p-5 rounded-2xl border border-borda/80 bg-fundo-card space-y-2">
                <h3 className="font-serif text-sm font-bold text-texto-escuro flex items-center gap-2 pb-1 border-b border-borda/60">
                  <MapPin className="w-4 h-4 text-primaria" />
                  <span>Endereço de Entrega</span>
                </h3>
                <p className="font-semibold text-texto-escuro">
                  {shippingAddr.recipient_name}
                </p>
                <p className="text-texto-medio">
                  {shippingAddr.street}, {shippingAddr.number}
                  {shippingAddr.complement ? ` — ${shippingAddr.complement}` : ""}
                </p>
                <p className="text-texto-claro">
                  {shippingAddr.neighborhood} &bull; {shippingAddr.city} - {shippingAddr.state}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-borda/80 bg-fundo-card space-y-2">
                <h3 className="font-serif text-sm font-bold text-texto-escuro flex items-center gap-2 pb-1 border-b border-borda/60">
                  <Clock className="w-4 h-4 text-primaria" />
                  <span>Próximas Etapas</span>
                </h3>
                <p className="text-texto-medio leading-relaxed">
                  Assim que o pagamento for aprovado, nossa equipe preparará seus produtos com embalagem especial para presente e emitirá o código de rastreamento oficial.
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-borda/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
                size: "default",
                className: "w-full sm:w-auto text-xs font-semibold gap-1.5",
              })}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voltar à Loja</span>
            </Link>

            <Link
              href={orderId ? `/conta/pedidos/${orderId}` : "/conta/pedidos"}
              className={buttonVariants({
                variant: "default",
                size: "default",
                className: "w-full sm:w-auto text-xs font-semibold gap-2 shadow-xs",
              })}
            >
              <span>Acompanhar Meu Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full py-6 text-center text-xs text-texto-claro border-t border-borda/60 bg-fundo-card transition-colors">
        <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

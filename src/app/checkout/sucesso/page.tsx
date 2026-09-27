import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShoppingBag,
  QrCode,
  Copy,
  Clock,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

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
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}

export default async function CheckoutSucessoPage({
  searchParams,
}: CheckoutSucessoPageProps) {
  const { orderId, orderNumber } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar detalhes do pedido garantindo que pertença ao usuário logado
  let orderData = null;
  if (orderId) {
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
      .eq("id", orderId)
      .eq("customer_id", user.id)
      .maybeSingle();

    orderData = data;
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

  const effectiveOrderNumber =
    orderData?.order_number || orderNumber || "ISIS-CONFIRMADO";

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between selection:bg-primaria-soft selection:text-primaria">
      {/* Top Header */}
      <header className="bg-white border-b border-borda sticky top-0 z-30 shadow-xs">
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
        <div className="bg-white rounded-3xl border border-borda p-6 sm:p-12 shadow-sm space-y-8 text-center sm:text-left">
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
            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <QrCode className="w-5 h-5 text-amber-700" />
                <span>Pagamento via Pix Pendente</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Você escolheu pagar com Pix e garantiu <strong>5% de desconto exclusivo</strong>! Utilize a chave ou QR Code gerado para confirmar o pagamento em até 30 minutos e liberar o envio imediato.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 bg-white p-2.5 rounded-xl border border-amber-200 text-texto-medio font-mono text-[11px] truncate">
                  00020126580014br.gov.bcb.pix0136isisstore@pagamentos.com.br520400005303986540
                </div>
                <button
                  type="button"
                  className="px-3.5 py-2.5 rounded-xl bg-amber-700 text-white font-semibold text-xs hover:bg-amber-800 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>
          )}

          {/* Resumo de Entrega e Itens */}
          {shippingAddr && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
              <div className="p-5 rounded-2xl border border-borda/80 bg-white space-y-2">
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

              <div className="p-5 rounded-2xl border border-borda/80 bg-white space-y-2">
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
      <footer className="w-full py-6 text-center text-xs text-texto-claro border-t border-borda/60 bg-white">
        <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

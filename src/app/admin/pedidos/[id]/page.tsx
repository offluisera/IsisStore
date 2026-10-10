import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  User,
  ShoppingBag,
  CreditCard,
  QrCode,
  Package,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusManager } from "@/components/admin/order-status-manager";

interface AdminPedidoDetalhesProps {
  params: Promise<{ id: string }>;
}

interface ShippingAddressSnapshot {
  recipient_name?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  payment_method?: string;
  shipping_method?: string;
}

interface OrderItemSnapshot {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
  customization?: {
    text?: string;
    imageUrl?: string;
    notes?: string;
    size?: string;
    color?: string;
  } | null;
}

interface PaymentSnapshot {
  id: string;
  gateway: string;
  gateway_payment_id: string | null;
  amount_cents: number;
  payment_method: string | null;
  status: string;
  created_at: string;
}

export default async function AdminPedidoDetalhesPage({
  params,
}: AdminPedidoDetalhesProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
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
      notes,
      created_at,
      profiles (
        full_name,
        email,
        phone
      ),
      order_items (
        id,
        product_name,
        sku,
        quantity,
        unit_price_cents,
        subtotal_cents,
        customization
      ),
      payments (
        id,
        gateway,
        gateway_payment_id,
        amount_cents,
        payment_method,
        status,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const shippingAddr =
    (order.shipping_address as unknown as ShippingAddressSnapshot) || {};

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/pedidos"
              className="hover:text-primaria transition-colors"
            >
              Pedidos
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">
              #{order.order_number}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Detalhes do Pedido #{order.order_number}
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Realizado em {formatDate(order.created_at)}
          </p>
        </div>

        <div>
          <Link
            href="/admin/pedidos"
            className={buttonVariants({
              variant: "white",
              size: "sm",
              className: "dark:bg-[#151012] dark:border-[#38262C] dark:text-[#F8EFF1]",
            })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar aos Pedidos</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Ações de Status + Itens + Endereço */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gerenciador de Status */}
          <OrderStatusManager
            orderId={order.id}
            orderNumber={order.order_number}
            initialStatus={
              order.status as
                | "pending_payment"
                | "paid"
                | "processing"
                | "shipped"
                | "delivered"
                | "cancelled"
                | "refunded"
            }
            initialNotes={order.notes}
          />

          {/* Snapshot dos Itens do Pedido */}
          <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-borda/60 dark:border-[#38262C]/60 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primaria" />
              <h2 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                Produtos Comprados (Snapshot Imutável)
              </h2>
            </div>

            <div className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-xs">
              {(order.order_items as unknown as OrderItemSnapshot[])?.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primaria-soft dark:bg-primaria-soft/30 text-primaria flex items-center justify-center shrink-0 border border-primaria/20 mt-0.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-texto-claro dark:text-[#988087] font-mono">
                        SKU: {item.sku} &bull; Qtd: {item.quantity} un.
                      </p>

                      {/* Variações de Tamanho e Cor Selecionadas */}
                      {(item.customization?.size || item.customization?.color) && (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.customization.size && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primaria/10 text-primaria font-bold text-xs border border-primaria/25">
                              Tamanho: {item.customization.size}
                            </span>
                          )}
                          {item.customization.color && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-fundo dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] font-semibold text-xs border border-borda dark:border-[#38262C]">
                              Cor: {item.customization.color}
                            </span>
                          )}
                        </div>
                      )}

                      {item.customization && (item.customization.text || item.customization.imageUrl || item.customization.notes) && (
                        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-50/70 to-primaria-soft/40 dark:from-amber-950/30 dark:to-primaria-soft/10 border border-amber-200/80 dark:border-amber-800/40 max-w-lg space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Dados de Personalização / Gravação Solicitada:</span>
                          </div>
                          {item.customization.text && (
                            <div className="text-xs text-texto-escuro dark:text-[#F8EFF1] bg-white/80 dark:bg-[#151012] p-2 rounded-lg border border-amber-200 dark:border-amber-800/40 font-serif font-semibold">
                              &ldquo;{item.customization.text}&rdquo;
                            </div>
                          )}
                          {item.customization.imageUrl && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] font-semibold text-texto-medio dark:text-[#D4BFC5]">
                                Imagem Anexada:
                              </span>
                              <a
                                href={item.customization.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primaria bg-white dark:bg-[#1E1518] px-2.5 py-1 rounded-md border border-primaria/30 dark:border-primaria/40 hover:bg-primaria-soft dark:hover:bg-primaria-soft/20 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Abrir / Baixar Foto Original</span>
                              </a>
                            </div>
                          )}
                          {item.customization.notes && (
                            <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                              <strong>Instruções do Cliente:</strong> {item.customization.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-primaria">
                      {formatPrice(item.subtotal_cents)}
                    </p>
                    <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                      ({formatPrice(item.unit_price_cents)} un.)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dados do Cliente e Endereço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
                <User className="w-4 h-4 text-primaria" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Dados do Cliente
                </h3>
              </div>
              <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                {order.profiles?.full_name || "Cliente Isis Store"}
              </p>
              <p className="text-texto-medio dark:text-[#D4BFC5]">{order.profiles?.email}</p>
              {order.profiles?.phone && (
                <p className="text-texto-claro dark:text-[#988087]">Tel: {order.profiles.phone}</p>
              )}
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
                <MapPin className="w-4 h-4 text-primaria" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Endereço de Entrega
                </h3>
              </div>
              <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                Destinatário: {shippingAddr.recipient_name || "Não informado"}
              </p>
              <p className="text-texto-medio dark:text-[#D4BFC5]">
                {shippingAddr.street}, {shippingAddr.number}
                {shippingAddr.complement ? ` — ${shippingAddr.complement}` : ""}
              </p>
              <p className="text-texto-claro dark:text-[#988087]">
                {shippingAddr.neighborhood} &bull; {shippingAddr.city} - {shippingAddr.state} &bull; CEP: {shippingAddr.postal_code}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Resumo Financeiro & Pagamentos */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resumo Financeiro */}
          <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-4 text-xs">
            <h2 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
              Resumo Financeiro
            </h2>

            <div className="space-y-2 text-texto-medio dark:text-[#D4BFC5]">
              <div className="flex justify-between">
                <span>Subtotal dos Produtos:</span>
                <span>{formatPrice(order.subtotal_cents)}</span>
              </div>

              <div className="flex justify-between">
                <span>Frete ({shippingAddr.shipping_method?.toUpperCase() || "PAC"}):</span>
                <span>
                  {order.shipping_cents === 0
                    ? "Grátis"
                    : formatPrice(order.shipping_cents)}
                </span>
              </div>

              {order.discount_cents > 0 && (
                <div className="flex justify-between text-sucesso dark:text-emerald-400 font-medium">
                  <span>Descontos Aplicados:</span>
                  <span>-{formatPrice(order.discount_cents)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-borda/60 dark:border-[#38262C]/60 flex justify-between items-center text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                <span>Total do Pedido:</span>
                <span className="text-primaria text-base">
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {/* Histórico de Pagamentos */}
          <div className="bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
              {shippingAddr.payment_method === "whatsapp" ? (
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
              ) : shippingAddr.payment_method === "pix" ? (
                <QrCode className="w-4 h-4 text-primaria" />
              ) : (
                <CreditCard className="w-4 h-4 text-primaria" />
              )}
              <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                Informações de Pagamento
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-texto-medio dark:text-[#D4BFC5]">
                <strong>Método:</strong>{" "}
                {shippingAddr.payment_method === "whatsapp"
                  ? "WhatsApp (Baixa Manual)"
                  : shippingAddr.payment_method === "pix"
                  ? "Pix Instantâneo"
                  : "Cartão de Crédito"}
              </p>

              {/* Alerta de Baixa Manual se pendente */}
              {shippingAddr.payment_method === "whatsapp" && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-[11px] space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Canal de Vendas WhatsApp</span>
                  </p>
                  <p className="leading-relaxed text-emerald-800 dark:text-emerald-300">
                    {order.status === "pending_payment"
                      ? "Este pedido foi registrado diretamente pelo WhatsApp e aguarda sua confirmação manual. Ao alterar o status acima para 'Pago', o sistema aprovará o pagamento e dará a baixa no estoque automaticamente."
                      : "Pagamento confirmado e estoque baixado manualmente no sistema."}
                  </p>

                  {(order.profiles?.phone || shippingAddr.phone) && (
                    <a
                      href={`https://wa.me/${(order.profiles?.phone || shippingAddr.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Olá ${order.profiles?.full_name || shippingAddr.recipient_name || "Cliente"}, sobre o seu pedido #${order.order_number} na Isis Store:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 transition-colors shadow-2xs mt-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Conversar com o Cliente no WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {order.payments && order.payments.length > 0 ? (
                (order.payments as unknown as PaymentSnapshot[]).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-fundo/50 dark:bg-[#151012] rounded-xl border border-borda dark:border-[#38262C] text-[11px] space-y-1 text-texto-medio dark:text-[#D4BFC5]"
                  >
                    <p>
                      <strong>Gateway:</strong> {p.gateway?.toUpperCase()}
                    </p>
                    {p.gateway_payment_id && (
                      <p className="font-mono text-texto-claro dark:text-[#988087] truncate">
                        ID: {p.gateway_payment_id}
                      </p>
                    )}
                    <p>
                      <strong>Status Gateway:</strong> {p.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-texto-claro dark:text-[#988087] text-[11px]">
                  Nenhum registro no gateway associado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        subtotal_cents
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
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
            <span className="text-texto-escuro font-medium">
              #{order.order_number}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Detalhes do Pedido #{order.order_number}
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Realizado em {formatDate(order.created_at)}
          </p>
        </div>

        <div>
          <Link
            href="/admin/pedidos"
            className={buttonVariants({ variant: "white", size: "sm" })}
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
          <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
            <div className="p-5 border-b border-borda/60 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primaria" />
              <h2 className="font-serif text-sm font-bold text-texto-escuro">
                Produtos Comprados (Snapshot Imutável)
              </h2>
            </div>

            <div className="divide-y divide-borda/60 text-xs">
              {(order.order_items as unknown as OrderItemSnapshot[])?.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria/20">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-texto-escuro">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-texto-claro font-mono">
                        SKU: {item.sku} &bull; Qtd: {item.quantity} un.
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primaria">
                      {formatPrice(item.subtotal_cents)}
                    </p>
                    <p className="text-[10px] text-texto-claro">
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
            <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60">
                <User className="w-4 h-4 text-primaria" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro">
                  Dados do Cliente
                </h3>
              </div>
              <p className="font-semibold text-texto-escuro">
                {order.profiles?.full_name || "Cliente Isis Store"}
              </p>
              <p className="text-texto-medio">{order.profiles?.email}</p>
              {order.profiles?.phone && (
                <p className="text-texto-claro">Tel: {order.profiles.phone}</p>
              )}
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60">
                <MapPin className="w-4 h-4 text-primaria" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro">
                  Endereço de Entrega
                </h3>
              </div>
              <p className="font-semibold text-texto-escuro">
                Destinatário: {shippingAddr.recipient_name || "Não informado"}
              </p>
              <p className="text-texto-medio">
                {shippingAddr.street}, {shippingAddr.number}
                {shippingAddr.complement ? ` — ${shippingAddr.complement}` : ""}
              </p>
              <p className="text-texto-claro">
                {shippingAddr.neighborhood} &bull; {shippingAddr.city} - {shippingAddr.state} &bull; CEP: {shippingAddr.postal_code}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Resumo Financeiro & Pagamentos */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resumo Financeiro */}
          <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-4 text-xs">
            <h2 className="font-serif text-sm font-bold text-texto-escuro pb-2 border-b border-borda/60">
              Resumo Financeiro
            </h2>

            <div className="space-y-2 text-texto-medio">
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
                <div className="flex justify-between text-sucesso font-medium">
                  <span>Descontos Aplicados:</span>
                  <span>-{formatPrice(order.discount_cents)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-borda/60 flex justify-between items-center text-sm font-bold text-texto-escuro">
                <span>Total do Pedido:</span>
                <span className="text-primaria text-base">
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {/* Histórico de Pagamentos */}
          <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-borda/60">
              {shippingAddr.payment_method === "pix" ? (
                <QrCode className="w-4 h-4 text-primaria" />
              ) : (
                <CreditCard className="w-4 h-4 text-primaria" />
              )}
              <h3 className="font-serif text-sm font-bold text-texto-escuro">
                Informações de Pagamento
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-texto-medio">
                <strong>Método:</strong>{" "}
                {shippingAddr.payment_method === "pix"
                  ? "Pix Instantâneo"
                  : "Cartão de Crédito"}
              </p>

              {order.payments && order.payments.length > 0 ? (
                (order.payments as unknown as PaymentSnapshot[]).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-fundo/50 rounded-xl border border-borda text-[11px] space-y-1"
                  >
                    <p>
                      <strong>Gateway:</strong> {p.gateway?.toUpperCase()}
                    </p>
                    {p.gateway_payment_id && (
                      <p className="font-mono text-texto-claro truncate">
                        ID: {p.gateway_payment_id}
                      </p>
                    )}
                    <p>
                      <strong>Status Gateway:</strong> {p.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-texto-claro text-[11px]">
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

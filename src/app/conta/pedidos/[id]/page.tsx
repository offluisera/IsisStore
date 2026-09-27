import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PedidoDetalhesPageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetalhesPage({
  params,
}: PedidoDetalhesPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/conta/pedidos/${id}`);
  }

  // 1. Buscar pedido estritamente do usuário atual (Garantia do Gate 07)
  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      subtotal_cents,
      discount_cents,
      shipping_cents,
      total_cents,
      shipping_address,
      notes,
      created_at,
      updated_at,
      order_items (
        id,
        product_id,
        product_name,
        sku,
        quantity,
        unit_price_cents,
        subtotal_cents
      )
    `)
    .eq("id", id)
    .eq("customer_id", user.id) // Proteção RLS explícita
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Timeline de progresso do pedido
  const statusSteps = [
    { key: "pending", label: "Pedido Realizado" },
    { key: "paid", label: "Pagamento Confirmado" },
    { key: "shipped", label: "Pedido Enviado" },
    { key: "delivered", label: "Entregue" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending_payment":
      case "pending":
        return 0;
      case "paid":
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  // Endereço de entrega formatado a partir do snapshot JSON
  const address = order.shipping_address as {
    recipient_name?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  } | null;

  return (
    <div className="space-y-8">
      {/* Botão Voltar + Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borda/60">
        <div>
          <Link
            href="/conta/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-texto-claro hover:text-primaria transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar aos pedidos</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-texto-escuro">
              Pedido #{order.order_number}
            </h1>
            {isCancelled ? (
              <Badge variant="destructive">Pedido Cancelado</Badge>
            ) : (
              <Badge variant="secondary" className="bg-primaria-soft text-primaria font-semibold border-primaria-border">
                {order.status === "delivered"
                  ? "Entregue"
                  : order.status === "shipped"
                  ? "Enviado"
                  : order.status === "paid"
                  ? "Pagamento Aprovado"
                  : "Aguardando Pagamento"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-texto-claro mt-1">
            Realizado em {formatDate(order.created_at)}
          </p>
        </div>

        <Link
          href="/contato"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "text-xs font-semibold self-start sm:self-auto",
          })}
        >
          Precisa de Ajuda?
        </Link>
      </div>

      {/* Timeline de Rastreio (se não cancelado) */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl border border-borda p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif text-base font-bold text-texto-escuro mb-6">
            Status do Pedido
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                      isCompleted
                        ? "bg-primaria text-white shadow-xs"
                        : "bg-fundo text-texto-claro border border-borda"
                    } ${isCurrent ? "ring-4 ring-primaria/20 scale-105" : ""}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs ${
                      isCompleted
                        ? "font-semibold text-texto-escuro"
                        : "text-texto-claro"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Itens do Pedido + Endereço & Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Itens Comprados */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-borda p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-texto-escuro pb-4 border-b border-borda/60 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primaria" />
              <span>Itens Comprados</span>
            </h2>

            <div className="divide-y divide-borda/60">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-serif text-sm font-semibold text-texto-escuro">
                      {item.product_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-texto-claro mt-0.5">
                      <span>SKU: {item.sku}</span>
                      <span>&bull;</span>
                      <span>Qtd: {item.quantity}</span>
                      <span>&bull;</span>
                      <span>Unitário: {formatPrice(item.unit_price_cents)}</span>
                    </div>
                  </div>

                  <span className="font-serif text-base font-bold text-primaria self-end sm:self-auto">
                    {formatPrice(item.subtotal_cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Endereço, Pagamento e Resumo Financeiro */}
        <div className="lg:col-span-4 space-y-6">
          {/* Endereço de Entrega */}
          <div className="bg-white rounded-3xl border border-borda p-6 shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-texto-escuro flex items-center gap-2 pb-2 border-b border-borda/60">
              <MapPin className="w-4 h-4 text-primaria" />
              <span>Endereço de Entrega</span>
            </h3>

            {address ? (
              <div className="text-xs text-texto-medio space-y-1">
                <p className="font-semibold text-texto-escuro">
                  {address.recipient_name || "Destinatário"}
                </p>
                <p>
                  {address.street}, {address.number}
                  {address.complement ? ` — ${address.complement}` : ""}
                </p>
                <p>
                  {address.neighborhood} &bull; {address.city} - {address.state}
                </p>
                <p className="text-texto-claro font-mono pt-1">
                  CEP: {address.postal_code}
                </p>
              </div>
            ) : (
              <p className="text-xs text-texto-claro">Endereço não disponível.</p>
            )}
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-white rounded-3xl border border-borda p-6 shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-texto-escuro flex items-center gap-2 pb-2 border-b border-borda/60">
              <CreditCard className="w-4 h-4 text-primaria" />
              <span>Resumo do Pagamento</span>
            </h3>

            <div className="space-y-2 text-xs text-texto-medio">
              <div className="flex justify-between">
                <span>Subtotal dos produtos</span>
                <span className="font-semibold text-texto-escuro">
                  {formatPrice(order.subtotal_cents)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-semibold text-texto-escuro">
                  {order.shipping_cents === 0
                    ? "Grátis"
                    : formatPrice(order.shipping_cents)}
                </span>
              </div>

              {order.discount_cents > 0 && (
                <div className="flex justify-between text-sucesso font-semibold">
                  <span>Desconto</span>
                  <span>-{formatPrice(order.discount_cents)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-borda flex justify-between items-baseline font-bold text-texto-escuro">
                <span className="text-sm">Total Pago</span>
                <span className="font-serif text-xl text-primaria">
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

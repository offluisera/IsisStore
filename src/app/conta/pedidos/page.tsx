import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Meus Pedidos | Isis Store",
  description: "Histórico completo dos seus pedidos na Isis Store.",
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta/pedidos");
  }

  // Buscar todos os pedidos do usuário com itens associados
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      subtotal_cents,
      discount_cents,
      shipping_cents,
      total_cents,
      created_at,
      order_items (
        id,
        quantity,
        product_name
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Entregue</Badge>;
      case "shipped":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Enviado</Badge>;
      case "paid":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Pagamento Aprovado</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Aguardando Pagamento</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borda/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-texto-escuro">
            Meus Pedidos
          </h1>
          <p className="text-xs text-texto-claro mt-1">
            Consulte o status e histórico de todas as suas compras.
          </p>
        </div>

        <Link
          href="/produtos"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "text-xs font-semibold gap-1.5 self-start sm:self-auto",
          })}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Fazer Nova Compra</span>
        </Link>
      </div>

      {/* Lista de Pedidos ou Estado Vazio */}
      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-borda p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-primaria-soft text-primaria flex items-center justify-center mb-4 border border-primaria/20 shadow-xs">
            <Package className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-xl font-bold text-texto-escuro">
            Nenhum pedido encontrado
          </h2>
          <p className="text-xs sm:text-sm text-texto-claro max-w-sm mt-1 mb-6 leading-relaxed">
            Você ainda não realizou compras em nossa loja. Escolha seus mimos favoritos e aproveite!
          </p>
          <Link
            href="/produtos"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "text-xs font-semibold gap-2 shadow-xs",
            })}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemsCount =
              order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-borda p-5 sm:p-6 shadow-xs hover:border-primaria/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Informações Básicas do Pedido */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-serif text-lg font-bold text-texto-escuro">
                      Pedido #{order.order_number}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-texto-claro">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-texto-claro" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <span>&bull;</span>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-texto-claro" />
                      <span>{itemsCount} {itemsCount === 1 ? "item" : "itens"}</span>
                    </div>
                  </div>

                  {/* Resumo dos produtos */}
                  <p className="text-xs text-texto-medio line-clamp-1">
                    {order.order_items
                      ?.map((i) => `${i.quantity}x ${i.product_name}`)
                      .join(", ") || "Itens do pedido"}
                  </p>
                </div>

                {/* Total e Ação */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-borda/60">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-texto-claro block">Valor Total</span>
                    <span className="font-serif text-lg font-bold text-primaria">
                      {formatPrice(order.total_cents)}
                    </span>
                  </div>

                  <Link
                    href={`/conta/pedidos/${order.id}`}
                    className={buttonVariants({
                      variant: "default",
                      size: "sm",
                      className: "text-xs font-semibold gap-1.5 shadow-xs",
                    })}
                  >
                    <span>Ver Detalhes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

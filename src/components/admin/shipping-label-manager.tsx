"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
  MapPin,
  User,
  Package,
  X,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { markOrderLabelGeneratedAction } from "@/features/admin/actions";

export interface ShippingAddressData {
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

export interface ShippingOrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

export interface ShippingOrder {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
  label_generated: boolean;
  label_generated_at: string | null;
  shipping_address: ShippingAddressData | null;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  order_items: ShippingOrderItem[];
}

interface ShippingLabelManagerProps {
  orders: ShippingOrder[];
}

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  pending_payment: {
    label: "Aguardando Pagamento",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  paid: {
    label: "Pago",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  processing: {
    label: "Em Separação",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  shipped: {
    label: "Enviado",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Entregue",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
  },
  refunded: {
    label: "Reembolsado",
    badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
};

export function ShippingLabelManager({ orders }: ShippingLabelManagerProps) {
  const [selectedOrder, setSelectedOrder] = React.useState<ShippingOrder | null>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [localOrders, setLocalOrders] = React.useState(orders);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sincroniza se orders mudar externamente
  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

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

  const formatCep = (cep?: string) => {
    if (!cep) return "Não informado";
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  };

  const handleOpenLabelModal = (order: ShippingOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handlePrintLabel = async () => {
    if (!selectedOrder) return;
    setIsPrinting(true);
    setFeedback(null);

    try {
      // 1. Marca como gerada no banco de dados
      const res = await markOrderLabelGeneratedAction(selectedOrder.id);

      if (res.success) {
        // Atualiza estado local
        setLocalOrders((prev) =>
          prev.map((ord) =>
            ord.id === selectedOrder.id
              ? {
                  ...ord,
                  label_generated: true,
                  label_generated_at: new Date().toISOString(),
                }
              : ord
          )
        );

        setSelectedOrder((prev) =>
          prev ? { ...prev, label_generated: true, label_generated_at: new Date().toISOString() } : null
        );

        setFeedback({
          type: "success",
          message: "Etiqueta gerada com sucesso! Enviando para impressão...",
        });

        // 2. Dispara a caixa de impressão do navegador
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Ocorreu uma falha ao registrar a etiqueta no servidor.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      {/* Estilos específicos para impressão limpa de etiquetas de despacho */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-label-container,
          #print-label-container * {
            visibility: visible !important;
          }
          #print-label-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 140mm !important;
            margin: 0 auto !important;
            padding: 10px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 2px solid black !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-texto-claro hover:text-texto-escuro"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabela de Pedidos para Expedição e Etiquetas */}
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Status da Etiqueta</th>
                <th className="px-5 py-3.5">Pedido</th>
                <th className="px-5 py-3.5">Destinatário & Endereço</th>
                <th className="px-5 py-3.5">Itens a Enviar</th>
                <th className="px-5 py-3.5">Status do Pedido</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {localOrders.length > 0 ? (
                localOrders.map((ord) => {
                  const statusInfo = STATUS_MAP[ord.status] || {
                    label: ord.status,
                    badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
                  };

                  const addr = ord.shipping_address;
                  const recipientName =
                    addr?.recipient_name ||
                    ord.profiles?.full_name ||
                    "Destinatário não informado";

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-fundo/30 transition-colors"
                    >
                      {/* 1. MENSAGEM / STATUS DA ETIQUETA NA FRENTE DO PEDIDO */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {ord.label_generated ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Pedido com etiqueta gerada</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Aguardando geração</span>
                          </div>
                        )}
                      </td>

                      {/* 2. PEDIDO */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria/20">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-texto-escuro">
                              #{ord.order_number}
                            </p>
                            <p className="text-[11px] text-texto-claro font-mono">
                              {formatDate(ord.created_at)}
                            </p>
                            <p className="text-[11px] font-semibold text-primaria">
                              {formatPrice(ord.total_cents)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3. DESTINATÁRIO & ENDEREÇO */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-texto-escuro">
                          {recipientName}
                        </p>
                        {addr?.street ? (
                          <p className="text-[11px] text-texto-claro mt-0.5 line-clamp-2 max-w-xs">
                            {addr.street}, {addr.number || "S/N"}
                            {addr.complement ? ` - ${addr.complement}` : ""}
                            <br />
                            {addr.neighborhood ? `${addr.neighborhood}, ` : ""}
                            {addr.city} - {addr.state} • CEP {formatCep(addr.postal_code)}
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-600 italic">
                            Endereço pendente de preenchimento
                          </p>
                        )}
                      </td>

                      {/* 4. ITENS DO PACOTE */}
                      <td className="px-5 py-4 text-texto-medio">
                        <div className="flex flex-col gap-1 max-w-xs">
                          {ord.order_items && ord.order_items.length > 0 ? (
                            ord.order_items.map((item) => (
                              <span
                                key={item.id}
                                className="text-xs text-texto-escuro font-medium"
                              >
                                • {item.product_name}{" "}
                                <span className="text-texto-claro font-normal">
                                  ({item.quantity}x)
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-texto-claro italic">Sem itens</span>
                          )}
                        </div>
                      </td>

                      {/* 5. STATUS DO PEDIDO */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* 6. AÇÕES */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenLabelModal(ord)}
                            className="h-8 px-3 text-[11px] bg-primaria hover:bg-primaria-dark text-white gap-1.5 shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>
                              {ord.label_generated ? "Reimprimir Etiqueta" : "Imprimir Etiqueta"}
                            </span>
                          </Button>

                          <Link
                            href={`/admin/pedidos/${ord.id}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "text-[11px] h-8 px-2.5",
                            })}
                            title="Ver detalhes completos do pedido"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-texto-claro">
                    Nenhum pedido pago aguardando geração de etiqueta no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / VISUALIZADOR DE ETIQUETA DE EMBALAGEM PARA IMPRESSÃO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl border border-borda shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="p-4 border-b border-borda flex items-center justify-between bg-fundo/40">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-primaria" />
                <h3 className="font-serif font-bold text-texto-escuro text-sm">
                  Etiqueta de Envio • Pedido #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-texto-claro hover:text-texto-escuro hover:bg-borda/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo / Visualizador da Etiqueta Padrão Correios / Transportadora */}
            <div className="p-6">
              <div
                id="print-label-container"
                className="border-2 border-neutral-900 rounded-lg p-5 bg-white text-neutral-900 font-sans text-xs space-y-4 shadow-sm"
              >
                {/* Cabeçalho da Etiqueta Postal */}
                <div className="border-b-2 border-neutral-900 pb-3 flex items-center justify-between">
                  <div>
                    <h1 className="text-base font-extrabold tracking-tight">ISIS STORE</h1>
                    <p className="text-[10px] text-neutral-600 uppercase font-semibold">
                      Etiqueta de Despacho & Embalagem
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-neutral-900 text-white font-mono font-bold text-[11px] rounded">
                      PEDIDO #{selectedOrder.order_number}
                    </span>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      Envio:{" "}
                      {(selectedOrder.shipping_address?.shipping_method || "PADRAO").toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Bloco DESTINATÁRIO */}
                <div className="bg-neutral-50 p-3.5 rounded border border-neutral-300 space-y-1">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1 mb-1">
                    <span className="font-bold text-[10px] uppercase text-neutral-500 tracking-wider">
                      Destinatário
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      CEP: {formatCep(selectedOrder.shipping_address?.postal_code)}
                    </span>
                  </div>

                  <p className="text-sm font-bold uppercase text-neutral-950">
                    {selectedOrder.shipping_address?.recipient_name ||
                      selectedOrder.profiles?.full_name ||
                      "Cliente Isis Store"}
                  </p>

                  <p className="text-xs text-neutral-800 leading-snug">
                    {selectedOrder.shipping_address?.street || "Logradouro não informado"},{" "}
                    {selectedOrder.shipping_address?.number || "S/N"}
                    {selectedOrder.shipping_address?.complement
                      ? ` (${selectedOrder.shipping_address.complement})`
                      : ""}
                  </p>

                  <p className="text-xs text-neutral-800">
                    Bairro: {selectedOrder.shipping_address?.neighborhood || "Centro"}
                  </p>

                  <p className="text-xs font-semibold text-neutral-900">
                    {selectedOrder.shipping_address?.city || "Cidade"} -{" "}
                    {selectedOrder.shipping_address?.state || "UF"}
                  </p>

                  <p className="text-[11px] text-neutral-600 font-mono pt-1">
                    Telefone:{" "}
                    {selectedOrder.shipping_address?.phone ||
                      selectedOrder.profiles?.phone ||
                      "Não informado"}
                  </p>
                </div>

                {/* Bloco REMETENTE */}
                <div className="p-3 rounded border border-neutral-200 text-[11px] text-neutral-700 space-y-0.5">
                  <span className="font-bold text-[9px] uppercase text-neutral-400 tracking-wider block">
                    Remetente
                  </span>
                  <p className="font-bold text-neutral-900">ISIS STORE OFICIAL</p>
                  <p>Centro Logístico e Distribuição</p>
                  <p>Bandeira do Sul - MG • CEP: 37740-000</p>
                  <p className="text-[10px] text-neutral-500">contato@isisstore.com.br</p>
                </div>

                {/* Declaração de Conteúdo Resumida */}
                <div className="border border-dashed border-neutral-300 p-2.5 rounded text-[10px] space-y-1">
                  <span className="font-bold uppercase text-neutral-500 block">
                    Declaração de Conteúdo da Embalagem:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-neutral-800">
                    {selectedOrder.order_items?.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.product_name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-right font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                    Valor Declarado: {formatPrice(selectedOrder.total_cents)}
                  </p>
                </div>

                {/* Código de Barras Postal Simulado */}
                <div className="pt-2 text-center border-t border-neutral-200">
                  <div className="h-10 w-full flex items-center justify-center gap-1">
                    {/* Linhas de código de barras Code 128 */}
                    <div className="h-full w-1 bg-neutral-900"></div>
                    <div className="h-full w-0.5 bg-neutral-900"></div>
                    <div className="h-full w-2 bg-neutral-900"></div>
                    <div className="h-full w-0.5 bg-neutral-900"></div>
                    <div className="h-full w-1 bg-neutral-900"></div>
                    <div className="h-full w-1.5 bg-neutral-900"></div>
                    <div className="h-full w-0.5 bg-neutral-900"></div>
                    <div className="h-full w-2.5 bg-neutral-900"></div>
                    <div className="h-full w-1 bg-neutral-900"></div>
                    <div className="h-full w-0.5 bg-neutral-900"></div>
                    <div className="h-full w-2 bg-neutral-900"></div>
                    <div className="h-full w-1 bg-neutral-900"></div>
                    <div className="h-full w-0.5 bg-neutral-900"></div>
                    <div className="h-full w-1.5 bg-neutral-900"></div>
                    <div className="h-full w-2 bg-neutral-900"></div>
                    <div className="h-full w-0.5 bg-neutral-900"></div>
                    <div className="h-full w-1 bg-neutral-900"></div>
                    <div className="h-full w-2 bg-neutral-900"></div>
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-neutral-600 mt-1">
                    *{selectedOrder.order_number.replace(/\D/g, "") || selectedOrder.id.slice(0, 10)}*
                  </p>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="p-4 border-t border-borda flex items-center justify-between bg-fundo/40">
              <div className="text-xs">
                {selectedOrder.label_generated ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Etiqueta já gerada anteriormente
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Ao imprimir, o pedido será marcado como &quot;com etiqueta gerada&quot;.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isPrinting}
                  className="h-8 text-xs"
                >
                  Fechar
                </Button>
                <Button
                  size="sm"
                  onClick={handlePrintLabel}
                  disabled={isPrinting}
                  className="h-8 text-xs bg-primaria hover:bg-primaria-dark text-white gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPrinting ? "Registrando..." : "Imprimir Etiqueta"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

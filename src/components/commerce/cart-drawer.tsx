"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/cart-context";
import { cn } from "@/lib/utils";

export interface CartItemData {
  id: string;
  name: string;
  price: number; // Em centavos
  quantity: number;
  imageUrl: string;
}

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  items?: CartItemData[];
  onUpdateQuantity?: (id: string, newQty: number) => void;
  onRemoveItem?: (id: string) => void;
}

const noop = () => {};

export function CartDrawer(props: CartDrawerProps) {
  let cartContext: ReturnType<typeof useCart> | null = null;
  try {
    // Permite uso com contexto global ou propriedades controladas
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartContext = useCart();
  } catch {
    cartContext = null;
  }

  const isOpen =
    props.isOpen !== undefined ? props.isOpen : (cartContext?.isOpen ?? false);
  const onClose = props.onClose ?? cartContext?.closeCart ?? noop;
  const items =
    props.items !== undefined ? props.items : (cartContext?.items ?? []);
  const onUpdateQuantity =
    props.onUpdateQuantity || cartContext?.updateQuantity;
  const onRemoveItem = props.onRemoveItem || cartContext?.removeItem;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const subtotalCents = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const freeShippingThreshold = 19900; // R$ 199,00
  const missingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotalCents
  );
  const freeShippingProgress = Math.min(
    100,
    (subtotalCents / freeShippingThreshold) * 100
  );

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-hidden transition-all duration-300",
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop com transição suave de opacidade e blur */}
      <div
        className={cn(
          "fixed inset-0 bg-texto-escuro/40 backdrop-blur-xs transition-opacity duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10 pointer-events-none">
        <div
          className={cn(
            "w-screen max-w-md bg-fundo-card border-l border-borda shadow-2xl flex flex-col justify-between pointer-events-auto transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-borda-suave flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primaria" />
              <h2 className="font-serif text-xl font-bold text-texto-escuro">
                Meu Carrinho
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primaria-soft text-primaria font-semibold border border-primaria-border">
                {items.reduce((acc, i) => acc + i.quantity, 0)} itens
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-texto-claro hover:bg-primaria-soft hover:text-primaria transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso de Frete Grátis */}
          <div className="px-6 py-3.5 bg-fundo border-b border-borda-suave text-xs">
            {missingForFreeShipping === 0 ? (
              <p className="font-semibold text-sucesso flex items-center gap-1.5">
                🎉 Parabéns! Você ganhou <strong>Frete Grátis</strong>!
              </p>
            ) : (
              <p className="text-texto-medio">
                Faltam apenas{" "}
                <strong className="text-primaria">
                  {formatPrice(missingForFreeShipping)}
                </strong>{" "}
                para <strong>Frete Grátis</strong>!
              </p>
            )}
            <div className="mt-2 h-1.5 w-full rounded-full bg-borda overflow-hidden">
              <div
                className="h-full bg-primaria transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Lista de Itens ou Estado Vazio */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-16 h-16 rounded-full bg-primaria-soft text-primaria flex items-center justify-center mb-4 border border-primaria-border">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-texto-escuro mb-1">
                  Seu carrinho está vazio
                </h3>
                <p className="text-xs text-texto-claro max-w-xs mb-6 leading-relaxed">
                  Que tal explorar nossos mimos e adicionar algo especial ao seu dia?
                </p>
                <Button onClick={onClose} variant="default" className="text-xs">
                  Explorar produtos
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-2xl border border-borda bg-fundo/40 transition-all hover:border-primaria-border"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white border border-borda">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-texto-claro">
                        <ShoppingBag className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-bold text-texto-escuro truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-semibold text-primaria mt-0.5">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantidade */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-borda bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity?.(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-1 hover:text-primaria text-texto-medio transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-texto-escuro">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity?.(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:text-primaria text-texto-medio transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        className="text-texto-claro hover:text-erro p-1 transition-colors"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com Subtotal e Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-borda-suave bg-white space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-texto-medio text-xs">
                  <span>Subtotal</span>
                  <span className="font-semibold text-texto-escuro">
                    {formatPrice(subtotalCents)}
                  </span>
                </div>
                <div className="flex justify-between text-texto-medio text-xs">
                  <span>Frete</span>
                  <span className="font-semibold text-sucesso">
                    {missingForFreeShipping === 0
                      ? "Grátis"
                      : "Calculado no checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-texto-escuro pt-2 border-t border-borda-suave">
                  <span>Total</span>
                  <span className="font-serif text-xl text-primaria">
                    {formatPrice(subtotalCents)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/carrinho"
                  onClick={onClose}
                  className="w-full text-center text-xs font-semibold text-primaria hover:underline py-1"
                >
                  Ver Carrinho Completo
                </Link>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full"
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full gap-2 shadow-sm font-semibold"
                  >
                    Finalizar compra
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

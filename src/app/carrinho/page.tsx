"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/cart-context";
import { useStoreSettings } from "@/lib/settings/store-settings-context";

export default function CarrinhoPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalCents,
    itemsCount,
  } = useCart();

  const [coupon, setCoupon] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState<number | null>(
    null
  );
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const storeSettings = useStoreSettings();
  const freeShippingThreshold = storeSettings.free_shipping_threshold_cents || 19900;
  const isFreeShipping = subtotalCents >= freeShippingThreshold;
  const missingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotalCents
  );

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!coupon.trim()) return;

    if (coupon.trim().toUpperCase() === "ISIS10") {
      setAppliedDiscount(Math.round(subtotalCents * 0.1));
    } else {
      setCouponError("Cupom inválido ou expirado.");
    }
  };

  const finalTotalCents = Math.max(0, subtotalCents - (appliedDiscount || 0));

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between selection:bg-primaria-soft selection:text-primaria">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-texto-claro">
            <li>
              <Link href="/" className="hover:text-primaria transition-colors">
                Início
              </Link>
            </li>
            <li>&gt;</li>
            <li className="font-semibold text-texto-escuro" aria-current="page">
              Carrinho de Compras
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-texto-escuro tracking-tight">
              Meu Carrinho
            </h1>
            <p className="text-xs sm:text-sm text-texto-claro mt-1">
              Revise seus itens antes de prosseguir para o pagamento seguro.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-texto-claro hover:text-erro transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar carrinho</span>
            </button>
          )}
        </div>

        {/* Estado Vazio ou Lista */}
        {items.length === 0 ? (
          <div className="bg-fundo-card rounded-3xl border border-borda p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-xs my-8">
            <div className="w-20 h-20 rounded-full bg-primaria-soft text-primaria flex items-center justify-center mb-5 border border-primaria/20 shadow-xs">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-texto-escuro">
              Seu carrinho está vazio
            </h2>
            <p className="text-xs sm:text-sm text-texto-claro max-w-md mt-2 mb-8 leading-relaxed">
              Você ainda não adicionou nenhum item. Conheça nossos produtos e aproveite frete grátis em compras acima de {formatPrice(freeShippingThreshold)}!
            </p>
            <Link
              href="/produtos"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "gap-2 shadow-sm font-semibold",
              })}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explorar Produtos</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Coluna Esquerda: Itens do Carrinho */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Barra de Frete Grátis */}
              <div className="p-4 rounded-2xl bg-fundo-card border border-borda shadow-xs text-xs">
                {isFreeShipping ? (
                  <p className="font-semibold text-sucesso flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Parabéns! Você atingiu o valor para Frete Grátis!</span>
                  </p>
                ) : (
                  <p className="text-texto-medio flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primaria shrink-0" />
                    <span>
                      Adicione mais{" "}
                      <strong className="text-primaria">
                        {formatPrice(missingForFreeShipping)}
                      </strong>{" "}
                      em compras para liberar o <strong>Frete Grátis</strong>.
                    </span>
                  </p>
                )}
              </div>

              {/* Tabela de Produtos */}
              <div className="bg-fundo-card rounded-2xl border border-borda shadow-xs divide-y divide-borda/60 overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-fundo/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-fundo border border-borda">
                        <Image
                          src={item.imageUrl || "/images/logo/logo.jpeg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        {item.slug ? (
                          <Link
                            href={`/produtos/${item.slug}`}
                            className="font-serif text-base font-semibold text-texto-escuro hover:text-primaria transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <p className="font-serif text-base font-semibold text-texto-escuro line-clamp-1">
                            {item.name}
                          </p>
                        )}
                        <p className="text-xs text-texto-claro mt-0.5">
                          Unitário: {formatPrice(item.price)}
                        </p>

                        {item.customization && (
                          <div className="mt-2 p-2.5 rounded-xl bg-primaria-soft/40 border border-primaria/15 text-xs max-w-md space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-primaria">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>Personalização do Produto:</span>
                            </div>
                            {item.customization.text && (
                              <p className="text-texto-escuro italic">
                                &ldquo;{item.customization.text}&rdquo;
                              </p>
                            )}
                            {item.customization.imageUrl && (
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[11px] text-texto-medio">📷 Foto anexada:</span>
                                <a
                                  href={item.customization.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-primaria font-semibold hover:underline"
                                >
                                  Ver imagem original
                                </a>
                              </div>
                            )}
                            {item.customization.notes && (
                              <p className="text-[11px] text-texto-claro">
                                <strong>Obs:</strong> {item.customization.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-borda/60">
                      {/* Seletor de Quantidade */}
                      <div className="flex items-center rounded-xl border border-borda bg-input-fundo">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="p-2 text-texto-medio hover:text-primaria transition-colors touch-manipulation"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs font-semibold text-texto-escuro">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-texto-medio hover:text-primaria transition-colors touch-manipulation"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal do Item */}
                      <span className="font-serif text-sm sm:text-base font-bold text-primaria min-w-[65px] sm:min-w-[80px] text-right">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Remover Item */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-texto-claro hover:text-erro p-2 transition-colors cursor-pointer touch-manipulation"
                        aria-label="Remover produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Voltar às Compras */}
              <div className="pt-2">
                <Link
                  href="/produtos"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-texto-claro hover:text-primaria transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continuar comprando mais produtos</span>
                </Link>
              </div>
            </div>

            {/* Coluna Direita: Resumo do Pedido */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Card de Resumo */}
              <div className="bg-fundo-card rounded-2xl border border-borda p-6 shadow-xs flex flex-col gap-4">
                <h2 className="font-serif text-lg font-bold text-texto-escuro border-b border-borda pb-3">
                  Resumo do Pedido
                </h2>

                <div className="flex flex-col gap-2.5 text-xs text-texto-medio">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemsCount} itens)</span>
                    <span className="font-semibold text-texto-escuro">
                      {formatPrice(subtotalCents)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span
                      className={`font-semibold ${
                        isFreeShipping ? "text-sucesso" : "text-texto-escuro"
                      }`}
                    >
                      {isFreeShipping ? "Grátis" : "Calculado no checkout"}
                    </span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-sucesso font-semibold">
                      <span>Desconto Cupom (ISIS10)</span>
                      <span>-{formatPrice(appliedDiscount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-borda flex justify-between items-baseline text-base font-bold text-texto-escuro">
                    <span>Total Estimado</span>
                    <span className="font-serif text-2xl text-primaria">
                      {formatPrice(finalTotalCents)}
                    </span>
                  </div>
                </div>

                {/* Cupom de Desconto */}
                <form
                  onSubmit={handleApplyCoupon}
                  className="flex gap-2 pt-2 border-t border-borda/60"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cupom: ISIS10"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full h-10 pl-8 pr-2 rounded-xl border border-borda text-xs uppercase outline-none focus:border-primaria"
                    />
                    <Tag className="w-3.5 h-3.5 text-texto-claro absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button type="submit" variant="secondary" size="sm" className="text-xs px-3">
                    Aplicar
                  </Button>
                </form>
                {couponError && (
                  <p className="text-[11px] text-erro">{couponError}</p>
                )}

                {/* Botão Finalizar Compra */}
                <Link
                  href="/checkout"
                  className={buttonVariants({
                    variant: "default",
                    size: "lg",
                    className: "w-full gap-2 shadow-sm font-semibold mt-2",
                  })}
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Selos de Confiança */}
                <div className="pt-3 border-t border-borda/60 flex flex-col gap-2 text-[11px] text-texto-claro">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sucesso shrink-0" />
                    <span>Checkout 100% protegido com SSL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primaria shrink-0" />
                    <span>Envio com código de rastreamento oficial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      <BottomNav />
    </div>
  );
}

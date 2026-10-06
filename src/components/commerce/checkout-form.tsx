"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  CreditCard,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Tag,
  ArrowRight,
  AlertCircle,
  Plus,
  MessageCircle,
  Zap,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/cart-context";
import { useStoreSettings } from "@/lib/settings/store-settings-context";
import { createOrderAction } from "@/features/checkout/actions";
import { validateCouponAction } from "@/features/coupons/actions";
import { AddressForm } from "@/components/account/address-form";

interface AddressOption {
  id: string;
  recipient_name: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

interface CheckoutFormProps {
  addresses: AddressOption[];
  userEmail: string;
  userName: string;
  activeGateways?: string[];
}

export function CheckoutForm({
  addresses,
  userEmail,
  userName,
  activeGateways,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const isMercadoPagoActive = activeGateways
    ? activeGateways.includes("mercadopago")
    : true;
  const isInfinitePayActive = activeGateways
    ? activeGateways.includes("infinitepay")
    : false;
  const isWhatsAppActive = activeGateways
    ? activeGateways.includes("whatsapp")
    : true;

  const initialMethod = isMercadoPagoActive
    ? "pix"
    : isInfinitePayActive
    ? "infinitepay"
    : isWhatsAppActive
    ? "whatsapp"
    : "pix";

  // Estados do Checkout
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>(
    addresses.find((a) => a.is_default)?.id || addresses[0]?.id || ""
  );
  const [shippingMethod, setShippingMethod] = React.useState<"pac" | "sedex">("pac");
  const [paymentMethod, setPaymentMethod] = React.useState<
    "pix" | "credit_card" | "whatsapp" | "infinitepay"
  >(initialMethod);
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discount_cents: number;
    description?: string | null;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Cálculos financeiros
  const subtotalCents = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const storeSettings = useStoreSettings();
  const freeShippingThreshold = storeSettings.free_shipping_threshold_cents || 19900;
  const isFreeShipping = subtotalCents >= freeShippingThreshold;

  const shippingCents =
    shippingMethod === "sedex" ? 2990 : isFreeShipping ? 0 : 1890;

  // Desconto dinâmico do cupom validado
  const discountCents = appliedCoupon ? appliedCoupon.discount_cents : 0;

  // Desconto Pix de 5% sobre produtos
  const pixDiscountCents =
    paymentMethod === "pix"
      ? Math.round((subtotalCents - discountCents) * 0.05)
      : 0;

  const totalDiscountCents = discountCents + pixDiscountCents;
  const finalTotalCents = Math.max(
    0,
    subtotalCents + shippingCents - totalDiscountCents
  );

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    setIsApplyingCoupon(true);
    try {
      const res = await validateCouponAction(clean, subtotalCents);
      if (res.valid && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount_cents: res.coupon.discount_cents,
          description: res.coupon.description,
        });
        setCouponSuccess(res.message);
        setCouponCode("");
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message || "Cupom inválido ou expirado.");
      }
    } catch {
      setCouponError("Falha ao comunicar com o servidor para validar cupom.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

  const handleFinishOrder = async () => {
    if (!selectedAddressId) {
      setErrorMessage("Por favor, selecione ou cadastre um endereço de entrega.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Seu carrinho está vazio.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      addressId: selectedAddressId,
      shippingMethod,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId || i.id,
        quantity: i.quantity,
        customization: i.customization,
      })),
    };

    const res = await createOrderAction(payload);

    if (res.success && res.orderId) {
      clearCart();
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
        router.push(
          `/checkout/sucesso?orderId=${res.orderId}&orderNumber=${res.orderNumber || ""}&wa=1&waUrl=${encodeURIComponent(res.whatsappUrl)}`
        );
      } else if (res.paymentRedirectUrl && !res.paymentRedirectUrl.includes("/checkout/sucesso")) {
        // Redireciona o cliente diretamente para a página de pagamento do gateway Mercado Pago (Sandbox ou Produção)
        window.location.href = res.paymentRedirectUrl;
      } else {
        router.push(
          `/checkout/sucesso?orderId=${res.orderId}&orderNumber=${res.orderNumber || ""}`
        );
      }
    } else {
      setIsSubmitting(false);
      setErrorMessage(res.message || "Erro ao processar pedido. Tente novamente.");
    }
  };

  // Se o carrinho estiver vazio
  if (items.length === 0) {
    return (
      <div className="bg-fundo-card rounded-3xl border border-borda p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-primaria-soft text-primaria flex items-center justify-center mb-4 border border-primaria/20 shadow-xs">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-texto-escuro">
          Seu carrinho está vazio
        </h2>
        <p className="text-xs sm:text-sm text-texto-claro max-w-sm mt-1 mb-6 leading-relaxed">
          Adicione produtos ao seu carrinho antes de prosseguir para a finalização da compra.
        </p>
        <Link
          href="/produtos"
          className={buttonVariants({
            variant: "default",
            size: "default",
            className: "text-xs font-semibold gap-2 shadow-xs",
          })}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ver Produtos</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      {/* Coluna Esquerda: Passos do Checkout */}
      <div className="lg:col-span-7 space-y-6">
        {/* Banner de Erro Geral */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-erro/10 border border-erro/20 flex items-start gap-3 text-erro text-xs font-medium animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Atenção</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Identificação do Cliente */}
        <div className="bg-fundo-card rounded-3xl border border-borda p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-borda/60">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-primaria text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-serif text-base font-bold text-texto-escuro">
                Identificação do Cliente
              </h2>
            </div>
            <Link
              href="/conta"
              className="text-xs text-primaria font-semibold hover:underline"
            >
              Minha Conta
            </Link>
          </div>

          <div className="text-xs text-texto-medio flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <p className="font-semibold text-texto-escuro">{userName}</p>
              <p className="text-texto-claro">{userEmail}</p>
            </div>
            <span className="text-[11px] text-sucesso font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Sessão segura
            </span>
          </div>
        </div>

        {/* 2. Endereço de Entrega */}
        <div className="bg-fundo-card rounded-3xl border border-borda p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borda/60">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-primaria text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-serif text-base font-bold text-texto-escuro">
                Endereço de Entrega
              </h2>
            </div>
            <Link
              href="/conta/enderecos"
              className="text-xs text-primaria font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gerenciar Endereços</span>
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-texto-claro">
                Você ainda não possui nenhum endereço salvo. Cadastre um endereço para entrega:
              </p>
              <AddressForm />
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;

                return (
                  <label
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primaria bg-primaria-soft/40 shadow-xs ring-2 ring-primaria/20"
                        : "border-borda hover:border-borda-hover bg-fundo-card"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-primaria focus:ring-primaria"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-texto-escuro text-sm">
                            {addr.recipient_name}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] uppercase font-bold text-primaria bg-primaria-soft px-2 py-0.5 rounded-full border border-primaria-border">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-texto-medio mt-1">
                          {addr.street}, {addr.number}
                          {addr.complement ? ` — ${addr.complement}` : ""}
                        </p>
                        <p className="text-texto-claro">
                          {addr.neighborhood} &bull; {addr.city} - {addr.state} &bull; CEP {addr.postal_code}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Opções de Frete */}
        <div className="bg-fundo-card rounded-3xl border border-borda p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borda/60">
            <span className="w-6 h-6 rounded-full bg-primaria text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-serif text-base font-bold text-texto-escuro">
              Método de Envio
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PAC */}
            <label
              onClick={() => setShippingMethod("pac")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                shippingMethod === "pac"
                  ? "border-primaria bg-primaria-soft/40 shadow-xs ring-2 ring-primaria/20"
                  : "border-borda hover:border-borda-hover bg-fundo-card"
              }`}
            >
              <input
                type="radio"
                name="shippingOption"
                checked={shippingMethod === "pac"}
                onChange={() => setShippingMethod("pac")}
                className="mt-1 text-primaria focus:ring-primaria"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-texto-escuro">
                    Entrega Padrão (PAC)
                  </span>
                  <span className="font-bold text-primaria">
                    {isFreeShipping ? "GRÁTIS" : "R$ 18,90"}
                  </span>
                </div>
                <p className="text-texto-claro text-[11px] mt-0.5">
                  Prazo de 5 a 8 dias úteis
                </p>
              </div>
            </label>

            {/* SEDEX */}
            <label
              onClick={() => setShippingMethod("sedex")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                shippingMethod === "sedex"
                  ? "border-primaria bg-primaria-soft/40 shadow-xs ring-2 ring-primaria/20"
                  : "border-borda hover:border-borda-hover bg-fundo-card"
              }`}
            >
              <input
                type="radio"
                name="shippingOption"
                checked={shippingMethod === "sedex"}
                onChange={() => setShippingMethod("sedex")}
                className="mt-1 text-primaria focus:ring-primaria"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-texto-escuro">
                    Entrega Expressa (SEDEX)
                  </span>
                  <span className="font-bold text-texto-escuro">R$ 29,90</span>
                </div>
                <p className="text-texto-claro text-[11px] mt-0.5">
                  Prazo de 1 a 3 dias úteis
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 4. Forma de Pagamento */}
        <div className="bg-fundo-card rounded-3xl border border-borda p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borda/60">
            <span className="w-6 h-6 rounded-full bg-primaria text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h2 className="font-serif text-base font-bold text-texto-escuro">
              Forma de Pagamento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pix */}
            {isMercadoPagoActive && (
              <label
                onClick={() => setPaymentMethod("pix")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "pix"
                    ? "border-primaria bg-primaria-soft/40 shadow-xs ring-2 ring-primaria/20"
                    : "border-borda hover:border-borda-hover bg-fundo-card"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === "pix"}
                  onChange={() => setPaymentMethod("pix")}
                  className="mt-1 text-primaria focus:ring-primaria"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-texto-escuro">
                    <QrCode className="w-4 h-4 text-sucesso" />
                    <span>Pix (5% OFF)</span>
                  </div>
                  <p className="text-texto-claro text-[11px] mt-1">
                    Aprovação instantânea
                  </p>
                </div>
              </label>
            )}

            {/* Cartão de Crédito */}
            {isMercadoPagoActive && (
              <label
                onClick={() => setPaymentMethod("credit_card")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "credit_card"
                    ? "border-primaria bg-primaria-soft/40 shadow-xs ring-2 ring-primaria/20"
                    : "border-borda hover:border-borda-hover bg-fundo-card"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === "credit_card"}
                  onChange={() => setPaymentMethod("credit_card")}
                  className="mt-1 text-primaria focus:ring-primaria"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-texto-escuro">
                    <CreditCard className="w-4 h-4 text-primaria" />
                    <span>Cartão</span>
                  </div>
                  <p className="text-texto-claro text-[11px] mt-1">
                    Até 10x sem juros
                  </p>
                </div>
              </label>
            )}

            {/* InfinitePay */}
            {isInfinitePayActive && (
              <label
                onClick={() => setPaymentMethod("infinitepay")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "infinitepay"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs ring-2 ring-amber-500/20"
                    : "border-borda hover:border-borda-hover bg-fundo-card"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === "infinitepay"}
                  onChange={() => setPaymentMethod("infinitepay")}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-texto-escuro">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                    <span>InfinitePay</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                      Até 12x
                    </span>
                  </div>
                  <p className="text-texto-claro text-[11px] mt-1">
                    Cartão até 12x ou Pix
                  </p>
                </div>
              </label>
            )}

            {/* WhatsApp */}
            {isWhatsAppActive && (
              <label
                onClick={() => setPaymentMethod("whatsapp")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "whatsapp"
                    ? "border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20"
                    : "border-borda hover:border-borda-hover bg-fundo-card"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === "whatsapp"}
                  onChange={() => setPaymentMethod("whatsapp")}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-texto-escuro">
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    <span>WhatsApp</span>
                  </div>
                  <p className="text-texto-claro text-[11px] mt-1">
                    Pedido direto com atendente
                  </p>
                </div>
              </label>
            )}
          </div>

          {!isMercadoPagoActive && !isInfinitePayActive && !isWhatsAppActive && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              Nenhum método de pagamento disponível no momento. Entre em contato com nossa equipe.
            </div>
          )}

          {/* Observações opcionais */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-texto-medio mb-1">
              Observações sobre a entrega (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Deixar na portaria com o zelador"
              value={notes}
              maxLength={200}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-borda text-xs outline-none focus:border-primaria bg-fundo/30"
            />
          </div>
        </div>
      </div>

      {/* Coluna Direita: Resumo Financeiro e Finalização */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-fundo-card rounded-3xl border border-borda p-6 sm:p-7 shadow-xs space-y-5 sticky top-24">
          <h2 className="font-serif text-lg font-bold text-texto-escuro pb-3 border-b border-borda/60 flex items-center justify-between">
            <span>Resumo da Compra</span>
            <span className="text-xs text-primaria font-semibold font-sans">
              {items.reduce((acc, i) => acc + i.quantity, 0)} itens
            </span>
          </h2>

          {/* Lista Compacta de Itens */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar divide-y divide-borda/60">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-borda bg-fundo">
                  <Image
                    src={item.imageUrl || "/images/logo/logo.jpeg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-serif font-bold text-texto-escuro truncate">
                    {item.name}
                  </p>
                  <p className="text-texto-claro text-[11px] mt-0.5">
                    {item.quantity}x {formatPrice(item.price)}
                  </p>
                  {item.customization && (
                    <div className="mt-1 text-[10px] text-primaria font-medium flex items-center gap-1 truncate">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {item.customization.text ? `"${item.customization.text}"` : "Personalizado com foto"}
                      </span>
                    </div>
                  )}
                </div>
                <span className="font-serif text-xs font-bold text-texto-escuro">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Cupom de Desconto */}
          {appliedCoupon ? (
            <div className="pt-3 border-t border-borda/60">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold uppercase tracking-wider">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-200/70 text-emerald-800 font-semibold">
                        -{formatPrice(appliedCoupon.discount_cents)}
                      </span>
                    </div>
                    {appliedCoupon.description && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {appliedCoupon.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-1.5 rounded-lg hover:bg-emerald-200/60 text-emerald-700 transition-colors"
                  title="Remover cupom"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-borda/60 space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cupom (ex: ISIS10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isApplyingCoupon}
                    className="w-full h-10 pl-8 pr-2 rounded-xl border border-borda text-xs uppercase outline-none focus:border-primaria bg-fundo/30 font-mono tracking-wider"
                  />
                  <Tag className="w-3.5 h-3.5 text-texto-claro absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="text-xs px-3 min-w-[70px]"
                >
                  {isApplyingCoupon ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </Button>
              </form>
              {couponError && (
                <p className="text-[11px] text-erro flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-sucesso flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  {couponSuccess}
                </p>
              )}
            </div>
          )}

          {/* Discriminação de Valores */}
          <div className="space-y-2.5 text-xs text-texto-medio pt-2 border-t border-borda/60">
            <div className="flex justify-between">
              <span>Subtotal dos produtos</span>
              <span className="font-semibold text-texto-escuro">
                {formatPrice(subtotalCents)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Frete ({shippingMethod.toUpperCase()})</span>
              <span
                className={`font-semibold ${
                  shippingCents === 0 ? "text-sucesso" : "text-texto-escuro"
                }`}
              >
                {shippingCents === 0 ? "Grátis" : formatPrice(shippingCents)}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-sucesso font-semibold">
                <span>Cupom ({appliedCoupon.code})</span>
                <span>-{formatPrice(discountCents)}</span>
              </div>
            )}

            {paymentMethod === "pix" && pixDiscountCents > 0 && (
              <div className="flex justify-between text-sucesso font-semibold">
                <span>Desconto Pix (5%)</span>
                <span>-{formatPrice(pixDiscountCents)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-borda flex justify-between items-baseline font-bold text-texto-escuro">
              <span className="text-sm">Total a Pagar</span>
              <span className="font-serif text-2xl text-primaria">
                {formatPrice(finalTotalCents)}
              </span>
            </div>
          </div>

          {/* Botão de Finalização com Proteção contra Duplo Clique */}
          <Button
            type="button"
            onClick={handleFinishOrder}
            disabled={
              isSubmitting ||
              addresses.length === 0 ||
              (!isMercadoPagoActive && !isWhatsAppActive)
            }
            variant="default"
            size="lg"
            isLoading={isSubmitting}
            className={`w-full font-semibold text-sm gap-2 shadow-sm mt-3 ${
              paymentMethod === "whatsapp"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                : ""
            }`}
          >
            {paymentMethod === "whatsapp" ? (
              <>
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>
                  {isSubmitting
                    ? "Registrando Pedido..."
                    : "Registrar e Ir para WhatsApp"}
                </span>
              </>
            ) : (
              <>
                <span>
                  {isSubmitting
                    ? "Processando..."
                    : "Confirmar e Finalizar Pedido"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Selos de Confiança */}
          <div className="pt-4 border-t border-borda/60 space-y-2 text-[11px] text-texto-claro">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sucesso shrink-0" />
              <span>Ambiente criptografado com SSL 256 bits</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primaria shrink-0" />
              <span>Rastreamento completo do envio após aprovação</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Zap,
  CheckCircle,
  Truck,
  ShieldCheck,
  AlertCircle,
  Minus,
  Plus,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/features/cart/context/cart-context";
import { useToast } from "@/components/ui/toast-context";
import { useStoreSettings } from "@/lib/settings/store-settings-context";
import { createQuickWhatsAppOrderAction } from "@/features/checkout/actions";

interface ProductActionsProps {
  productId: string;
  productName: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  slug?: string;
  isMercadoPagoActive?: boolean;
  isWhatsAppActive?: boolean;
}

export function ProductActions({
  productId,
  productName,
  priceCents,
  stock,
  imageUrl,
  slug,
  isMercadoPagoActive = true,
  isWhatsAppActive = true,
}: ProductActionsProps) {
  const router = useRouter();
  const cart = useCart();
  const { toast } = useToast();
  const storeSettings = useStoreSettings();

  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const [cep, setCep] = React.useState("");
  const [shippingResult, setShippingResult] = React.useState<{
    pac: { price: number; days: number };
    sedex: { price: number; days: number };
  } | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = React.useState(false);
  const [isBuyingWhatsApp, setIsBuyingWhatsApp] = React.useState(false);

  const isOutOfStock = stock <= 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = (openDrawer = true) => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);

    cart.addItem(
      {
        id: productId,
        name: productName,
        price: priceCents,
        imageUrl: imageUrl || "/images/logo/logo.jpeg",
        slug,
        stock,
      },
      quantity
    );

    toast.success(
      "Produto adicionado!",
      `${quantity}x ${productName} na sua sacola de compras.`
    );

    if (openDrawer) {
      cart.openCart();
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleBuyWhatsApp = async () => {
    if (isOutOfStock) return;
    setIsBuyingWhatsApp(true);
    try {
      const res = await createQuickWhatsAppOrderAction({
        productId,
        quantity,
      });

      if (res.success && res.whatsappUrl) {
        toast.success(
          "Pedido registrado!",
          `Pedido #${res.orderNumber} gerado. Redirecionando para o WhatsApp...`
        );
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
        router.push(
          `/checkout/sucesso?orderId=${res.orderId}&orderNumber=${res.orderNumber}&wa=1&waUrl=${encodeURIComponent(res.whatsappUrl)}`
        );
      } else {
        toast.error("Erro ao registrar pedido", res.message || "Tente novamente.");
      }
    } catch {
      toast.error("Erro inesperado", "Não foi possível conectar ao WhatsApp.");
    } finally {
      setIsBuyingWhatsApp(false);
    }
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsCalculatingShipping(true);
    setTimeout(() => {
      setIsCalculatingShipping(false);
      const freeThreshold = storeSettings.free_shipping_threshold_cents || 19900;
      setShippingResult({
        pac: { price: priceCents >= freeThreshold ? 0 : 1890, days: 5 },
        sedex: { price: 2990, days: 2 },
      });
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Disponibilidade de Estoque */}
      <div>
        {isOutOfStock ? (
          <Badge variant="destructive" className="py-1 px-3 text-xs">
            Produto Esgotado
          </Badge>
        ) : stock <= 5 ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-lg w-fit">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Apenas {stock} unidades restantes no estoque!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-sucesso">
            <span className="h-2 w-2 rounded-full bg-sucesso animate-pulse" />
            <span>Em estoque &bull; Pronta entrega</span>
          </div>
        )}
      </div>

      {/* Seletor de Quantidade + Botão Adicionar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Controle de Quantidade */}
        <div className="flex items-center justify-between border border-borda rounded-xl bg-input-fundo px-3 py-2 w-full sm:w-36 h-12">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-1 text-texto-claro hover:text-texto-escuro disabled:opacity-40 transition-colors"
            aria-label="Diminuir quantidade"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm text-texto-escuro">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= stock || isOutOfStock}
            className="p-1 text-texto-claro hover:text-texto-escuro disabled:opacity-40 transition-colors"
            aria-label="Aumentar quantidade"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Botão Adicionar ao Carrinho */}
        <Button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isOutOfStock}
          variant="outline"
          size="lg"
          className="flex-1 font-semibold h-12 text-sm gap-2"
        >
          {isAdded ? (
            <>
              <CheckCircle className="w-4 h-4 text-sucesso" />
              <span>Adicionado ao Carrinho!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar ao Carrinho</span>
            </>
          )}
        </Button>
      </div>

      {/* Botões de Compra Expressa */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Botão Comprar Agora (Checkout Expresso Online) - Exibido apenas com Mercado Pago Ativo */}
        {isMercadoPagoActive && (
          <Button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            variant="default"
            size="lg"
            className={`${isWhatsAppActive ? "flex-1" : "w-full"} font-semibold h-12 text-sm gap-2 shadow-xs`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Comprar Agora</span>
          </Button>
        )}

        {/* Botão Comprar pelo WhatsApp (Baixa Manual) - Exibido apenas com WhatsApp Ativo */}
        {isWhatsAppActive && (
          <Button
            type="button"
            onClick={handleBuyWhatsApp}
            disabled={isOutOfStock || isBuyingWhatsApp}
            isLoading={isBuyingWhatsApp}
            size="lg"
            className={`${isMercadoPagoActive ? "flex-1" : "w-full"} font-semibold h-12 text-sm gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white border-transparent`}
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Comprar pelo WhatsApp</span>
          </Button>
        )}

        {/* Alerta caso nenhum gateway esteja ativo */}
        {!isMercadoPagoActive && !isWhatsAppActive && (
          <div className="w-full p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
            Opções de compra temporariamente em manutenção. Entre em contato com nossa equipe.
          </div>
        )}
      </div>

      {/* Simulador de Frete */}
      <div className="p-4 rounded-2xl bg-fundo-card border border-borda shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-texto-escuro">
          <Truck className="w-4 h-4 text-primaria" />
          <span>Calcular Frete e Prazo</span>
        </div>

        <form onSubmit={handleCalculateShipping} className="flex gap-2">
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            maxLength={9}
            onChange={(e) => setCep(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl border border-borda bg-input-fundo text-texto-escuro text-xs outline-none focus:border-primaria"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={isCalculatingShipping}
            className="text-xs px-4"
          >
            Calcular
          </Button>
        </form>

        {shippingResult && (
          <div className="flex flex-col gap-2 pt-2 border-t border-borda/60 text-xs">
            <div className="flex justify-between items-center text-texto-escuro">
              <span>Entrega Padrão (PAC) &bull; {shippingResult.pac.days} dias úteis</span>
              <span className="font-semibold text-primaria">
                {shippingResult.pac.price === 0
                  ? "GRÁTIS"
                  : (shippingResult.pac.price / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
              </span>
            </div>
            <div className="flex justify-between items-center text-texto-escuro">
              <span>Entrega Expressa (Sedex) &bull; {shippingResult.sedex.days} dias úteis</span>
              <span className="font-semibold">
                {(shippingResult.sedex.price / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selos de Confiança */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2 text-[11px] text-texto-claro">
          <ShieldCheck className="w-4 h-4 text-sucesso shrink-0" />
          <span>Garantia de 30 dias</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-texto-claro">
          <Truck className="w-4 h-4 text-primaria shrink-0" />
          <span>Envio seguro com rastreio</span>
        </div>
      </div>
    </div>
  );
}

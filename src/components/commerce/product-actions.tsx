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
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/features/cart/context/cart-context";
import { useToast } from "@/components/ui/toast-context";
import { useStoreSettings } from "@/lib/settings/store-settings-context";
import { createQuickWhatsAppOrderAction } from "@/features/checkout/actions";
import { calculateShippingAction } from "@/features/shipping/actions";
import type { ShippingQuoteResult } from "@/lib/shipping/types";
import { ProductCustomizationBox } from "@/components/commerce/product-customization-box";
import { ProductVariantSelector } from "@/components/commerce/product-variant-selector";
import type { ProductCustomization } from "@/features/cart/types";

interface ProductActionsProps {
  productId: string;
  productName: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  slug?: string;
  isMercadoPagoActive?: boolean;
  isWhatsAppActive?: boolean;
  categorySlug?: string;
  categoryName?: string;
  isCustomizable?: boolean;
  hasSizes?: boolean;
  sizes?: string[];
  hasColors?: boolean;
  colors?: string[];
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
  categorySlug,
  categoryName,
  isCustomizable,
  hasSizes = false,
  sizes = [],
  hasColors = false,
  colors = [],
}: ProductActionsProps) {
  const router = useRouter();
  const cart = useCart();
  const { toast } = useToast();
  const storeSettings = useStoreSettings();

  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const [cep, setCep] = React.useState("");
  const [shippingQuote, setShippingQuote] = React.useState<ShippingQuoteResult | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = React.useState(false);
  const [isBuyingWhatsApp, setIsBuyingWhatsApp] = React.useState(false);

  const isCustomizableProduct = Boolean(
    isCustomizable ||
      categorySlug === "personalizados" ||
      categorySlug?.includes("personalizad") ||
      categoryName?.toLowerCase().includes("personalizad")
  );

  const [customization, setCustomization] = React.useState<ProductCustomization>({});
  const [hasCustomizationError, setHasCustomizationError] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(undefined);
  const [sizeError, setSizeError] = React.useState(false);
  const [colorError, setColorError] = React.useState(false);

  const validateVariants = () => {
    let isValid = true;
    if (hasSizes && Array.isArray(sizes) && sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error(
        "Tamanho Obrigatório",
        "Por favor, selecione um tamanho antes de continuar."
      );
      isValid = false;
    } else {
      setSizeError(false);
    }

    if (hasColors && Array.isArray(colors) && colors.length > 0 && !selectedColor) {
      setColorError(true);
      toast.error(
        "Cor Obrigatória",
        "Por favor, selecione uma cor antes de continuar."
      );
      isValid = false;
    } else {
      setColorError(false);
    }

    return isValid;
  };

  const validateCustomization = () => {
    if (!isCustomizableProduct) return true;
    const hasInput = Boolean(
      (customization.text && customization.text.trim().length > 0) ||
        customization.imageUrl
    );
    if (!hasInput) {
      setHasCustomizationError(true);
      toast.error(
        "Personalização Obrigatória",
        "Por favor, insira o nome, frase ou anexe uma foto para a gravação."
      );
      return false;
    }
    setHasCustomizationError(false);
    return true;
  };

  const getEffectiveCustomization = (): ProductCustomization | undefined => {
    const hasAnyCustom = isCustomizableProduct || selectedSize || selectedColor;
    if (!hasAnyCustom) return undefined;
    return {
      ...customization,
      size: selectedSize,
      color: selectedColor,
    };
  };

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
    if (!validateVariants()) return;
    if (!validateCustomization()) return;

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);

    const effectiveCustomization = getEffectiveCustomization();

    cart.addItem(
      {
        id: productId,
        productId,
        name: productName,
        price: priceCents,
        imageUrl: imageUrl || "/images/logo/logo.jpeg",
        slug,
        stock,
        customization: effectiveCustomization,
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
    if (!validateVariants()) return;
    if (!validateCustomization()) return;
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleBuyWhatsApp = async () => {
    if (isOutOfStock) return;
    if (!validateVariants()) return;
    if (!validateCustomization()) return;

    setIsBuyingWhatsApp(true);
    try {
      const effectiveCustomization = getEffectiveCustomization();

      const res = await createQuickWhatsAppOrderAction({
        productId,
        quantity,
        customization: effectiveCustomization,
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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);
    if (raw.length > 5) {
      raw = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setCep(raw);
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      toast.warning("CEP incompleto", "Informe um CEP válido com 8 dígitos.");
      return;
    }

    setIsCalculatingShipping(true);
    try {
      const res = await calculateShippingAction(cleanCep, priceCents * quantity);
      setShippingQuote(res);
    } catch {
      toast.error("Erro na cotação", "Não foi possível calcular o frete agora.");
    } finally {
      setIsCalculatingShipping(false);
    }
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
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 py-1.5 px-3 rounded-lg w-fit">
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

      {/* Seletor de Variações: Tamanho e Cor (Estilo Mercado Livre) */}
      <ProductVariantSelector
        hasSizes={hasSizes}
        sizes={sizes}
        selectedSize={selectedSize}
        onSelectSize={(s) => {
          setSelectedSize(s);
          setSizeError(false);
        }}
        hasColors={hasColors}
        colors={colors}
        selectedColor={selectedColor}
        onSelectColor={(c) => {
          setSelectedColor(c);
          setColorError(false);
        }}
        sizeError={sizeError}
        colorError={colorError}
      />

      {/* Box de Personalização da Joia se o produto for personalizado */}
      {isCustomizableProduct && (
        <ProductCustomizationBox
          customization={customization}
          onChange={(newCust) => {
            setCustomization(newCust);
            if (newCust.text?.trim() || newCust.imageUrl) {
              setHasCustomizationError(false);
            }
          }}
          hasError={hasCustomizationError}
        />
      )}

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

      {/* Simulador de Frete Regional */}
      <div className="p-4 sm:p-5 rounded-2xl bg-fundo-card border border-borda shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold text-texto-escuro">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primaria" />
            <span>Calcular Frete e Prazo</span>
          </div>
          <span className="text-[11px] font-normal text-texto-claro hidden sm:inline">
            Sul e Sudeste: Frete Grátis
          </span>
        </div>

        <form onSubmit={handleCalculateShipping} className="flex gap-2">
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            maxLength={9}
            onChange={handleCepChange}
            className="flex-1 h-10 px-3 rounded-xl border border-borda bg-input-fundo text-texto-escuro text-xs outline-none focus:border-primaria transition-colors"
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

        {shippingQuote && (
          <div className="flex flex-col gap-2.5 pt-2 border-t border-borda/60 text-xs">
            {/* Localização detectada */}
            {shippingQuote.state && (
              <div className="flex items-center gap-1.5 text-[11px] text-texto-medio font-medium">
                <MapPin className="w-3.5 h-3.5 text-primaria shrink-0" />
                <span>
                  {shippingQuote.city ? `${shippingQuote.city} - ` : ""}
                  {shippingQuote.state} &bull; Região {shippingQuote.regionName}
                </span>
              </div>
            )}

            {/* Aviso da Regra Regional */}
            <div
              className={`p-2.5 rounded-xl text-[11px] font-medium leading-relaxed ${
                shippingQuote.isPacFree
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
              }`}
            >
              {shippingQuote.ruleNotice}
            </div>

            {/* Opções de envio */}
            <div className="flex justify-between items-center text-texto-escuro py-1 border-b border-borda/40">
              <span className="text-texto-medio">{shippingQuote.pac.label}</span>
              <span className={`font-bold ${shippingQuote.pac.isFree ? "text-emerald-600 dark:text-emerald-400" : "text-texto-escuro"}`}>
                {shippingQuote.pac.formatted}
              </span>
            </div>
            <div className="flex justify-between items-center text-texto-escuro py-1">
              <span className="text-texto-medio">{shippingQuote.sedex.label}</span>
              <span className="font-semibold text-texto-escuro">
                {shippingQuote.sedex.formatted}
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

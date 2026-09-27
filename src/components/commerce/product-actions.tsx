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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductActionsProps {
  productId: string;
  productName: string;
  priceCents: number;
  stock: number;
}

export function ProductActions({
  productId,
  productName,
  priceCents,
  stock,
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const [cep, setCep] = React.useState("");
  const [shippingResult, setShippingResult] = React.useState<{
    pac: { price: number; days: number };
    sedex: { price: number; days: number };
  } | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = React.useState(false);

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

  const handleAddToCart = () => {
    // Adiciona feedback visual imediato
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);

    // Evento disparado para sincronização com CartDrawer/Contexto
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:add-item", {
          detail: { productId, quantity, priceCents, productName },
        })
      );
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsCalculatingShipping(true);
    setTimeout(() => {
      setIsCalculatingShipping(false);
      setShippingResult({
        pac: { price: priceCents >= 19900 ? 0 : 1890, days: 5 },
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
        <div className="flex items-center justify-between border border-borda rounded-xl bg-white px-3 py-2 w-full sm:w-36 h-12">
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
          onClick={handleAddToCart}
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

      {/* Botão Comprar Agora (Checkout Expresso) */}
      <Button
        type="button"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        variant="default"
        size="lg"
        className="w-full font-semibold h-12 text-sm gap-2 shadow-sm"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>Comprar Agora</span>
      </Button>

      {/* Simulador de Frete */}
      <div className="p-4 rounded-2xl bg-white border border-borda shadow-xs flex flex-col gap-3">
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
            className="flex-1 h-10 px-3 rounded-xl border border-borda text-xs outline-none focus:border-primaria"
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

"use server";

import {
  calculateRegionalShippingQuote,
  type ShippingQuoteResult,
} from "@/lib/shipping/regional-shipping";

export async function calculateShippingAction(
  cep: string,
  subtotalCents: number = 0
): Promise<ShippingQuoteResult> {
  const cleanCep = (cep || "").replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    return {
      success: false,
      region: "sudeste",
      regionName: "Sudeste",
      isSouthOrSoutheast: true,
      freeShippingThresholdCents: 0,
      isPacFree: true,
      remainingForFreeShippingCents: 0,
      pac: {
        cents: 0,
        formatted: "GRÁTIS",
        isFree: true,
        minDays: 3,
        maxDays: 6,
        label: "Entrega Padrão (PAC)",
      },
      sedex: {
        cents: 2290,
        formatted: "R$ 22,90",
        minDays: 1,
        maxDays: 2,
        label: "Entrega Expressa (SEDEX)",
      },
      ruleNotice: "Informe um CEP válido com 8 dígitos.",
      error: "CEP inválido",
    };
  }

  try {
    return await calculateRegionalShippingQuote({
      cep: cleanCep,
      subtotalCents,
    });
  } catch (err: unknown) {
    console.error("Erro no cálculo de frete:", err);
    return {
      success: false,
      region: "sudeste",
      regionName: "Sudeste",
      isSouthOrSoutheast: true,
      freeShippingThresholdCents: 0,
      isPacFree: true,
      remainingForFreeShippingCents: 0,
      pac: {
        cents: 0,
        formatted: "GRÁTIS",
        isFree: true,
        minDays: 3,
        maxDays: 6,
        label: "Entrega Padrão (PAC)",
      },
      sedex: {
        cents: 2290,
        formatted: "R$ 22,90",
        minDays: 1,
        maxDays: 2,
        label: "Entrega Expressa (SEDEX)",
      },
      ruleNotice: "Não foi possível cotar no momento. Tente novamente.",
      error: "Falha na cotação de frete",
    };
  }
}

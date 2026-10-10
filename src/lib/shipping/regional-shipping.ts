import type {
  BrazilianRegion,
  BrazilianState,
  RegionalShippingConfig,
  ShippingMethod,
  ShippingQuoteResult,
} from "./types";

export type {
  BrazilianRegion,
  BrazilianState,
  RegionalShippingConfig,
  ShippingMethod,
  ShippingQuoteResult,
};

/**
 * Mapeamento das 5 Regiões Oficiais do Brasil com suas UFs e regras tarifárias reais
 * Sul e Sudeste: Frete Grátis no PAC (regra da loja)
 * Outras Regiões: Frete Grátis no PAC acima de R$ 200,00 (20000 centavos)
 */
export const REGIONAL_CONFIGS: Record<BrazilianRegion, RegionalShippingConfig> = {
  sudeste: {
    region: "sudeste",
    regionName: "Sudeste",
    states: ["SP", "RJ", "MG", "ES"],
    isAlwaysFreePac: true,
    freeShippingThresholdCents: 0,
    pacBaseCents: 1890,
    pacMinDays: 3,
    pacMaxDays: 6,
    sedexBaseCents: 2290,
    sedexMinDays: 1,
    sedexMaxDays: 2,
  },
  sul: {
    region: "sul",
    regionName: "Sul",
    states: ["PR", "SC", "RS"],
    isAlwaysFreePac: true,
    freeShippingThresholdCents: 0,
    pacBaseCents: 1990,
    pacMinDays: 4,
    pacMaxDays: 7,
    sedexBaseCents: 2690,
    sedexMinDays: 2,
    sedexMaxDays: 3,
  },
  "centro-oeste": {
    region: "centro-oeste",
    regionName: "Centro-Oeste",
    states: ["DF", "GO", "MT", "MS"],
    isAlwaysFreePac: false,
    freeShippingThresholdCents: 20000, // R$ 200,00
    pacBaseCents: 2390,
    pacMinDays: 5,
    pacMaxDays: 8,
    sedexBaseCents: 3590,
    sedexMinDays: 2,
    sedexMaxDays: 4,
  },
  nordeste: {
    region: "nordeste",
    regionName: "Nordeste",
    states: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
    isAlwaysFreePac: false,
    freeShippingThresholdCents: 20000, // R$ 200,00
    pacBaseCents: 2890,
    pacMinDays: 7,
    pacMaxDays: 11,
    sedexBaseCents: 4490,
    sedexMinDays: 3,
    sedexMaxDays: 5,
  },
  norte: {
    region: "norte",
    regionName: "Norte",
    states: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
    isAlwaysFreePac: false,
    freeShippingThresholdCents: 20000, // R$ 200,00
    pacBaseCents: 3690,
    pacMinDays: 9,
    pacMaxDays: 15,
    sedexBaseCents: 5690,
    sedexMinDays: 4,
    sedexMaxDays: 6,
  },
};

/**
 * Mapeamento direto de UF para Região
 */
export const STATE_TO_REGION_MAP: Record<BrazilianState, BrazilianRegion> = {
  // Sudeste
  SP: "sudeste",
  RJ: "sudeste",
  MG: "sudeste",
  ES: "sudeste",
  // Sul
  PR: "sul",
  SC: "sul",
  RS: "sul",
  // Centro-Oeste
  DF: "centro-oeste",
  GO: "centro-oeste",
  MT: "centro-oeste",
  MS: "centro-oeste",
  // Nordeste
  AL: "nordeste",
  BA: "nordeste",
  CE: "nordeste",
  MA: "nordeste",
  PB: "nordeste",
  PE: "nordeste",
  PI: "nordeste",
  RN: "nordeste",
  SE: "nordeste",
  // Norte
  AC: "norte",
  AM: "norte",
  AP: "norte",
  PA: "norte",
  RO: "norte",
  RR: "norte",
  TO: "norte",
};

/**
 * Cache em memória para consultas de CEP
 */
const cepCache = new Map<string, { city: string; state: BrazilianState }>();

/**
 * Mapeia faixas numéricas de CEP dos Correios para UF (fallback offline e determinístico)
 */
export function getUfByCepPrefix(cleanCep: string): BrazilianState {
  const prefix2 = parseInt(cleanCep.slice(0, 2), 10);
  const prefix5 = parseInt(cleanCep.slice(0, 5), 10);

  if (prefix2 >= 1 && prefix2 <= 19) return "SP";
  if (prefix2 >= 20 && prefix2 <= 28) return "RJ";
  if (prefix2 === 29) return "ES";
  if (prefix2 >= 30 && prefix2 <= 39) return "MG";
  if (prefix2 >= 40 && prefix2 <= 48) return "BA";
  if (prefix2 === 49) return "SE";
  if (prefix2 >= 50 && prefix2 <= 56) return "PE";
  if (prefix2 === 57) return "AL";
  if (prefix2 === 58) return "PB";
  if (prefix2 === 59) return "RN";
  if (prefix2 >= 60 && prefix2 <= 63) return "CE";
  if (prefix2 === 64) return "PI";
  if (prefix2 === 65) return "MA";
  if (prefix2 >= 66 && prefix2 <= 68) {
    if (prefix5 >= 68900 && prefix5 <= 68999) return "AP";
    return "PA";
  }
  if (prefix2 === 69) {
    if (prefix5 >= 69300 && prefix5 <= 69399) return "RR";
    if (prefix5 >= 69900 && prefix5 <= 69999) return "AC";
    return "AM";
  }
  if (prefix2 >= 70 && prefix2 <= 72) return "DF";
  if (prefix2 === 73) {
    if (prefix5 >= 73700 && prefix5 <= 73999) return "GO";
    return "DF";
  }
  if (prefix2 >= 74 && prefix2 <= 76) return "GO";
  if (prefix2 === 77) return "TO";
  if (prefix2 === 78) {
    if (prefix5 >= 78900 && prefix5 <= 78999) return "RO";
    return "MT";
  }
  if (prefix2 === 79) return "MS";
  if (prefix2 >= 80 && prefix2 <= 87) return "PR";
  if (prefix2 >= 88 && prefix2 <= 89) return "SC";
  if (prefix2 >= 90 && prefix2 <= 99) return "RS";

  return "SP";
}

/**
 * Consulta a API pública do ViaCEP com fallback local
 */
export async function lookupAddressByCep(cep: string): Promise<{
  city: string;
  state: BrazilianState;
  fromApi: boolean;
}> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos.");
  }

  if (cepCache.has(cleanCep)) {
    const cached = cepCache.get(cleanCep)!;
    return { ...cached, fromApi: true };
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3500),
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.erro && data.uf) {
        const uf = data.uf.toUpperCase() as BrazilianState;
        if (uf in STATE_TO_REGION_MAP) {
          const result = {
            city: data.localidade || "Sua Cidade",
            state: uf,
            fromApi: true,
          };
          cepCache.set(cleanCep, { city: result.city, state: uf });
          return result;
        }
      }
    }
  } catch {
    // Fallback silencioso por faixa de CEP
  }

  const fallbackUf = getUfByCepPrefix(cleanCep);
  return {
    city: "Localidade identificada por faixa de CEP",
    state: fallbackUf,
    fromApi: false,
  };
}

/**
 * Identifica a Região a partir da UF
 */
export function getRegionFromState(uf: string): BrazilianRegion {
  const normalizedUf = uf.trim().toUpperCase() as BrazilianState;
  return STATE_TO_REGION_MAP[normalizedUf] || "sudeste";
}

/**
 * Formata centavos em Reais (R$)
 */
export function formatCurrencyBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Calcula a cotação síncrona a partir da UF/Estado (ideal para checkout com endereço já carregado)
 */
export function calculateShippingQuoteForState(options: {
  state?: string | null;
  subtotalCents: number;
  city?: string;
  cep?: string;
}): ShippingQuoteResult {
  const normState = (options.state || "SP").trim().toUpperCase() as BrazilianState;
  const resolvedState = normState in STATE_TO_REGION_MAP ? normState : "SP";
  const region = getRegionFromState(resolvedState);
  const config = REGIONAL_CONFIGS[region];
  const isSouthOrSoutheast = config.isAlwaysFreePac;

  const isPacFree = isSouthOrSoutheast || options.subtotalCents >= config.freeShippingThresholdCents;
  const pacCents = isPacFree ? 0 : config.pacBaseCents;
  const remainingForFree = Math.max(0, config.freeShippingThresholdCents - options.subtotalCents);

  let ruleNotice = "";
  if (isSouthOrSoutheast) {
    ruleNotice = `✨ Frete Grátis no PAC para as regiões Sul e Sudeste (${resolvedState})!`;
  } else if (isPacFree) {
    ruleNotice = `🎉 Parabéns! Sua compra atingiu R$ 200,00 e ganhou Frete Grátis para ${config.regionName}!`;
  } else {
    ruleNotice = `💡 Frete Grátis para a Região ${config.regionName} em compras acima de R$ 200,00 (adicione mais ${formatCurrencyBRL(remainingForFree)}).`;
  }

  return {
    success: true,
    cep: options.cep,
    city: options.city || "",
    state: resolvedState,
    region,
    regionName: config.regionName,
    isSouthOrSoutheast,
    freeShippingThresholdCents: config.freeShippingThresholdCents,
    isPacFree,
    remainingForFreeShippingCents: remainingForFree,
    pac: {
      cents: pacCents,
      formatted: isPacFree ? "GRÁTIS" : formatCurrencyBRL(pacCents),
      isFree: isPacFree,
      minDays: config.pacMinDays,
      maxDays: config.pacMaxDays,
      label: `Entrega Padrão (PAC) • ${config.pacMinDays} a ${config.pacMaxDays} dias úteis`,
    },
    sedex: {
      cents: config.sedexBaseCents,
      formatted: formatCurrencyBRL(config.sedexBaseCents),
      minDays: config.sedexMinDays,
      maxDays: config.sedexMaxDays,
      label: `Entrega Expressa (SEDEX) • ${config.sedexMinDays} a ${config.sedexMaxDays} dias úteis`,
    },
    ruleNotice,
  };
}

/**
 * Calcula a cotação completa de frete regional (com resolução assíncrona de CEP)
 */
export async function calculateRegionalShippingQuote(options: {
  cep?: string;
  state?: string;
  city?: string;
  subtotalCents: number;
}): Promise<ShippingQuoteResult> {
  const { cep, subtotalCents } = options;
  let resolvedState: BrazilianState = "SP";
  let resolvedCity = options.city || "";

  if (cep) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      const addr = await lookupAddressByCep(cleanCep);
      resolvedState = addr.state;
      resolvedCity = addr.city;
    }
  } else if (options.state) {
    const norm = options.state.trim().toUpperCase() as BrazilianState;
    if (norm in STATE_TO_REGION_MAP) {
      resolvedState = norm;
    }
  }

  return calculateShippingQuoteForState({
    state: resolvedState,
    city: resolvedCity,
    cep: cep ? cep.replace(/\D/g, "") : undefined,
    subtotalCents,
  });
}

/**
 * Função direta para validação segura de valor de frete no servidor (Checkout Server-Side)
 */
export function calculateOrderShippingCents(params: {
  state?: string | null;
  subtotalCents: number;
  shippingMethod: ShippingMethod;
}): number {
  const { state, subtotalCents, shippingMethod } = params;
  const region = state ? getRegionFromState(state) : "sudeste";
  const config = REGIONAL_CONFIGS[region];

  if (shippingMethod === "sedex") {
    return config.sedexBaseCents;
  }

  // PAC: Sul e Sudeste é 0 (grátis), demais regiões grátis se >= threshold (20000)
  if (config.isAlwaysFreePac) {
    return 0;
  }

  if (subtotalCents >= config.freeShippingThresholdCents) {
    return 0;
  }

  return config.pacBaseCents;
}

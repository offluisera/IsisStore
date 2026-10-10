export type BrazilianRegion =
  | "sul"
  | "sudeste"
  | "centro-oeste"
  | "nordeste"
  | "norte";

export type BrazilianState =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

export type ShippingMethod = "pac" | "sedex";

export interface RegionalShippingConfig {
  region: BrazilianRegion;
  regionName: string;
  states: BrazilianState[];
  isAlwaysFreePac: boolean; // Sul e Sudeste = true
  freeShippingThresholdCents: number; // 0 para Sul/Sudeste, 20000 para outras regiões
  pacBaseCents: number;
  pacMinDays: number;
  pacMaxDays: number;
  sedexBaseCents: number;
  sedexMinDays: number;
  sedexMaxDays: number;
}

export interface ShippingQuoteResult {
  success: boolean;
  cep?: string;
  city?: string;
  state?: BrazilianState | string;
  region: BrazilianRegion;
  regionName: string;
  isSouthOrSoutheast: boolean;
  freeShippingThresholdCents: number;
  isPacFree: boolean;
  remainingForFreeShippingCents: number;
  pac: {
    cents: number;
    formatted: string;
    isFree: boolean;
    minDays: number;
    maxDays: number;
    label: string;
  };
  sedex: {
    cents: number;
    formatted: string;
    minDays: number;
    maxDays: number;
    label: string;
  };
  ruleNotice: string;
  error?: string;
}

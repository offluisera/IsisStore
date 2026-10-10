import { test, describe } from "node:test";
import assert from "node:assert";
import {
  getRegionFromState,
  getUfByCepPrefix,
  calculateShippingQuoteForState,
  calculateOrderShippingCents,
  REGIONAL_CONFIGS,
} from "@/lib/shipping/regional-shipping";
import type { BrazilianState } from "@/lib/shipping/types";

describe("Cálculo e API de Frete por Região e CEP", () => {
  test("1. Mapeamento das 5 Regiões Oficiais a partir de UFs", () => {
    // Sudeste
    assert.strictEqual(getRegionFromState("SP"), "sudeste");
    assert.strictEqual(getRegionFromState("RJ"), "sudeste");
    assert.strictEqual(getRegionFromState("MG"), "sudeste");
    assert.strictEqual(getRegionFromState("ES"), "sudeste");

    // Sul
    assert.strictEqual(getRegionFromState("PR"), "sul");
    assert.strictEqual(getRegionFromState("SC"), "sul");
    assert.strictEqual(getRegionFromState("RS"), "sul");

    // Centro-Oeste
    assert.strictEqual(getRegionFromState("DF"), "centro-oeste");
    assert.strictEqual(getRegionFromState("GO"), "centro-oeste");
    assert.strictEqual(getRegionFromState("MT"), "centro-oeste");
    assert.strictEqual(getRegionFromState("MS"), "centro-oeste");

    // Nordeste
    assert.strictEqual(getRegionFromState("BA"), "nordeste");
    assert.strictEqual(getRegionFromState("PE"), "nordeste");
    assert.strictEqual(getRegionFromState("CE"), "nordeste");
    assert.strictEqual(getRegionFromState("RN"), "nordeste");

    // Norte
    assert.strictEqual(getRegionFromState("AM"), "norte");
    assert.strictEqual(getRegionFromState("PA"), "norte");
    assert.strictEqual(getRegionFromState("RO"), "norte");
  });

  test("2. Resolução determinística de UF por prefixo de CEP dos Correios", () => {
    assert.strictEqual(getUfByCepPrefix("01310100"), "SP"); // Av. Paulista
    assert.strictEqual(getUfByCepPrefix("20040002"), "RJ"); // Rio de Janeiro
    assert.strictEqual(getUfByCepPrefix("80010000"), "PR"); // Curitiba
    assert.strictEqual(getUfByCepPrefix("90010000"), "RS"); // Porto Alegre
    assert.strictEqual(getUfByCepPrefix("40020000"), "BA"); // Salvador
    assert.strictEqual(getUfByCepPrefix("69005040"), "AM"); // Manaus
    assert.strictEqual(getUfByCepPrefix("70040010"), "DF"); // Brasília
  });

  test("3. Regra Sul e Sudeste: Frete Grátis garantido no PAC em qualquer valor", () => {
    // Pedido pequeno de R$ 49,90 para SP (Sudeste)
    const quoteSP = calculateShippingQuoteForState({
      state: "SP",
      subtotalCents: 4990,
    });
    assert.strictEqual(quoteSP.isPacFree, true);
    assert.strictEqual(quoteSP.pac.cents, 0);
    assert.strictEqual(quoteSP.pac.formatted, "GRÁTIS");
    assert.strictEqual(quoteSP.isSouthOrSoutheast, true);
    assert.strictEqual(quoteSP.sedex.cents, 2290); // SEDEX real R$ 22,90

    // Pedido de R$ 80,00 para PR (Sul)
    const quotePR = calculateShippingQuoteForState({
      state: "PR",
      subtotalCents: 8000,
    });
    assert.strictEqual(quotePR.isPacFree, true);
    assert.strictEqual(quotePR.pac.cents, 0);
    assert.strictEqual(quotePR.pac.formatted, "GRÁTIS");
    assert.strictEqual(quotePR.isSouthOrSoutheast, true);
    assert.strictEqual(quotePR.sedex.cents, 2690); // SEDEX real R$ 26,90
  });

  test("4. Regra Demais Regiões (Nordeste, Norte, Centro-Oeste): Frete Grátis apenas acima de R$ 200,00", () => {
    // Caso 4.1: Nordeste (BA) - Abaixo de R$ 200,00 (paga frete real)
    const quoteBA_Abaixo = calculateShippingQuoteForState({
      state: "BA",
      subtotalCents: 15000, // R$ 150,00
    });
    assert.strictEqual(quoteBA_Abaixo.isPacFree, false);
    assert.strictEqual(quoteBA_Abaixo.pac.cents, 2890); // R$ 28,90
    assert.strictEqual(quoteBA_Abaixo.remainingForFreeShippingCents, 5000); // Faltam R$ 50,00

    // Caso 4.2: Nordeste (BA) - Acima de R$ 200,00 (frete grátis liberado)
    const quoteBA_Acima = calculateShippingQuoteForState({
      state: "BA",
      subtotalCents: 21000, // R$ 210,00
    });
    assert.strictEqual(quoteBA_Acima.isPacFree, true);
    assert.strictEqual(quoteBA_Acima.pac.cents, 0);
    assert.strictEqual(quoteBA_Acima.pac.formatted, "GRÁTIS");

    // Caso 4.3: Norte (AM) - Abaixo de R$ 200,00 (tarifa regional do Norte)
    const quoteAM_Abaixo = calculateShippingQuoteForState({
      state: "AM",
      subtotalCents: 9900, // R$ 99,00
    });
    assert.strictEqual(quoteAM_Abaixo.isPacFree, false);
    assert.strictEqual(quoteAM_Abaixo.pac.cents, 3690); // R$ 36,90
    assert.strictEqual(quoteAM_Abaixo.sedex.cents, 5690); // SEDEX R$ 56,90

    // Caso 4.4: Norte (AM) - Exatamente R$ 200,00 (atingiu limite de frete grátis)
    const quoteAM_Limite = calculateShippingQuoteForState({
      state: "AM",
      subtotalCents: 20000, // R$ 200,00
    });
    assert.strictEqual(quoteAM_Limite.isPacFree, true);
    assert.strictEqual(quoteAM_Limite.pac.cents, 0);

    // Caso 4.5: Centro-Oeste (GO) - Abaixo vs Acima de R$ 200,00
    const quoteGO_Abaixo = calculateShippingQuoteForState({
      state: "GO",
      subtotalCents: 12000,
    });
    assert.strictEqual(quoteGO_Abaixo.isPacFree, false);
    assert.strictEqual(quoteGO_Abaixo.pac.cents, 2390); // R$ 23,90

    const quoteGO_Acima = calculateShippingQuoteForState({
      state: "GO",
      subtotalCents: 20001,
    });
    assert.strictEqual(quoteGO_Acima.isPacFree, true);
    assert.strictEqual(quoteGO_Acima.pac.cents, 0);
  });

  test("5. Validação Server-Side de Cálculo de Frete para Checkout", () => {
    // Sul (RS): PAC é 0, SEDEX é 2690
    assert.strictEqual(
      calculateOrderShippingCents({ state: "RS", subtotalCents: 3000, shippingMethod: "pac" }),
      0
    );
    assert.strictEqual(
      calculateOrderShippingCents({ state: "RS", subtotalCents: 3000, shippingMethod: "sedex" }),
      2690
    );

    // Nordeste (PE): PAC abaixo de 200 paga 2890; acima de 200 é 0
    assert.strictEqual(
      calculateOrderShippingCents({ state: "PE", subtotalCents: 14900, shippingMethod: "pac" }),
      2890
    );
    assert.strictEqual(
      calculateOrderShippingCents({ state: "PE", subtotalCents: 20000, shippingMethod: "pac" }),
      0
    );
    assert.strictEqual(
      calculateOrderShippingCents({ state: "PE", subtotalCents: 20000, shippingMethod: "sedex" }),
      4490
    );
  });
});

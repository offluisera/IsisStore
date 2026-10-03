/**
 * Utilitário de Sorteio Diário Determinístico para Ofertas do Dia (Daily Deals).
 * Mantém os mesmos N produtos selecionados durante todo o dia (YYYY-MM-DD),
 * alternando automaticamente à meia-noite sem requisições excessivas ao banco.
 */

export function getDailyDealsProducts<T extends { id: string }>(
  allProducts: T[],
  limit: number = 15,
  dateString?: string
): T[] {
  if (!allProducts || allProducts.length === 0) return [];
  if (allProducts.length <= limit) return [...allProducts];

  // Seed baseada na data atual local ou UTC (YYYY-MM-DD)
  const today =
    dateString ||
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date())
      .split("/")
      .reverse()
      .join("-");

  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) >>> 0;
  }

  // Linear Congruential Generator (LCG) determinístico
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const pool = [...allProducts];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  return pool.slice(0, limit);
}

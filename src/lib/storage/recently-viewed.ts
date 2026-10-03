/**
 * Utilitário de Histórico de Produtos Vistos Recentemente pelo Cliente.
 * Armazena no localStorage do navegador para persistência instantânea
 * e sincronização reativa entre páginas e componentes.
 */

export interface RecentlyViewedProduct {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  sale_price_cents?: number | null;
  category_name?: string;
  image_url?: string;
  viewed_at: number;
}

export const RECENTLY_VIEWED_STORAGE_KEY = "isis_recently_viewed_v1";
export const RECENTLY_VIEWED_EVENT_NAME = "isis:recently-viewed-updated";
export const MAX_RECENTLY_VIEWED = 15;

/**
 * Retorna a lista de produtos visualizados recentemente (seguro para SSR).
 */
export function getRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.id === "string" && typeof item.name === "string"
    );
  } catch (err) {
    console.warn("Falha ao recuperar histórico de visualização:", err);
    return [];
  }
}

/**
 * Registra a visualização de um produto no histórico do cliente.
 * Remove duplicatas prévias, insere no topo (índice 0) e limita a 15 itens.
 */
export function recordRecentlyViewed(
  product: Omit<RecentlyViewedProduct, "viewed_at">
): RecentlyViewedProduct[] {
  if (typeof window === "undefined" || !product || !product.id) {
    return [];
  }

  try {
    const current = getRecentlyViewed();
    // Remove duplicata do mesmo produto
    const filtered = current.filter((item) => item.id !== product.id);

    const entry: RecentlyViewedProduct = {
      ...product,
      viewed_at: Date.now(),
    };

    // Insere no topo e limita ao máximo de 15 produtos
    const updated = [entry, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(updated)
    );

    // Notifica outros componentes da página em tempo real
    window.dispatchEvent(
      new CustomEvent(RECENTLY_VIEWED_EVENT_NAME, { detail: updated })
    );

    return updated;
  } catch (err) {
    console.warn("Falha ao salvar produto no histórico:", err);
    return [];
  }
}

/**
 * Limpa todo o histórico de navegação do cliente.
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(RECENTLY_VIEWED_EVENT_NAME, { detail: [] })
    );
  } catch (err) {
    console.warn("Falha ao limpar histórico de visualização:", err);
  }
}

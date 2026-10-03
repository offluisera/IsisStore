import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  getRecentlyViewed,
  recordRecentlyViewed,
  clearRecentlyViewed,
  RECENTLY_VIEWED_STORAGE_KEY,
  RECENTLY_VIEWED_EVENT_NAME,
  MAX_RECENTLY_VIEWED,
} from "@/lib/storage/recently-viewed";

// Mock minimal do localStorage para ambiente Node.js de teste
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string) {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe("Gate de Histórico de Navegação e Produtos Vistos Recentemente", () => {
  beforeEach(() => {
    // Configura mock de window e localStorage
    const storage = new LocalStorageMock();
    const listeners: Record<string, Function[]> = {};

    (global as any).window = {
      localStorage: storage,
      dispatchEvent: (event: { type: string; detail?: any }) => {
        (listeners[event.type] || []).forEach((fn) => fn(event));
        return true;
      },
      addEventListener: (type: string, fn: Function) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(fn);
      },
      removeEventListener: (type: string, fn: Function) => {
        listeners[type] = (listeners[type] || []).filter((f) => f !== fn);
      },
    };
  });

  it("1. Deve retornar lista vazia se nada foi visualizado ainda", () => {
    const items = getRecentlyViewed();
    assert.deepStrictEqual(items, []);
  });

  it("2. Deve registrar produto no topo do histórico e manter ordem cronológica inversa", () => {
    recordRecentlyViewed({
      id: "prod_1",
      slug: "colar-coracao",
      name: "Colar Coração Ouro 18k",
      price_cents: 12900,
    });

    recordRecentlyViewed({
      id: "prod_2",
      slug: "pistola-bolhas",
      name: "Pistola de Bolhas",
      price_cents: 9990,
    });

    const items = getRecentlyViewed();
    assert.strictEqual(items.length, 2);
    // Mais recente deve ser o primeiro
    assert.strictEqual(items[0].id, "prod_2");
    assert.strictEqual(items[1].id, "prod_1");
  });

  it("3. Deve deduplicar produto já visto e promovê-lo para o primeiro lugar", () => {
    recordRecentlyViewed({
      id: "prod_1",
      slug: "colar-coracao",
      name: "Colar Coração Ouro 18k",
      price_cents: 12900,
    });

    recordRecentlyViewed({
      id: "prod_2",
      slug: "pistola-bolhas",
      name: "Pistola de Bolhas",
      price_cents: 9990,
    });

    // Usuário abre prod_1 novamente
    recordRecentlyViewed({
      id: "prod_1",
      slug: "colar-coracao",
      name: "Colar Coração Ouro 18k",
      price_cents: 12900,
    });

    const items = getRecentlyViewed();
    assert.strictEqual(items.length, 2, "Não deve duplicar");
    assert.strictEqual(items[0].id, "prod_1", "Produto revisitado deve ir para o topo");
    assert.strictEqual(items[1].id, "prod_2");
  });

  it("4. Deve respeitar o limite máximo de 15 produtos recentes", () => {
    for (let i = 1; i <= 25; i++) {
      recordRecentlyViewed({
        id: `prod_${i}`,
        slug: `produto-${i}`,
        name: `Produto ${i}`,
        price_cents: 1000 * i,
      });
    }

    const items = getRecentlyViewed();
    assert.strictEqual(items.length, MAX_RECENTLY_VIEWED);
    assert.strictEqual(items[0].id, "prod_25");
    assert.strictEqual(items[14].id, "prod_11");
  });

  it("5. Deve limpar histórico completamente ao acionar clearRecentlyViewed", () => {
    recordRecentlyViewed({
      id: "prod_1",
      slug: "colar-coracao",
      name: "Colar Coração Ouro 18k",
      price_cents: 12900,
    });

    assert.strictEqual(getRecentlyViewed().length, 1);
    clearRecentlyViewed();
    assert.strictEqual(getRecentlyViewed().length, 0);
  });
});

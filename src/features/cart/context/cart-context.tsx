"use client";

import * as React from "react";
import type { CartItem, CartContextType } from "@/features/cart/types";
import { createClient } from "@/lib/supabase/client";

const CART_STORAGE_KEY = "isis_store_cart_v1";

interface RemoteCartProduct {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  sale_price_cents: number | null;
  stock: number;
  product_images?: Array<{ public_url: string; is_primary: boolean }>;
}

interface RemoteCartItemRow {
  product_id: string;
  quantity: number;
  products: RemoteCartProduct | null;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 1. Carregar do localStorage no primeiro render de cliente
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => {
            setItems(parsed);
          });
        }
      }
    } catch (err) {
      console.error("Erro ao ler carrinho do localStorage:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Persistir no localStorage após inicialização
  React.useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Erro ao salvar carrinho no localStorage:", err);
    }
  }, [items, isInitialized]);

  // Handlers principais memoizados
  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);

  const addItem = React.useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const maxStock = i.stock ? Math.min(quantity, i.stock) : quantity;
          return { ...i, quantity: maxStock };
        }
        return i;
      })
    );
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  // 3. Ouvinte de evento customizado para adição global
  React.useEffect(() => {
    const handleGlobalAdd = (e: Event) => {
      const customEvent = e as CustomEvent<{
        productId: string;
        quantity?: number;
        priceCents?: number;
        productName?: string;
        imageUrl?: string;
        slug?: string;
      }>;
      const detail = customEvent.detail;
      if (detail && detail.productId) {
        addItem(
          {
            id: detail.productId,
            name: detail.productName || "Produto Selecionado",
            price: detail.priceCents || 0,
            imageUrl: detail.imageUrl || "/images/logo/logo.jpeg",
            slug: detail.slug,
          },
          detail.quantity || 1
        );
      }
    };

    window.addEventListener("cart:add-item", handleGlobalAdd);
    return () => {
      window.removeEventListener("cart:add-item", handleGlobalAdd);
    };
  }, [addItem]);

  // 4. Sincronização com o Supabase quando logado
  React.useEffect(() => {
    if (!isInitialized) return;

    let isMounted = true;

    async function syncWithSupabase() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        setIsSyncing(true);

        let { data: cart } = await supabase
          .from("carts")
          .select("id")
          .eq("profile_id", user.id)
          .single();

        if (!cart) {
          const { data: newCart } = await supabase
            .from("carts")
            .insert({ profile_id: user.id })
            .select("id")
            .single();
          cart = newCart;
        }

        if (!cart || !isMounted) return;

        const { data: remoteData } = await supabase
          .from("cart_items")
          .select(
            "product_id, quantity, products(id, name, slug, price_cents, sale_price_cents, stock, product_images(public_url, is_primary))"
          )
          .eq("cart_id", cart.id);

        const remoteRows = (remoteData as unknown as RemoteCartItemRow[]) || [];

        if (remoteRows.length > 0 && isMounted) {
          const mappedRemote: CartItem[] = remoteRows
            .filter((ri) => ri.products !== null)
            .map((ri) => {
              const prod = ri.products!;
              const primaryImg =
                prod.product_images?.find((img) => img.is_primary) ||
                prod.product_images?.[0];

              return {
                id: prod.id,
                name: prod.name,
                slug: prod.slug,
                price: prod.sale_price_cents || prod.price_cents,
                quantity: ri.quantity,
                imageUrl: primaryImg?.public_url || "/images/logo/logo.jpeg",
                stock: prod.stock,
              };
            });

          setItems((prevLocal) => {
            const mergedMap = new Map<string, CartItem>();

            mappedRemote.forEach((item) => {
              mergedMap.set(item.id, item);
            });

            prevLocal.forEach((item) => {
              if (mergedMap.has(item.id)) {
                const existing = mergedMap.get(item.id)!;
                mergedMap.set(item.id, {
                  ...existing,
                  quantity: Math.max(existing.quantity, item.quantity),
                });
              } else {
                mergedMap.set(item.id, item);
              }
            });

            return Array.from(mergedMap.values());
          });
        }
      } catch (error) {
        console.error("Erro na sincronização de carrinho com Supabase:", error);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    }

    syncWithSupabase();

    return () => {
      isMounted = false;
    };
  }, [isInitialized]);

  const subtotalCents = React.useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const itemsCount = React.useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        subtotalCents,
        itemsCount,
        isSyncing,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser utilizado dentro de um CartProvider");
  }
  return context;
}

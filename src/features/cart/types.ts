export interface CartItem {
  id: string; // ID do produto
  name: string;
  price: number; // Em centavos (ex: R$ 149,90 = 14990)
  quantity: number;
  imageUrl: string;
  stock?: number;
  slug?: string;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  subtotalCents: number;
  itemsCount: number;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

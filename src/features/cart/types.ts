export interface ProductCustomization {
  text?: string;
  imageUrl?: string;
  notes?: string;
  size?: string;
  color?: string;
}

export interface CartItem {
  id: string; // ID único do item no carrinho
  productId?: string; // ID real do produto no catálogo
  name: string;
  price: number; // Em centavos (ex: R$ 149,90 = 14990)
  quantity: number;
  imageUrl: string;
  stock?: number;
  slug?: string;
  customization?: ProductCustomization;
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

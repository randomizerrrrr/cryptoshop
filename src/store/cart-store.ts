import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: {
    btc: number;
    eur: number;
  };
  image: string;
  quantity: number;
  seller: {
    id: string;
    name: string;
    verified: boolean;
  };
  category: string;
  digitalProduct: boolean;
  deliveryTime: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalBtc: () => number;
  getTotalEur: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          } else {
            return {
              items: [...state.items, { ...item, id: Date.now().toString() }],
            };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalBtc: () => {
        return get().items.reduce((total, item) => total + item.price.btc * item.quantity, 0);
      },

      getTotalEur: () => {
        return get().items.reduce((total, item) => total + item.price.eur * item.quantity, 0);
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
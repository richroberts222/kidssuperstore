import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Product } from '../types/models';
import { safeJsonParse } from '../lib/storage';

const CART_KEY = 'kss_cart_v1';

type CartItem = {
  productId: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider(props: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() =>
    safeJsonParse<CartItem[]>(localStorage.getItem(CART_KEY), []),
  );

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  function add(product: Product, qty: number = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (!existing) return [...prev, { productId: product.id, quantity: qty }];
      return prev.map((i) =>
        i.productId === product.id ? { ...i, quantity: Math.min(99, i.quantity + qty) } : i,
      );
    });
  }

  function remove(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function setQty(productId: string, quantity: number) {
    const q = Math.max(1, Math.min(99, quantity));
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)));
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const value = useMemo<CartState>(
    () => ({ items, add, remove, setQty, clear, count }),
    [items, count],
  );

  return <CartContext.Provider value={value}>{props.children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

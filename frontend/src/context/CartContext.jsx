import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

// The cart is { dishId: quantity }. It starts empty.
const INITIAL_CART = {};

export function CartProvider({ children }) {
  const [items, setItems] = useState(INITIAL_CART);

  const change = (id, delta) =>
    setItems((prev) => {
      const qty = Math.max(0, Math.min(20, (prev[id] || 0) + delta));
      const next = { ...prev };
      if (qty) next[id] = qty; else delete next[id];
      return next;
    });

  const value = useMemo(
    () => ({ items, count: Object.values(items).reduce((a, b) => a + b, 0), change, clear: () => setItems({}) }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

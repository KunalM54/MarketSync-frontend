import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "./api";
import type { Cart } from "./types";
import { useAuth } from "./auth";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  count: number;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<Cart>;
  updateQuantity: (variantId: string, quantity: number) => Promise<Cart>;
  removeItem: (variantId: string) => Promise<Cart>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<Cart>("/cart");
      setCart(data);
    } catch {
      // Not signed in or unreachable — keep an empty cart.
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = async (variantId: string, quantity = 1) => {
      const data = await apiRequest<Cart>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ variantId, quantity }),
      });
      setCart(data);
      return data;
    };

    const updateQuantity = async (variantId: string, quantity: number) => {
      const data = await apiRequest<Cart>(`/cart/items/${variantId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      setCart(data);
      return data;
    };

    const removeItem = async (variantId: string) => {
      const data = await apiRequest<Cart>(`/cart/items/${variantId}`, {
        method: "DELETE",
      });
      setCart(data);
      return data;
    };

    return {
      cart,
      loading,
      count: cart?.totalItems ?? 0,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
    };
  }, [cart, loading, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

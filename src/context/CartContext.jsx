import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

// ─── Context ─────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Derived values (never store these in DB) ──────────────────────────────

  // Total number of individual units across all cart items
  const totalUnits = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Subtotal: Σ(price × quantity)
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  // ── Load cart from backend ────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCart();
      setCartItems(data.cart);
    } catch {
      setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Add to cart ───────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId) => {
    const data = await apiAddToCart(productId);
    // Backend returns the full updated cart
    setCartItems(data.cart);
    return data;
  }, []);

  // ── Update quantity ───────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    const data = await apiUpdateQuantity(productId, quantity);
    setCartItems(data.cart);
    return data;
  }, []);

  // ── Remove from cart ──────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    const data = await apiRemoveFromCart(productId);
    setCartItems(data.cart);
    return data;
  }, []);

  // ── Clear local cart state (called on logout) ─────────────────────────────
  const clearCart = useCallback(() => {
    setCartItems([]);
    setError("");
  }, []);

  const value = {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside a <CartProvider>");
  }
  return ctx;
}

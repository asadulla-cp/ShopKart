import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import api from "../services/api";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, totalUnits, subtotal, loadCart } = useCart();

  const [customer, setCustomer] = useState(null);

  // Auth guard + fetch customer for Navbar
  useEffect(() => {
    const getCustomer = async () => {
      try {
        const { data } = await api.get("/customers/me");
        setCustomer(data);
      } catch {
        navigate("/login");
      }
    };
    getCustomer();
  }, [navigate]);

  // Load cart from backend when the page mounts
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <>
      <Navbar customer={customer} wishlistCount={0} />

      <main className="cart-main">
        <div className="cart-container">

          {/* ── Loading State ── */}
          {loading && (
            <div className="products-state-wrapper">
              <div className="spinner"></div>
              <p>Loading your cart...</p>
            </div>
          )}

          {/* ── Error State ── */}
          {!loading && error && (
            <div className="products-state-wrapper">
              <span className="state-icon">⚠️</span>
              <p className="state-message error-message">Unable to load your cart.</p>
              <button className="btn-primary btn-retry" onClick={loadCart}>
                Try Again
              </button>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && !error && cartItems.length === 0 && (
            <div className="products-state-wrapper cart-empty">
              <span className="state-icon">🛒</span>
              <p className="state-message">Your cart is empty</p>
              <p className="state-sub">Looks like you haven&apos;t added anything yet.</p>
              <button
                className="btn-primary btn-retry"
                onClick={() => navigate("/products")}
              >
                Browse Products
              </button>
            </div>
          )}

          {/* ── Cart Content ── */}
          {!loading && !error && cartItems.length > 0 && (
            <div className="cart-layout">

              {/* Left — Cart Items */}
              <section className="cart-items-section">
                <h2 className="cart-title">🛒 My Cart</h2>
                <p className="cart-subtitle">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} · {totalUnits} unit{totalUnits !== 1 ? "s" : ""}
                </p>

                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <CartItem key={item.product._id} item={item} />
                  ))}
                </div>
              </section>

              {/* Right — Order Summary */}
              <aside className="order-summary">
                <h3 className="order-summary-title">Order Summary</h3>

                <div className="order-summary-row">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>

                <div className="order-summary-row">
                  <span>Total Units</span>
                  <span>{totalUnits}</span>
                </div>

                <div className="order-summary-divider" />

                <div className="order-summary-row order-summary-subtotal">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <p className="order-summary-note">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  className="btn-checkout"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>

                <button
                  className="btn-continue-shopping"
                  onClick={() => navigate("/products")}
                >
                  ← Continue Shopping
                </button>
              </aside>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

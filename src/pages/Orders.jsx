import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { fetchOrders } from "../services/api";
import api from "../services/api";

/**
 * Orders — My Orders page (/orders)
 *
 * Shows all orders placed by the authenticated user, newest first.
 * Handles loading, empty and error states.
 */
export default function Orders() {
  const navigate = useNavigate();

  const [customer, setCustomer]   = useState(null);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // ── Auth guard ────────────────────────────────────────────────────────────
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

  // ── Load orders ───────────────────────────────────────────────────────────
  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOrders();
      setOrders(data.orders);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <>
      <Navbar customer={customer} wishlistCount={0} />

      <main className="orders-main">
        <div className="orders-container">
          <h2 className="orders-title">📦 My Orders</h2>

          {/* ── Loading State ─────────────────────────────────────────────── */}
          {loading && (
            <div className="products-state-wrapper">
              <div className="spinner" />
              <p>Loading your orders…</p>
            </div>
          )}

          {/* ── Error State ───────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="products-state-wrapper">
              <span className="state-icon">⚠️</span>
              <p className="state-message error-message">{error}</p>
              <button className="btn-primary btn-retry" onClick={loadOrders}>
                Try Again
              </button>
            </div>
          )}

          {/* ── Empty State ───────────────────────────────────────────────── */}
          {!loading && !error && orders.length === 0 && (
            <div className="products-state-wrapper orders-empty">
              <span className="state-icon">📦</span>
              <p className="state-message">You haven&apos;t placed any orders yet.</p>
              <p className="state-sub">
                Browse our products and place your first order!
              </p>
              <button
                className="btn-primary btn-retry"
                onClick={() => navigate("/products")}
              >
                Start Shopping
              </button>
            </div>
          )}

          {/* ── Orders List ───────────────────────────────────────────────── */}
          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

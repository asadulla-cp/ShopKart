import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchOrderById } from "../services/api";
import api from "../services/api";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth guard
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

  // Fetch the order
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchOrderById(id);
        setOrder(data.order);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load order details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const statusLabel = {
    PENDING_PAYMENT: "⏳ Pending Payment",
    PLACED: "✅ Placed",
    CONFIRMED: "📦 Confirmed",
    SHIPPED: "🚚 Shipped",
    DELIVERED: "🎉 Delivered",
  };

  return (
    <>
      <Navbar customer={customer} wishlistCount={0} />

      <main className="order-success-main">

        {loading && (
          <div className="products-state-wrapper">
            <div className="spinner" />
            <p>Loading your order…</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-state-wrapper">
            <span className="state-icon">⚠️</span>
            <p className="state-message error-message">{error}</p>
            <button className="btn-primary btn-retry" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-success-card">
            {/* Header */}
            <div className="order-success-header">
              <span className="order-success-icon">✅</span>
              <h2 className="order-success-title">Order Placed Successfully!</h2>
              <p className="order-success-subtitle">
                Thank you for shopping with ShopKart.
              </p>
            </div>

            {/* Order Meta */}
            <div className="order-success-meta">
              <div className="order-meta-row">
                <span className="order-meta-label">Order ID</span>
                <span className="order-meta-value order-id-text">{order._id}</span>
              </div>
              <div className="order-meta-row">
                <span className="order-meta-label">Placed On</span>
                <span className="order-meta-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-meta-row">
                <span className="order-meta-label">Status</span>
                <span className="order-meta-value">
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </span>
              </div>
              <div className="order-meta-row">
                <span className="order-meta-label">Payment</span>
                <span className="order-meta-value">
                  <span className={`payment-status-badge payment-${order.paymentStatus}`}>
                    {order.paymentStatus}
                  </span>
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="order-success-items">
              <h4 className="order-success-items-title">Items Ordered</h4>
              {order.items.map((item, i) => (
                <div key={i} className="order-success-item-row">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-success-item-thumb"
                      onError={(e) => { e.target.src = "https://placehold.co/48x48?text=?"; }}
                    />
                  )}
                  <div className="order-success-item-info">
                    <span className="order-success-item-name">{item.name}</span>
                    <span className="order-success-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="order-success-item-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="order-success-total">
              <span>Total Paid</span>
              <span className="order-success-total-value">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Shipping address */}
            <div className="order-success-address">
              <h4 className="order-success-items-title">Deliver To</h4>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.pincode}
              </p>
              <p>📞 {order.shippingAddress.phone}</p>
            </div>

            {/* Actions */}
            <div className="order-success-actions">
              <button
                className="btn-primary"
                onClick={() => navigate("/orders")}
              >
                View My Orders
              </button>
              <button
                className="btn-continue-shopping"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

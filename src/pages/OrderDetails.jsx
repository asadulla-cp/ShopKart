import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchOrderById, updateOrderStatus } from "../services/api";
import api from "../services/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  PENDING_PAYMENT: "⏳ Pending Payment",
  PLACED:          "✅ Placed",
  CONFIRMED:       "📦 Confirmed",
  SHIPPED:         "🚚 Shipped",
  DELIVERED:       "🎉 Delivered",
};

const PAYMENT_LABEL = {
  PENDING: "⏳ Pending",
  PAID:    "✅ Paid",
  FAILED:  "❌ Failed",
};

// Status progression — Bonus feature
const NEXT_STATUS = {
  PLACED:    "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED:   "DELIVERED",
};

/**
 * OrderDetails — Single order view (/orders/:id)
 *
 * Shows full details of one order including items snapshot, shipping address,
 * payment info and order status.  Also includes the Bonus status progression UI.
 */
export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer]         = useState(null);
  const [order, setOrder]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMsg, setStatusMsg]       = useState("");

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

  // ── Fetch order ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchOrderById(id);
        setOrder(data.order);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403 || status === 404) {
          setError("Order not found or you don't have permission to view it.");
        } else {
          setError(err?.response?.data?.message || "Could not load order details.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Bonus: Advance status ─────────────────────────────────────────────────
  const handleAdvanceStatus = async () => {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    setStatusUpdating(true);
    setStatusMsg("");
    try {
      const data = await updateOrderStatus(order._id, next);
      setOrder(data.order);
      setStatusMsg(`Status updated to ${next}.`);
    } catch (err) {
      setStatusMsg(err?.response?.data?.message || "Could not update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Navbar customer={customer} wishlistCount={0} />

      <main className="order-details-main">
        <div className="order-details-container">

          {/* ── Loading ─────────────────────────────────────────────────── */}
          {loading && (
            <div className="products-state-wrapper">
              <div className="spinner" />
              <p>Loading order details…</p>
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="products-state-wrapper">
              <span className="state-icon">⚠️</span>
              <p className="state-message error-message">{error}</p>
              <button
                className="btn-primary btn-retry"
                onClick={() => navigate("/orders")}
              >
                Back to My Orders
              </button>
            </div>
          )}

          {/* ── Order Content ────────────────────────────────────────────── */}
          {!loading && !error && order && (
            <div className="order-details-card">
              {/* Back link */}
              <button
                className="btn-back-link"
                onClick={() => navigate("/orders")}
              >
                ← Back to My Orders
              </button>

              {/* Header */}
              <div className="order-details-header">
                <div>
                  <h2 className="order-details-title">Order Details</h2>
                  <p className="order-details-id">
                    #{order._id.slice(-10).toUpperCase()}
                  </p>
                  <p className="order-details-date">{formatDate(order.createdAt)}</p>
                </div>

                <div className="order-details-badges">
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className={`payment-status-badge payment-${order.paymentStatus}`}>
                    {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="order-details-grid">
                {/* ── Items ─────────────────────────────────────────────── */}
                <section className="order-details-section">
                  <h3 className="order-details-section-title">Items Ordered</h3>
                  <div className="order-details-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-details-item-row">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-details-item-thumb"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/56x56?text=?";
                            }}
                          />
                        )}
                        <div className="order-details-item-info">
                          <span className="order-details-item-name">{item.name}</span>
                          <span className="order-details-item-qty">
                            ₹{item.price.toLocaleString("en-IN")} &times; {item.quantity}
                          </span>
                        </div>
                        <span className="order-details-item-subtotal">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="order-details-total">
                    <span>Total Paid</span>
                    <span className="order-details-total-value">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </section>

                {/* ── Shipping + Payment ────────────────────────────────── */}
                <div className="order-details-side">
                  {/* Shipping Address */}
                  <section className="order-details-section order-details-address-card">
                    <h3 className="order-details-section-title">Deliver To</h3>
                    <p className="order-address-name">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} — {order.shippingAddress.pincode}
                    </p>
                    <p>📞 {order.shippingAddress.phone}</p>
                  </section>

                  {/* Payment Info */}
                  <section className="order-details-section">
                    <h3 className="order-details-section-title">Payment Info</h3>
                    <div className="order-details-meta-row">
                      <span>Payment Status</span>
                      <span className={`payment-status-badge payment-${order.paymentStatus}`}>
                        {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
                      </span>
                    </div>
                    {order.razorpayOrderId && (
                      <div className="order-details-meta-row">
                        <span>Razorpay Order ID</span>
                        <span className="order-id-text">{order.razorpayOrderId}</span>
                      </div>
                    )}
                    {order.razorpayPaymentId && (
                      <div className="order-details-meta-row">
                        <span>Payment ID</span>
                        <span className="order-id-text">{order.razorpayPaymentId}</span>
                      </div>
                    )}
                  </section>

                  {/* ── Bonus: Status Progression ─────────────────────── */}
                  {NEXT_STATUS[order.status] && (
                    <section className="order-details-section order-status-advance">
                      <h3 className="order-details-section-title">
                        🎓 Admin — Advance Status
                      </h3>
                      <p className="order-advance-note">
                        Next: <strong>{NEXT_STATUS[order.status]}</strong>
                      </p>
                      {statusMsg && (
                        <p className="order-advance-msg">{statusMsg}</p>
                      )}
                      <button
                        className="btn-advance-status"
                        onClick={handleAdvanceStatus}
                        disabled={statusUpdating}
                      >
                        {statusUpdating
                          ? "Updating…"
                          : `Mark as ${NEXT_STATUS[order.status]}`}
                      </button>
                    </section>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="order-details-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/orders")}
                >
                  ← Back to My Orders
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

        </div>
      </main>
    </>
  );
}

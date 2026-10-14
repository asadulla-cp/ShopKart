import { useNavigate } from "react-router-dom";

// ─── Status display helpers ───────────────────────────────────────────────────
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

/**
 * OrderCard — displays a summary of one order.
 * Used in the My Orders list (/orders).
 *
 * Props:
 *  order  — the order document from the backend
 */
export default function OrderCard({ order }) {
  const navigate = useNavigate();

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="order-card">
      {/* ── Header ── */}
      <div className="order-card-header">
        <div className="order-card-id">
          <span className="order-card-label">Order ID</span>
          <span className="order-card-id-value">#{order._id.slice(-8).toUpperCase()}</span>
        </div>
        <span className="order-card-date">{formattedDate}</span>
      </div>

      {/* ── Items preview ── */}
      <div className="order-card-items">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="order-card-item-row">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="order-card-item-thumb"
                onError={(e) => { e.target.src = "https://placehold.co/40x40?text=?"; }}
              />
            )}
            <span className="order-card-item-name">
              {item.name} &times; {item.quantity}
            </span>
            <span className="order-card-item-price">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="order-card-more">+{order.items.length - 3} more item(s)</p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="order-card-footer">
        <div className="order-card-meta">
          <div className="order-card-total">
            <span className="order-card-total-label">Total</span>
            <span className="order-card-total-value">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="order-card-statuses">
            <span className={`order-status-badge order-status-${order.status}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
            <span className={`payment-status-badge payment-${order.paymentStatus}`}>
              {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
            </span>
          </div>
        </div>

        <button
          className="btn-view-order"
          onClick={() => navigate(`/orders/${order._id}`)}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

/**
 * OrderSummary — displays a read-only order summary panel.
 *
 * Props:
 *  cartItems — array of { product: { _id, name, price, image }, quantity }
 *  subtotal  — number (₹)
 *  totalUnits — number
 */
export default function OrderSummary({ cartItems, subtotal, totalUnits }) {
  if (!cartItems || cartItems.length === 0) {
    return (
      <aside className="checkout-summary order-summary-empty">
        <p>Your cart is empty.</p>
      </aside>
    );
  }

  return (
    <aside className="checkout-summary">
      <h3 className="checkout-section-title">Order Summary</h3>

      {/* Items list */}
      <div className="checkout-items-list">
        {cartItems.map((item) => (
          <div key={item.product._id} className="checkout-item-row">
            <div className="checkout-item-info">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="checkout-item-thumb"
                onError={(e) => {
                  e.target.src = "https://placehold.co/48x48?text=?";
                }}
              />
              <span className="checkout-item-name">
                {item.product.name} &times; {item.quantity}
              </span>
            </div>
            <span className="checkout-item-price">
              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <div className="checkout-summary-divider" />

      {/* Meta rows */}
      <div className="checkout-summary-row">
        <span>Items</span>
        <span>{cartItems.length}</span>
      </div>
      <div className="checkout-summary-row">
        <span>Total Units</span>
        <span>{totalUnits}</span>
      </div>

      <div className="checkout-summary-divider" />

      {/* Total */}
      <div className="checkout-summary-row checkout-total-row">
        <span>Total</span>
        <span>₹{subtotal.toLocaleString("en-IN")}</span>
      </div>

      <p className="checkout-payment-note">
        💳 Secure payment powered by Razorpay (Test Mode)
      </p>
    </aside>
  );
}

import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const lineTotal = (product.price * quantity).toLocaleString("en-IN");

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  const handleIncrease = async () => {
    if (updating) return;
    setUpdating(true);
    setError("");
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      showError(err?.response?.data?.message || "Could not update quantity.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrease = async () => {
    if (updating || quantity <= 1) return; // Do not go below 1 — use Remove for that
    setUpdating(true);
    setError("");
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      showError(err?.response?.data?.message || "Could not update quantity.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    setError("");
    try {
      await removeFromCart(product._id);
    } catch (err) {
      setRemoving(false);
      showError(err?.response?.data?.message || "Could not remove item.");
    }
    // No finally — if successful, CartContext updates cartItems and this component unmounts
  };

  return (
    <div className="cart-item">
      {/* Product Image */}
      <div className="cart-item-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.src = "https://placehold.co/120x100?text=No+Image";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="cart-item-info">
        <span className="cart-item-category">{product.category}</span>
        <h3 className="cart-item-name">{product.name}</h3>
        <p className="cart-item-unit-price">
          ₹{Number(product.price).toLocaleString("en-IN")} per unit
        </p>

        {/* Stock hint */}
        <p className="cart-item-stock-hint">
          {product.stock} unit{product.stock !== 1 ? "s" : ""} available
        </p>

        {/* Error message */}
        {error && <p className="cart-item-error">{error}</p>}

        {/* Quantity Controls */}
        <div className="cart-item-controls">
          <div className="quantity-controls">
            <button
              className="qty-btn"
              onClick={handleDecrease}
              disabled={updating || quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span className="qty-value">{quantity}</span>

            <button
              className="qty-btn"
              onClick={handleIncrease}
              disabled={updating || quantity >= product.stock}
              aria-label="Increase quantity"
            >
              +
            </button>

            {updating && <span className="qty-updating">...</span>}
          </div>

          <button
            className="btn-remove"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="cart-item-line-total">
        <span className="cart-item-total-label">Subtotal</span>
        <span className="cart-item-total-value">₹{lineTotal}</span>
      </div>
    </div>
  );
}

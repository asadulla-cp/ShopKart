import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  // Wishlist interaction states
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  // Cart interaction states
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartSuccess, setCartSuccess] = useState("");

  // Check if this product is already in the cart
  const isInCart = cartItems.some((item) => item.product?._id === product._id);

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleToggleWishlist = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistError("");

    try {
      const result = await toggleWishlist(product._id);
      setWishlisted(result.saved);
      if (onWishlistChange) onWishlistChange(product._id, result.saved);
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to save product. Please try again.";
      setWishlistError(msg);
      setTimeout(() => setWishlistError(""), 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || product.stock === 0) return;
    setCartLoading(true);
    setCartError("");
    setCartSuccess("");

    try {
      await addToCart(product._id);
      setCartSuccess("Added!");
      setTimeout(() => setCartSuccess(""), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not add to cart. Please try again.";
      setCartError(msg);
      setTimeout(() => setCartError(""), 3000);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="product-card">
      {/* Floating heart badge */}
      <button
        className={`wishlist-badge ${wishlisted ? "wishlisted" : ""}`}
        onClick={handleToggleWishlist}
        disabled={wishlistLoading}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {wishlisted ? "♥" : "♡"}
      </button>

      <div className="product-card-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300?text=No+Image";
          }}
        />
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-footer">
          <span className="product-card-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <span className={`product-card-stock ${product.stock === 0 ? "out-of-stock" : ""}`}>
            {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
          </span>
        </div>

        {/* Error / success messages */}
        {wishlistError && <p className="wishlist-error">{wishlistError}</p>}
        {cartError && <p className="cart-error">{cartError}</p>}
        {cartSuccess && <p className="cart-success">{cartSuccess}</p>}

        {/* Action buttons */}
        <div className="product-card-actions">
          <button className="btn-view-details" onClick={handleViewDetails}>
            View Details
          </button>

          <button
            className={`btn-wishlist ${wishlisted ? "btn-wishlisted" : ""}`}
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
          >
            {wishlistLoading
              ? "⏳ Saving..."
              : wishlisted
              ? "♥ Wishlisted"
              : "♡ Wishlist"}
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          className={`btn-add-to-cart ${isInCart ? "btn-in-cart" : ""}`}
          onClick={handleAddToCart}
          disabled={cartLoading || product.stock === 0}
        >
          {product.stock === 0
            ? "Out of Stock"
            : cartLoading
            ? "Adding..."
            : isInCart
            ? "Add Another"
            : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeFromWishlist } from "../services/api";

export default function WishlistCard({ product, onRemoved }) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    setRemoveError("");
    try {
      await removeFromWishlist(product._id);
      // Notify parent to remove this card from the list
      if (onRemoved) onRemoved(product._id);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not remove product. Try again.";
      setRemoveError(msg);
      setTimeout(() => setRemoveError(""), 3000);
      setRemoving(false);
    }
  };

  return (
    <div className="wishlist-card">
      <div className="wishlist-card-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="wishlist-card-image"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300?text=No+Image";
          }}
        />
      </div>

      <div className="wishlist-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="wishlist-card-name">{product.name}</h3>

        <div className="product-card-footer">
          <span className="product-card-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <span className={`product-card-stock ${product.stock === 0 ? "out-of-stock" : ""}`}>
            {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
          </span>
        </div>

        {removeError && <p className="wishlist-error">{removeError}</p>}

        <div className="wishlist-card-actions">
          <button className="btn-view-details" onClick={handleViewDetails}>
            View Details
          </button>
          <button
            className="btn-remove-wishlist"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "Removing..." : "♥ Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

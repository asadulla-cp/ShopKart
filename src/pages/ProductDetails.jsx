import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchProductById } from "../services/api";
import api from "../services/api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Auth state
  const [customer, setCustomer] = useState(null);

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cart feedback state (UI only — no backend in this lab)
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch logged-in customer (for Navbar & auth guard)
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

  // Fetch the product by URL param id
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProductById(id);
        setProduct(data.product);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setError("Product not found.");
        } else if (status === 400) {
          setError("Invalid product ID.");
        } else {
          setError("Something went wrong while loading the product.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Cart backend will be implemented in Lab 04
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <Navbar customer={customer} />

      <main className="product-details-main">

        {/* Back button */}
        <button className="btn-back" onClick={() => navigate("/products")}>
          ← Back to Products
        </button>

        {/* ── Loading State ── */}
        {loading && (
          <div className="products-state-wrapper">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="products-state-wrapper">
            <span className="state-icon">⚠️</span>
            <p className="state-message error-message">{error}</p>
            <button className="btn-primary btn-retry" onClick={() => navigate("/products")}>
              Back to Products
            </button>
          </div>
        )}

        {/* ── Product Detail ── */}
        {!loading && !error && product && (
          <div className="product-details-card">
            {/* Image */}
            <div className="product-details-image-wrapper">
              <img
                src={product.image}
                alt={product.name}
                className="product-details-image"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400?text=No+Image";
                }}
              />
            </div>

            {/* Info */}
            <div className="product-details-info">
              <span className="product-details-category">{product.category}</span>
              <h1 className="product-details-name">{product.name}</h1>
              <p className="product-details-description">{product.description}</p>

              <div className="product-details-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </div>

              <div className={`product-details-stock ${product.stock === 0 ? "out-of-stock" : ""}`}>
                {product.stock === 0
                  ? "⛔ Out of Stock"
                  : `✅ ${product.stock} units available`}
              </div>

              {/* Add to Cart — UI only, no backend in Lab 03 */}
              <button
                className={`btn-add-to-cart ${addedToCart ? "added" : ""}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addedToCart}
              >
                {addedToCart ? "✓ Added to Cart!" : "🛒 Add to Cart"}
              </button>

              <p className="cart-note">
                * Cart functionality will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

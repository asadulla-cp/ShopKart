import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { fetchWishlist } from "../services/api";
import api from "../services/api";

export default function Wishlist() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch logged-in customer (auth guard + Navbar)
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

  // Fetch wishlist from backend
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWishlist();
      setWishlist(data.wishlist);
    } catch {
      setError("Something went wrong. We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Called by WishlistCard when a product is successfully removed
  const handleRemoved = (productId) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  return (
    <>
      <Navbar customer={customer} wishlistCount={wishlist.length} />

      <main className="wishlist-main">

        {/* ── Loading State ── */}
        {loading && (
          <div className="products-state-wrapper">
            <div className="spinner"></div>
            <p>Loading your wishlist...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="products-state-wrapper">
            <span className="state-icon">⚠️</span>
            <p className="state-message error-message">Something went wrong.</p>
            <p className="state-sub">We couldn't load your wishlist.</p>
            <button className="btn-primary btn-retry" onClick={loadWishlist}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="products-state-wrapper wishlist-empty">
            <span className="state-icon">❤️</span>
            <p className="state-message">Your wishlist is empty</p>
            <p className="state-sub">Save products you love and find them here later.</p>
            <button className="btn-primary btn-retry" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        )}

        {/* ── Wishlist Grid ── */}
        {!loading && !error && wishlist.length > 0 && (
          <>
            <div className="wishlist-header">
              <h2 className="products-title">❤️ My Wishlist</h2>
              <p className="products-subtitle">
                {wishlist.length} product{wishlist.length !== 1 ? "s" : ""} saved
              </p>
            </div>

            <div className="products-grid">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemoved={handleRemoved}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

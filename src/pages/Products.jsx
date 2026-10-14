import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { fetchProducts, fetchWishlist } from "../services/api";
import api from "../services/api";

export default function Products() {
  const navigate = useNavigate();

  // Auth state
  const [customer, setCustomer] = useState(null);

  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter / search state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // Wishlist IDs (for showing ♥ on already-wishlisted cards)
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch logged-in customer (for Navbar)
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

  // Fetch current wishlist IDs so cards can show correct initial state
  useEffect(() => {
    const loadWishlistIds = async () => {
      try {
        const data = await fetchWishlist();
        setWishlistIds(new Set(data.wishlist.map((p) => p._id)));
      } catch {
        // Non-critical — wishlist state just defaults to not-saved
      }
    };
    loadWishlistIds();
  }, []);

  // Fetch products whenever search / category / sort changes
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts({ search, category, sort });
      setProducts(data.products);
    } catch {
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts();
    }, 400);
    return () => clearTimeout(timeout);
  }, [loadProducts]);

  // Keep wishlist IDs in sync when user toggles from the product card
  const handleWishlistChange = (productId, isSaved) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  return (
    <>
      <Navbar customer={customer} wishlistCount={wishlistIds.size} />

      <main className="products-main">
        <div className="products-header">
          <h2 className="products-title">🛍️ Product Catalogue</h2>
          <p className="products-subtitle">Discover our latest collection</p>
        </div>

        {/* Search & Filter Bar */}
        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        {/* ── Loading State ── */}
        {loading && (
          <div className="products-state-wrapper">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="products-state-wrapper">
            <span className="state-icon">⚠️</span>
            <p className="state-message error-message">{error}</p>
            <button className="btn-primary btn-retry" onClick={loadProducts}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && products.length === 0 && (
          <div className="products-state-wrapper">
            <span className="state-icon">🔍</span>
            <p className="state-message">No products found.</p>
            {(search || category) && (
              <button
                className="btn-primary btn-retry"
                onClick={() => { setSearch(""); setCategory(""); setSort(""); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Products Grid ── */}
        {!loading && !error && products.length > 0 && (
          <>
            <p className="products-count">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialWishlisted={wishlistIds.has(product._id)}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

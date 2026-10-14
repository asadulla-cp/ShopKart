import { useNavigate, NavLink } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar({ customer, wishlistCount }) {
  const navigate = useNavigate();
  const { totalUnits, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch {
      // redirect regardless
    } finally {
      clearCart(); // wipe local cart state on logout
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛒</span>
        <span className="brand-name">ShopKart</span>
      </div>

      {/* Navigation links */}
      <div className="navbar-links">
        <NavLink
          to="/home"
          className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
        >
          Home
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
        >
          Products
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `nav-link nav-link-wishlist ${isActive ? "nav-link-active" : ""}`
          }
        >
          ❤️ Wishlist
          {wishlistCount > 0 && (
            <span className="wishlist-count-badge">{wishlistCount}</span>
          )}
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `nav-link nav-link-cart ${isActive ? "nav-link-active" : ""}`
          }
        >
          🛒 Cart
          {/* Dynamic cart count — total units from global state */}
          {totalUnits > 0 && (
            <span className="cart-count-badge">{totalUnits}</span>
          )}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `nav-link nav-link-orders ${isActive ? "nav-link-active" : ""}`
          }
        >
          📦 My Orders
        </NavLink>
      </div>

      <div className="navbar-right">
        {customer && (
          <span className="navbar-greeting">
            Hello, <strong>{customer.fullName}</strong>
          </span>
        )}
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

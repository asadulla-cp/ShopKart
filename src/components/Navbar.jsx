import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Navbar({ customer }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout endpoint — backend clears the HttpOnly cookie
      await api.post("/customers/logout");
    } catch {
      // Even if the request fails, clear local state and redirect
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛒</span>
        <span className="brand-name">ShopKart</span>
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

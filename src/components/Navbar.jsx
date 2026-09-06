import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Navbar({ customer }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch {
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

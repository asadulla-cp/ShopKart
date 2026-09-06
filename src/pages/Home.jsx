import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the logged-in customer using the HttpOnly cookie
    // If the cookie is missing or expired, the backend returns 401 and we
    // redirect to /login — this is what makes the route "protected"
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/customers/me");
        setCustomer(data);
      } catch {
        // Not authenticated — redirect to login
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar customer={customer} />

      <main className="home-main">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Welcome back, {customer?.fullName}! 👋</h2>
            <p>Glad to see you at ShopKart</p>
          </div>
          <span className="welcome-emoji">🛍️</span>
        </div>

        {/* Profile Card */}
        <div className="profile-section">
          <h3 className="section-title">Your Profile</h3>
          <div className="profile-card">
            {/* Avatar */}
            <div className="avatar">
              {customer?.fullName?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{customer?.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{customer?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{customer?.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer ID</span>
                <span className="detail-value detail-id">{customer?._id}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

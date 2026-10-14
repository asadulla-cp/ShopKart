import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import api from "../services/api";

// ─── Dynamically load the Razorpay Standard Checkout script ──────────────────
// We load it on demand so it does not block the initial page load.
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Client-side shipping form validation ────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!form.pincode.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Pincode must contain exactly 6 digits.";
  }
  return errors;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalUnits, clearCart } = useCart();

  const [customer, setCustomer] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Shipping form state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Auth guard + prefill name/phone from customer profile
  useEffect(() => {
    const getCustomer = async () => {
      try {
        const { data } = await api.get("/customers/me");
        setCustomer(data);
        setForm((prev) => ({
          ...prev,
          fullName: data.fullName || "",
          phone: data.phone || "",
        }));
      } catch {
        navigate("/login");
      }
    };
    getCustomer();
  }, [navigate]);

  // Redirect away if cart is empty (direct URL access guard)
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      // Give CartContext a moment to hydrate before redirecting
      const t = setTimeout(() => {
        if (cartItems.length === 0) navigate("/cart");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the specific field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePlaceOrder = async () => {
    // 1. Client-side validation — do not call backend with invalid data
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setBackendError("");
    setPaymentError("");
    setPlacing(true);

    try {
      // 2. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setBackendError("Could not load payment gateway. Check your internet connection.");
        setPlacing(false);
        return;
      }

      // 3. Create ShopKart pending order + Razorpay Order on the backend
      //    Backend validates cart, stock, calculates total — we trust its numbers
      const orderData = await createPaymentOrder({ shippingAddress: form });

      // 4. Configure Razorpay Standard Checkout
      const options = {
        key: orderData.key,             // Key ID (safe to use in browser)
        amount: orderData.amount,       // In paise (set by backend)
        currency: orderData.currency,
        name: "ShopKart",
        description: "ShopKart Purchase",
        order_id: orderData.razorpayOrderId,

        prefill: {
          name: form.fullName,
          contact: form.phone,
        },

        theme: { color: "#667eea" },

        // ── Called when user closes the modal without paying ─────────────────
        modal: {
          ondismiss: () => {
            setPaymentError("Payment was cancelled. Your cart has not been cleared. You can try again.");
            setPlacing(false);
          },
        },

        // ── Handler: called by Razorpay after successful payment in the modal ─
        // The browser returning this does NOT mean the payment is valid.
        // We must verify the HMAC signature on the backend.
        handler: async function (response) {
          try {
            const verifyData = await verifyPayment({
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              // Backend has cleared cart in DB — sync frontend state too
              clearCart();
              navigate(`/order-success/${verifyData.order._id}`);
            } else {
              setPaymentError(verifyData.message || "Payment verification failed.");
              setPlacing(false);
            }
          } catch (err) {
            setPaymentError(
              err?.response?.data?.message || "Payment verification failed. Please contact support."
            );
            setPlacing(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);

      // ── Handle payment failure (card declined, bank error, etc.) ───────────
      paymentObject.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        setPaymentError(
          `Payment failed: ${response.error?.description || "Please try again."} Your cart has not been cleared.`
        );
        setPlacing(false);
      });

      // ── Handle modal close / dismiss (user pressed the ✕ button) ───────────
      options.modal = {
        ondismiss: () => {
          setPaymentError("Payment was cancelled. Your cart has not been cleared. You can try again.");
          setPlacing(false);
        },
      };

      // Open the Razorpay Checkout modal
      paymentObject.open();
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not initiate checkout. Please try again.";
      setBackendError(msg);
      setPlacing(false);
    }
  };

  return (
    <>
      <Navbar customer={customer} wishlistCount={0} />

      <main className="checkout-main">
        <div className="checkout-container">
          <h2 className="checkout-title">🛒 Checkout</h2>

          <div className="checkout-layout">
            {/* ── Left: Shipping Form ─────────────────────────────────────── */}
            <section className="checkout-form-section">
              <h3 className="checkout-section-title">Shipping Details</h3>

              <div className="checkout-form">
                {/* Full Name */}
                <div className="checkout-field">
                  <label htmlFor="fullName" className="checkout-label">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className={`checkout-input ${fieldErrors.fullName ? "input-error" : ""}`}
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    autoComplete="name"
                  />
                  {fieldErrors.fullName && (
                    <p className="field-error">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="checkout-field">
                  <label htmlFor="phone" className="checkout-label">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`checkout-input ${fieldErrors.phone ? "input-error" : ""}`}
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    autoComplete="tel"
                    maxLength={10}
                  />
                  {fieldErrors.phone && (
                    <p className="field-error">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="checkout-field">
                  <label htmlFor="addressLine1" className="checkout-label">Address</label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    type="text"
                    className={`checkout-input ${fieldErrors.addressLine1 ? "input-error" : ""}`}
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="e.g. 22 MG Road, Koramangala"
                    autoComplete="street-address"
                  />
                  {fieldErrors.addressLine1 && (
                    <p className="field-error">{fieldErrors.addressLine1}</p>
                  )}
                </div>

                {/* City + State row */}
                <div className="checkout-row">
                  <div className="checkout-field">
                    <label htmlFor="city" className="checkout-label">City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className={`checkout-input ${fieldErrors.city ? "input-error" : ""}`}
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru"
                      autoComplete="address-level2"
                    />
                    {fieldErrors.city && (
                      <p className="field-error">{fieldErrors.city}</p>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="state" className="checkout-label">State</label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className={`checkout-input ${fieldErrors.state ? "input-error" : ""}`}
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Karnataka"
                      autoComplete="address-level1"
                    />
                    {fieldErrors.state && (
                      <p className="field-error">{fieldErrors.state}</p>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div className="checkout-field checkout-field-half">
                  <label htmlFor="pincode" className="checkout-label">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    className={`checkout-input ${fieldErrors.pincode ? "input-error" : ""}`}
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560001"
                    maxLength={6}
                  />
                  {fieldErrors.pincode && (
                    <p className="field-error">{fieldErrors.pincode}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Right: Order Summary + Place Order ─────────────────────── */}
            <aside className="checkout-summary">
              <h3 className="checkout-section-title">Order Summary</h3>

              <div className="checkout-items-list">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="checkout-item-row">
                    <div className="checkout-item-info">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="checkout-item-thumb"
                        onError={(e) => { e.target.src = "https://placehold.co/48x48?text=?"; }}
                      />
                      <span className="checkout-item-name">
                        {item.product.name} × {item.quantity}
                      </span>
                    </div>
                    <span className="checkout-item-price">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-row">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Total Units</span>
                <span>{totalUnits}</span>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-row checkout-total-row">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <p className="checkout-payment-note">
                💳 Secure payment powered by Razorpay (Test Mode)
              </p>

              {/* Backend or stock error */}
              {backendError && (
                <div className="checkout-alert checkout-alert-error">{backendError}</div>
              )}

              {/* Payment failure message */}
              {paymentError && (
                <div className="checkout-alert checkout-alert-error">{paymentError}</div>
              )}

              <button
                className="btn-place-order"
                onClick={handlePlaceOrder}
                disabled={placing || cartItems.length === 0}
              >
                {placing ? (
                  <span className="btn-loading-text">
                    <span className="btn-spinner" />
                    Processing…
                  </span>
                ) : (
                  "Place Order & Pay"
                )}
              </button>

              <button
                className="btn-back-to-cart"
                onClick={() => navigate("/cart")}
                disabled={placing}
              >
                ← Back to Cart
              </button>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

/**
 * CheckoutForm — Shipping address form with field-level validation display.
 *
 * Props:
 *  form         — { fullName, phone, addressLine1, city, state, pincode }
 *  fieldErrors  — { [fieldName]: errorMessage }
 *  onChange     — handler(e) called on any input change
 *  disabled     — bool  (true while payment is processing)
 */
export default function CheckoutForm({ form, fieldErrors, onChange, disabled }) {
  return (
    <section className="checkout-form-section">
      <h3 className="checkout-section-title">Shipping Details</h3>

      <div className="checkout-form">
        {/* Full Name */}
        <div className="checkout-field">
          <label htmlFor="fullName" className="checkout-label">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={`checkout-input ${fieldErrors.fullName ? "input-error" : ""}`}
            value={form.fullName}
            onChange={onChange}
            placeholder="e.g. Aarav Sharma"
            autoComplete="name"
            disabled={disabled}
          />
          {fieldErrors.fullName && (
            <p className="field-error">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Phone */}
        <div className="checkout-field">
          <label htmlFor="phone" className="checkout-label">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={`checkout-input ${fieldErrors.phone ? "input-error" : ""}`}
            value={form.phone}
            onChange={onChange}
            placeholder="e.g. 9876543210"
            autoComplete="tel"
            maxLength={10}
            disabled={disabled}
          />
          {fieldErrors.phone && (
            <p className="field-error">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Address Line */}
        <div className="checkout-field">
          <label htmlFor="addressLine1" className="checkout-label">
            Address
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            type="text"
            className={`checkout-input ${fieldErrors.addressLine1 ? "input-error" : ""}`}
            value={form.addressLine1}
            onChange={onChange}
            placeholder="e.g. 22 MG Road, Koramangala"
            autoComplete="street-address"
            disabled={disabled}
          />
          {fieldErrors.addressLine1 && (
            <p className="field-error">{fieldErrors.addressLine1}</p>
          )}
        </div>

        {/* City + State — side by side */}
        <div className="checkout-row">
          <div className="checkout-field">
            <label htmlFor="city" className="checkout-label">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className={`checkout-input ${fieldErrors.city ? "input-error" : ""}`}
              value={form.city}
              onChange={onChange}
              placeholder="e.g. Bengaluru"
              autoComplete="address-level2"
              disabled={disabled}
            />
            {fieldErrors.city && (
              <p className="field-error">{fieldErrors.city}</p>
            )}
          </div>

          <div className="checkout-field">
            <label htmlFor="state" className="checkout-label">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              className={`checkout-input ${fieldErrors.state ? "input-error" : ""}`}
              value={form.state}
              onChange={onChange}
              placeholder="e.g. Karnataka"
              autoComplete="address-level1"
              disabled={disabled}
            />
            {fieldErrors.state && (
              <p className="field-error">{fieldErrors.state}</p>
            )}
          </div>
        </div>

        {/* Pincode */}
        <div className="checkout-field checkout-field-half">
          <label htmlFor="pincode" className="checkout-label">
            Pincode
          </label>
          <input
            id="pincode"
            name="pincode"
            type="text"
            className={`checkout-input ${fieldErrors.pincode ? "input-error" : ""}`}
            value={form.pincode}
            onChange={onChange}
            placeholder="e.g. 560001"
            maxLength={6}
            disabled={disabled}
          />
          {fieldErrors.pincode && (
            <p className="field-error">{fieldErrors.pincode}</p>
          )}
        </div>
      </div>
    </section>
  );
}

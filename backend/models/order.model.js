const mongoose = require("mongoose");

// ─── Order Schema ─────────────────────────────────────────────────────────────
// Each order stores a SNAPSHOT of product data at purchase time.
// This ensures old orders remain historically accurate even if the product
// name, price or image changes in the Product collection later.
const orderSchema = new mongoose.Schema(
  {
    // Reference to the purchasing user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Snapshot of each purchased item — not a live reference
    items: [
      {
        // Keep a reference for potential future lookups, but rely on
        // the name/price snapshot for display and financial accuracy.
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Purchase-time snapshot fields
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
      },
    ],

    // Shipping details collected at checkout
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // Server-calculated final amount — never trust the frontend for this
    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment lifecycle
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // Order fulfillment lifecycle
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT",
    },

    // Razorpay identifiers — stored for reconciliation; never the Key Secret
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

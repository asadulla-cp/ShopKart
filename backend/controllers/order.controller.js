const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// ─── POST /orders/create-payment-order ───────────────────────────────────────
// 1. Authenticate user (via middleware)
// 2. Load user's cart
// 3. Reject empty cart
// 4. Load latest Product data — never trust stale cart prices
// 5. Verify stock for every item
// 6. Calculate total on the server — never trust frontend amount
// 7. Build purchase-time snapshot items
// 8. Create ShopKart pending order
// 9. Create Razorpay Order (amount in paise)
// 10. Save razorpayOrderId and return safe checkout data
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // ── Validate shipping address fields ────────────────────────────────────
    const required = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    for (const field of required) {
      if (!shippingAddress?.[field] || !shippingAddress[field].toString().trim()) {
        return res.status(400).json({
          success: false,
          message: `Shipping address is missing: ${field}`,
        });
      }
    }

    // ── Load user with populated cart ────────────────────────────────────────
    const customer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name price image stock",
    });

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before checking out.",
      });
    }

    // ── Reload fresh Product docs and validate stock ─────────────────────────
    // We do NOT trust the populated cart prices — they could have changed.
    const snapshotItems = [];
    let serverTotal = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product no longer exists. Please update your cart.`,
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available.`,
        });
      }

      // Build snapshot with current (latest) price
      snapshotItems.push({
        product: product._id,
        name: product.name,
        price: product.price,       // snapshot at checkout time
        quantity: cartItem.quantity,
        image: product.image,
      });

      serverTotal += product.price * cartItem.quantity;
    }

    // ── Create ShopKart pending order ────────────────────────────────────────
    const shopKartOrder = await Order.create({
      user: userId,
      items: snapshotItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount: serverTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // ── Create Razorpay Order (amount must be in paise) ──────────────────────
    // ₹1 = 100 paise  →  ₹7497 = 749700 paise
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(serverTotal * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString(),
    });

    // Persist Razorpay order id so we can use it during signature verification
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // Return ONLY the Key ID — never the Key Secret
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,       // paise
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,   // safe — public key only
    });
  } catch (error) {
    console.error("Create payment order error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── POST /orders/verify-payment ─────────────────────────────────────────────
// Verify the HMAC-SHA256 signature Razorpay returns after a successful payment.
// Only after verification: mark order PAID, clear cart.
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details." });
    }

    // ── Fetch the ShopKart order ─────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // ── Ownership check ──────────────────────────────────────────────────────
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // ── Reconstruct expected signature using our stored razorpayOrderId ──────
    // Use the ID we stored — not the one the browser sends — as the trusted source.
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — possible tampering. Do NOT confirm or clear cart.
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment could not be verified.",
      });
    }

    // ── Signature valid — confirm the order ──────────────────────────────────
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ── Deduct stock for each ordered item ───────────────────────────────────
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the user's cart ONLY after successful payment verification
    const customer = await Customer.findById(userId);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified. Your order has been placed!",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /orders — Get current user's orders ─────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Newest first; only return orders owned by this user
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /orders/:id — Get single order (ownership enforced) ─────────────────
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Prevent a user from reading another user's order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order by ID error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── PATCH /orders/:id/status — Bonus: Update order status (dev/admin only) ──
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, message: "Status updated.", order });
  } catch (error) {
    console.error("Update order status error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
};

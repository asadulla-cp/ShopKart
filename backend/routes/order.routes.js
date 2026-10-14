const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

const { protect } = require("../middlewares/auth.middleware");

// All order routes require authentication
router.post("/create-payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

// Bonus: dev/admin endpoint to progress order status
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;

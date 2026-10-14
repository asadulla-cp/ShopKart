const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─── POST /cart/:productId — Add product to cart ──────────────────────────────
// If product not in cart → add with quantity 1
// If already in cart → increment quantity by 1
// Rejects if new quantity would exceed product stock
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(userId);

    // Find existing cart entry for this product
    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex === -1) {
      // Not in cart yet — add with quantity 1
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    } else {
      // Already in cart — increment quantity
      const newQuantity = customer.cart[existingIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock (${product.stock} units)`,
        });
      }
      customer.cart[existingIndex].quantity = newQuantity;
    }

    await customer.save();

    // Populate and return updated cart
    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /cart — Get current user's cart (populated) ─────────────────────────
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Get cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── PATCH /cart/:productId — Update item quantity ────────────────────────────
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Validate quantity type
    if (quantity === undefined || typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: "Quantity must be a whole number" });
    }

    // Quantity must be at least 1
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    // Check product exists and get latest stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Enforce stock limit
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity cannot exceed available stock (${product.stock} units)`,
      });
    }

    const customer = await Customer.findById(userId);

    // Product must already be in cart
    const cartIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    customer.cart[cartIndex].quantity = quantity;
    await customer.save();

    // Return updated populated cart
    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── DELETE /cart/:productId — Remove product from cart ──────────────────────
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(userId);

    const cartIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    customer.cart.splice(cartIndex, 1);
    await customer.save();

    // Return updated populated cart
    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };

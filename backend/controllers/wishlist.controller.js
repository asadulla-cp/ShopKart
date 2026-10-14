const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─── POST /wishlist/:productId — Add product to wishlist ──────────────────────
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id; // comes from auth middleware — never from body

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check for duplicate
    const customer = await Customer.findById(userId);
    const alreadySaved = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadySaved) {
      return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
    }

    // Add product ObjectId reference and save
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /wishlist — Get current user's wishlist (populated) ──────────────────
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate wishlist with actual product data
    const customer = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── DELETE /wishlist/:productId — Remove product from wishlist ───────────────
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(userId);

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in your wishlist" });
    }

    // Remove by index
    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── PATCH /wishlist/:productId/toggle — Bonus: Toggle wishlist ───────────────
const toggleWishlist = async (req, res) => {
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
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (index === -1) {
      // Not saved — add it
      customer.wishlist.push(productId);
      saved = true;
    } else {
      // Already saved — remove it
      customer.wishlist.splice(index, 1);
      saved = false;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved ? "Product added to wishlist" : "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist };

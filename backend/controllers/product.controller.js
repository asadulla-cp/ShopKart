const mongoose = require("mongoose");
const Product = require("../models/product.model");

// POST /products — Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check required fields
    if (!name || !description || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, description, price, category, image, stock",
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({ success: false, message: "Price is required" });
    }

    if (stock === undefined || stock === null) {
      return res.status(400).json({ success: false, message: "Stock is required" });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    const product = await Product.create({ name, description, price, category, image, stock });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("Create product error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /products — Get all products with optional search, category filter, and sort
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build query object dynamically
    const query = {};

    if (search) {
      // Case-insensitive partial match on name
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    // Build sort option
    let sortOption = {};
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 }; // default: newest first
    }

    const products = await Product.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /products/:id — Get a single product by MongoDB _id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Get product error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createProduct, getAllProducts, getProductById };

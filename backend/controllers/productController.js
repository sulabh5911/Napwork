const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");

/**
 * GET /api/products
 * Paginated listing with optional search & price filters.
 *
 * Query params:
 *   page     — page number (default 1)
 *   limit    — items per page (default 10)
 *   search   — case-insensitive regex on product name
 *   minPrice — minimum price filter
 *   maxPrice — maximum price filter
 */
const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Search by name (case-insensitive)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        const min = parseFloat(req.query.minPrice);
        if (!isNaN(min)) filter.price.$gte = min;
      }
      if (req.query.maxPrice) {
        const max = parseFloat(req.query.maxPrice);
        if (!isNaN(max)) filter.price.$lte = max;
      }
      // Remove empty price filter
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit) || 1;

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * POST /api/products
 * Create a new product with multipart form data (name, price, images[]).
 */
const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "Product price is required" });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid non-negative number" });
    }

    // Collect uploaded image paths (relative paths for portability)
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const product = await Product.create({
      name: name.trim(),
      price: parsedPrice,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    // Clean up uploaded files on failure
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, () => {});
      });
    }
    console.error("createProduct error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }

    res.status(500).json({ message: "Failed to create product" });
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product and remove its image files from disk.
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image files from disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((imagePath) => {
        // imagePath is like "/uploads/abc123.png"
        const fullPath = path.join(__dirname, "..", imagePath);
        fs.unlink(fullPath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error(`Failed to delete image file: ${fullPath}`, err);
          }
        });
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = { getProducts, createProduct, deleteProduct };

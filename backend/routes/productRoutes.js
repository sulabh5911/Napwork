const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getProducts,
  createProduct,
  deleteProduct,
} = require("../controllers/productController");

// GET  /api/products      — paginated listing with search & price filters
router.get("/", getProducts);

// POST /api/products      — create product with image upload (max 4 files)
router.post("/", upload.array("images", 4), (err, req, res, next) => {
  // Handle Multer-specific errors gracefully
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Each file must be 4 MB or smaller" });
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ message: err.field || "Maximum 4 image files allowed. Only SVG, PNG, JPG/JPEG are accepted." });
    }
    return res.status(400).json({ message: err.message });
  }
  next();
}, createProduct);

// DELETE /api/products/:id — delete product and its image files
router.delete("/:id", deleteProduct);

module.exports = router;

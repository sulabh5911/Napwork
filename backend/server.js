const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// CORS — allow requests from any origin for now (useful for production testing)
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/products", productRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Napworks API is running...");
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Napworks API server running on http://localhost:${PORT}`);
});

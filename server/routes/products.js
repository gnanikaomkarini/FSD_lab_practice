const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// ========== 1. GET ALL PRODUCTS (DEFAULT) ==========
// Returns all products sorted by createdAt descending
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ========== 2. SEARCH ROUTE ==========
// GET /api/products/search?q=<query>
// Searches products by name (case-insensitive)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    
    // Validate query parameter
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: "Search query cannot be empty" });
    }
    
    // Search by name using regex (case-insensitive)
    const products = await Product.find({
      name: { $regex: q, $options: "i" }
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ========== 3. SORT ROUTE ==========
// GET /api/products/sort?field=<field>&order=<asc|desc>
// Sorts products by specified field (name, price, quantity, createdAt)
router.get("/sort", async (req, res) => {
  try {
    const { field, order } = req.query;
    
    // Validate field parameter
    const validFields = ["name", "price", "quantity", "createdAt"];
    if (!field || !validFields.includes(field)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }
    
    // Validate order parameter
    const validOrders = ["asc", "desc"];
    if (!order || !validOrders.includes(order)) {
      return res.status(400).json({ error: "Invalid sort order" });
    }
    
    // Sort by field in specified order (1 = asc, -1 = desc)
    const sortObj = {};
    sortObj[field] = order === "asc" ? 1 : -1;
    
    const products = await Product.find().sort(sortObj);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ========== 4. FILTER ROUTE ==========
// GET /api/products/filter?minPrice=<min>&maxPrice=<max>
// Filters products by price range
router.get("/filter", async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add minPrice filter if provided
    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (isNaN(min)) {
        return res.status(400).json({ error: "Invalid minPrice value" });
      }
      filter.price = { ...filter.price, $gte: min };
    }
    
    // Add maxPrice filter if provided
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (isNaN(max)) {
        return res.status(400).json({ error: "Invalid maxPrice value" });
      }
      filter.price = { ...filter.price, $lte: max };
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ========== 4B. EXACT VALUE FILTER ROUTE ==========
// GET /api/products/exact?field=<field>&value=<value>
// Filters products by exact value (name or quantity)
router.get("/exact", async (req, res) => {
  try {
    const { field, value } = req.query;
    
    // ❌ VALIDATION: Field and value required
    if (!field || !value) {
      return res.status(400).json({ error: "Field and value parameters are required" });
    }
    
    // ❌ VALIDATION: Field must be valid (name or quantity only)
    const validFields = ["name", "quantity"];
    if (!validFields.includes(field)) {
      return res.status(400).json({ error: "Field must be 'name' or 'quantity'" });
    }
    
    // 🏗️ BUILD FILTER: Exact match based on field type
    const filter = {};
    
    if (field === "name") {
      // Exact match for name (case-insensitive)
      filter.name = { $regex: `^${value}$`, $options: "i" };
    } else if (field === "quantity") {
      // Exact match for quantity (must be number)
      const qty = parseInt(value);
      if (isNaN(qty)) {
        return res.status(400).json({ error: "Quantity must be a valid number" });
      }
      filter.quantity = qty;
    }
    
    // 🔎 QUERY: Find products matching exact value
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ========== 5. CREATE PRODUCT ROUTE ==========
// POST /api/products
// Creates a new product with name, price, quantity
router.post("/", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: "Missing required fields: name, price, quantity" });
    }
    
    // Validate field types and values
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Name must be a non-empty string" });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }
    
    // Create new product
    const newProduct = new Product({
      name: name.trim(),
      price,
      quantity
    });
    
    // Save to database
    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ========== 6. UPDATE PRODUCT ROUTE ==========
// PUT /api/products/:id
// Updates an existing product by id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    
    // Validate that at least one field is provided
    if (name === undefined && price === undefined && quantity === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    // Validate field types if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name must be a non-empty string" });
      }
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: "Price must be a positive number" });
      }
    }
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;
    
    // Find and update product
    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    // Check if product exists
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

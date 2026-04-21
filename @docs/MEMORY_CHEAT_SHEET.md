# 🧠 MERN LAB EXAM - COMPLETE MEMORY CHEAT SHEET

## Table of Contents
1. [Feature 1: SEARCH](#feature-1-search)
2. [Feature 2: SORT](#feature-2-sort)
3. [Feature 3: FILTER](#feature-3-filter)
4. [Feature 4: CREATE](#feature-4-create)
5. [Feature 5: UPDATE](#feature-5-update)
6. [Error Handling Pattern](#error-handling-pattern)
7. [UI Integration (App.js Complete)](#ui-integration-appjs-complete)
8. [ProductTable.js Complete](#producttablejsomplete)
9. [Quick Reference](#quick-reference)
10. [Common Mistakes](#common-mistakes)

---

# FEATURE 1: SEARCH

**Mnemonic:** "REGEX IS" = Fuzzy Find by Pattern, In String

## Backend - Complete Code for server/routes/products.js

```javascript
// ========== 2. SEARCH ROUTE ==========
// GET /api/products/search?q=<query>
// Searches products by name (case-insensitive)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    
    // ❌ VALIDATION: Query cannot be empty
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: "Search query cannot be empty" });
    }
    
    // 🔍 REGEX SEARCH: Case-insensitive pattern matching on name field
    const products = await Product.find({
      name: { $regex: q, $options: "i" }
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
```

**Key Points:**
- `$regex: q` = Pattern match (fuzzy search)
- `$options: "i"` = Case-insensitive (matches "LAPTOP", "laptop", "Laptop")
- `.sort({ createdAt: -1 })` = Newest first
- `.status(400)` = Bad request (validation failed)
- `.status(200)` = Success with data

---

## Frontend - Complete Code for App.js

### Step 1: Add Search State
```javascript
// ========== SEARCH STATE ==========
const [search, setSearch] = useState('');
```

### Step 2: Add Search Handler with Error Handling
```javascript
// ========== SEARCH HANDLER ==========
const handleSearch = async () => {
  try {
    // ❌ VALIDATION: Cannot search empty query
    if (!search || search.trim() === '') {
      setError('Please enter a search term');
      return;
    }
    
    // 📡 FETCH: Send search request
    const res = await fetch(`http://localhost:5003/api/products/search?q=${search}`);
    
    // ✅ STATUS CHECK: Did request succeed?
    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || `Error: ${res.status}`);
      return;
    }
    
    // 📦 PARSE: Get response data
    const data = await res.json();
    
    // 🎯 UPDATE: Ensure data is array before setting
    setProducts(Array.isArray(data) ? data : []);
    setError(null); // Clear any previous errors
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 3: Add Search UI (JSX in return statement)
```javascript
{/* ========== SEARCH TOOLBAR ========== */}
<div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
  {/* Search Input */}
  <input
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Search products..."
    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minWidth: '200px' }}
  />
  
  {/* Search Button */}
  <button
    onClick={handleSearch}
    disabled={!search.trim()}
    style={{ 
      padding: '8px 12px', 
      border: '1px solid #d1d5db', 
      background: search.trim() ? 'white' : '#f3f4f6',
      cursor: search.trim() ? 'pointer' : 'not-allowed',
      borderRadius: '4px',
      opacity: search.trim() ? 1 : 0.6
    }}
  >
    Search
  </button>
</div>
```

---

# FEATURE 2: SORT

**Mnemonic:** "FIELD ORDER" = Which Column, Which Direction

## Backend - Complete Code for server/routes/products.js

```javascript
// ========== 3. SORT ROUTE ==========
// GET /api/products/sort?field=<field>&order=<asc|desc>
// Sorts products by specified field (name, price, quantity, createdAt)
router.get("/sort", async (req, res) => {
  try {
    const { field, order } = req.query;
    
    // ❌ VALIDATION: Field must be valid
    const validFields = ["name", "price", "quantity", "createdAt"];
    if (!field || !validFields.includes(field)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }
    
    // ❌ VALIDATION: Order must be asc or desc
    const validOrders = ["asc", "desc"];
    if (!order || !validOrders.includes(order)) {
      return res.status(400).json({ error: "Invalid sort order" });
    }
    
    // 📊 SORT OBJECT: Build dynamic sort (1 = ascending, -1 = descending)
    const sortObj = {};
    sortObj[field] = order === "asc" ? 1 : -1;
    
    const products = await Product.find().sort(sortObj);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
```

**Key Points:**
- `sortObj[field] = 1` = Ascending order (A-Z, 0-9)
- `sortObj[field] = -1` = Descending order (Z-A, 9-0)
- Validate both field AND order before querying

---

## Frontend - Complete Code for App.js

### Step 1: Add Sort State
```javascript
// ========== SORT STATE ==========
const [sortField, setSortField] = useState('');
const [sortOrder, setSortOrder] = useState('');
```

### Step 2: Add Sort Handler with Error Handling
```javascript
// ========== SORT HANDLER ==========
const handleSort = async (field, order) => {
  try {
    // ❌ VALIDATION: Validate field and order on frontend too (belt and suspenders)
    const validFields = ["name", "price", "quantity", "createdAt"];
    if (!validFields.includes(field) || !["asc", "desc"].includes(order)) {
      setError('Invalid sort parameters');
      return;
    }
    
    // 💾 STATE: Update UI to show which sort is active
    setSortField(field);
    setSortOrder(order);
    
    // 📡 FETCH: Send sort request
    const res = await fetch(`http://localhost:5003/api/products/sort?field=${field}&order=${order}`);
    
    // ✅ STATUS CHECK: Did request succeed?
    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || `Error: ${res.status}`);
      return;
    }
    
    // 📦 PARSE: Get response data
    const data = await res.json();
    
    // 🎯 UPDATE: Ensure data is array before setting
    setProducts(Array.isArray(data) ? data : []);
    setError(null);
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 3: Add Sort UI (JSX in return statement)
```javascript
{/* ========== SORT BUTTONS ========== */}
<div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
  {/* Sort by Price Ascending */}
  <button
    onClick={() => handleSort('price', 'asc')}
    style={{
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      background: sortField === 'price' && sortOrder === 'asc' ? '#111827' : 'white',
      color: sortField === 'price' && sortOrder === 'asc' ? 'white' : 'black',
      cursor: 'pointer',
      borderRadius: '4px'
    }}
  >
    Price ↑
  </button>

  {/* Sort by Price Descending */}
  <button
    onClick={() => handleSort('price', 'desc')}
    style={{
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      background: sortField === 'price' && sortOrder === 'desc' ? '#111827' : 'white',
      color: sortField === 'price' && sortOrder === 'desc' ? 'white' : 'black',
      cursor: 'pointer',
      borderRadius: '4px'
    }}
  >
    Price ↓
  </button>

  {/* Sort by Name A-Z */}
  <button
    onClick={() => handleSort('name', 'asc')}
    style={{
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      background: sortField === 'name' && sortOrder === 'asc' ? '#111827' : 'white',
      color: sortField === 'name' && sortOrder === 'asc' ? 'white' : 'black',
      cursor: 'pointer',
      borderRadius: '4px'
    }}
  >
    A-Z
  </button>
</div>
```

---

# FEATURE 3: FILTER

**Mnemonic:** "RANGE QUERY" = $GTE (minimum), $LTE (maximum)

## Backend - Complete Code for server/routes/products.js

```javascript
// ========== 4. FILTER ROUTE ==========
// GET /api/products/filter?minPrice=<min>&maxPrice=<max>
// Filters products by price range
router.get("/filter", async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    
    // 🏗️ BUILD FILTER: Start with empty filter object
    const filter = {};
    
    // ❌ VALIDATION: If minPrice provided, must be valid number
    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (isNaN(min)) {
        return res.status(400).json({ error: "Invalid minPrice value" });
      }
      filter.price = { ...filter.price, $gte: min };
    }
    
    // ❌ VALIDATION: If maxPrice provided, must be valid number
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (isNaN(max)) {
        return res.status(400).json({ error: "Invalid maxPrice value" });
      }
      filter.price = { ...filter.price, $lte: max };
    }
    
    // 🔎 QUERY: Find products matching filter (both min AND max applied)
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
```

**Key Points:**
- `$gte` = Greater than or equal (minimum price threshold)
- `$lte` = Less than or equal (maximum price threshold)
- Both can be applied together to create a range
- Spread operator `...filter.price` preserves existing properties when adding new ones

---

## Frontend - Complete Code for App.js

### Step 1: Add Filter State
```javascript
// ========== FILTER STATE ==========
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
```

### Step 2: Add Filter Handler with Error Handling
```javascript
// ========== FILTER HANDLER ==========
const handleFilter = async () => {
  try {
    // ❌ VALIDATION: If minPrice provided, must be valid number
    if (minPrice && isNaN(parseFloat(minPrice))) {
      setError('Min Price must be a valid number');
      return;
    }
    
    // ❌ VALIDATION: If maxPrice provided, must be valid number
    if (maxPrice && isNaN(parseFloat(maxPrice))) {
      setError('Max Price must be a valid number');
      return;
    }
    
    // 🏗️ BUILD URL: Construct URL with query parameters
    const url = new URL('http://localhost:5003/api/products/filter');
    if (minPrice) url.searchParams.append('minPrice', minPrice);
    if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
    
    // 📡 FETCH: Send filter request
    const res = await fetch(url);
    
    // ✅ STATUS CHECK: Did request succeed?
    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || `Error: ${res.status}`);
      return;
    }
    
    // 📦 PARSE: Get response data
    const data = await res.json();
    
    // 🎯 UPDATE: Ensure data is array before setting
    setProducts(Array.isArray(data) ? data : []);
    setError(null);
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 3: Add Filter UI (JSX in return statement)
```javascript
{/* ========== FILTER INPUTS ========== */}
<div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
  {/* Min Price Input */}
  <input
    value={minPrice}
    onChange={e => setMinPrice(e.target.value)}
    type="number"
    placeholder="Min Price"
    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', width: '120px' }}
  />

  {/* Max Price Input */}
  <input
    value={maxPrice}
    onChange={e => setMaxPrice(e.target.value)}
    type="number"
    placeholder="Max Price"
    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', width: '120px' }}
  />

  {/* Filter Button */}
  <button
    onClick={handleFilter}
    style={{ 
      padding: '8px 12px', 
      border: '1px solid #d1d5db', 
      background: 'white', 
      cursor: 'pointer', 
      borderRadius: '4px' 
    }}
  >
    Filter
  </button>
</div>
```

---

# FEATURE 4: CREATE

**Mnemonic:** "NEW & SAVE" = Instantiate Model, Persist to Database

## Backend - Complete Code for server/routes/products.js

```javascript
// ========== 5. CREATE PRODUCT ROUTE ==========
// POST /api/products
// Creates a new product with name, price, quantity
router.post("/", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    
    // ❌ VALIDATION: All fields required
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: "Missing required fields: name, price, quantity" });
    }
    
    // ❌ VALIDATION: Name must be non-empty string
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Name must be a non-empty string" });
    }
    
    // ❌ VALIDATION: Price must be positive number
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    
    // ❌ VALIDATION: Quantity must be positive number
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }
    
    // 🆕 CREATE: Instantiate new Product with data
    const newProduct = new Product({
      name: name.trim(),
      price,
      quantity
    });
    
    // 💾 SAVE: Persist to database (generates _id and createdAt)
    await newProduct.save();
    
    // ✅ RESPONSE: Return 201 Created with new product data
    return res.status(201).json(newProduct);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
```

**Key Points:**
- `new Product()` = Create model instance in memory
- `.save()` = Persist to MongoDB (generates _id and createdAt)
- `.status(201)` = Resource created successfully
- `.status(400)` = Validation failed (bad input)
- `.status(500)` = Database error

---

## Frontend - Complete Code for App.js

### Step 1: Add Create State
```javascript
// ========== CREATE STATE ==========
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({ name: '', price: '', quantity: '' });
```

### Step 2: Add Create Handler with Error Handling
```javascript
// ========== CREATE HANDLER ==========
const handleCreateSubmit = async () => {
  try {
    // ❌ VALIDATION: All fields required
    if (!createForm.name || !createForm.price || !createForm.quantity) {
      setError('All fields are required');
      return;
    }
    
    // ❌ VALIDATION: Price must be valid number
    if (isNaN(parseFloat(createForm.price))) {
      setError('Price must be a valid number');
      return;
    }
    
    // ❌ VALIDATION: Quantity must be valid number
    if (isNaN(parseInt(createForm.quantity))) {
      setError('Quantity must be a valid number');
      return;
    }
    
    // 📡 FETCH: Send POST request with product data
    const res = await fetch('http://localhost:5003/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: createForm.name,
        price: parseFloat(createForm.price),
        quantity: parseInt(createForm.quantity)
      })
    });
    
    // ✅ STATUS CHECK: Did creation succeed?
    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || `Error: ${res.status}`);
      return;
    }
    
    // 📦 PARSE: Get newly created product
    const newProduct = await res.json();
    
    // 🎯 UPDATE: Add new product to beginning of list (optimistic update)
    setProducts([newProduct, ...products]);
    
    // 🧹 CLEANUP: Close form and reset inputs
    setShowCreate(false);
    setCreateForm({ name: '', price: '', quantity: '' });
    setError(null);
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 3: Add Create Form UI (JSX in return statement)
```javascript
{/* ========== CREATE FORM ========== */}
{showCreate && (
  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
    <h3>Create Product</h3>
    
    {/* Product Name Input */}
    <input
      value={createForm.name}
      onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
      placeholder="Product Name"
      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px', minWidth: '200px' }}
    />
    
    {/* Product Price Input */}
    <input
      value={createForm.price}
      onChange={e => setCreateForm({ ...createForm, price: e.target.value })}
      type="number"
      placeholder="Price"
      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px', minWidth: '150px' }}
    />
    
    {/* Product Quantity Input */}
    <input
      value={createForm.quantity}
      onChange={e => setCreateForm({ ...createForm, quantity: e.target.value })}
      type="number"
      placeholder="Quantity"
      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px', minWidth: '150px' }}
    />
    
    {/* Save Button */}
    <button
      onClick={handleCreateSubmit}
      style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
    >
      Save
    </button>
    
    {/* Cancel Button */}
    <button
      onClick={() => setShowCreate(false)}
      style={{ padding: '8px 12px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
    >
      Cancel
    </button>
  </div>
)}

{/* ========== ADD PRODUCT BUTTON (in header) ========== */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <h1>Product Inventory</h1>
  <button 
    onClick={() => setShowCreate(true)}
    style={{ padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
  >
    + Add Product
  </button>
</div>
```

---

# FEATURE 5: UPDATE

**Mnemonic:** "FIND & UPDATE" = Locate by ID, Modify Fields, Return Updated

## Backend - Complete Code for server/routes/products.js

```javascript
// ========== 6. UPDATE PRODUCT ROUTE ==========
// PUT /api/products/:id
// Updates an existing product by id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    
    // ❌ VALIDATION: At least one field to update
    if (name === undefined && price === undefined && quantity === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    // ❌ VALIDATION: If name provided, must be non-empty string
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name must be a non-empty string" });
      }
    }
    
    // ❌ VALIDATION: If price provided, must be positive number
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: "Price must be a positive number" });
      }
    }
    
    // ❌ VALIDATION: If quantity provided, must be positive number
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }
    }
    
    // 🏗️ BUILD UPDATE OBJECT: Only include provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;
    
    // 🔍 FIND & UPDATE: Update product by _id, return new version
    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    // ❌ CHECK: Did product exist?
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // ✅ RESPONSE: Return 200 with updated product
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
```

**Key Points:**
- `findByIdAndUpdate(id, updateData, { new: true })` = Return updated document (not old)
- `.status(404)` = Product doesn't exist
- `.status(200)` = Success with data
- Only include fields that were actually provided in body

---

## Frontend - Complete Code for App.js

### Step 1: Add Update State
```javascript
// ========== UPDATE STATE ==========
const [editId, setEditId] = useState(null);
const [editForm, setEditForm] = useState({ name: '', price: '', quantity: '' });
```

### Step 2: Add Update Handler with Error Handling
```javascript
// ========== UPDATE HANDLER ==========
const handleUpdateSubmit = async () => {
  try {
    // ❌ VALIDATION: All fields required
    if (!editForm.name || !editForm.price || !editForm.quantity) {
      setError('All fields are required');
      return;
    }
    
    // ❌ VALIDATION: Price must be valid number
    if (isNaN(parseFloat(editForm.price))) {
      setError('Price must be a valid number');
      return;
    }
    
    // ❌ VALIDATION: Quantity must be valid number
    if (isNaN(parseInt(editForm.quantity))) {
      setError('Quantity must be a valid number');
      return;
    }
    
    // 📡 FETCH: Send PUT request with updated data
    const res = await fetch(`http://localhost:5003/api/products/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        price: parseFloat(editForm.price),
        quantity: parseInt(editForm.quantity)
      })
    });
    
    // ✅ STATUS CHECK: Did update succeed?
    if (!res.ok) {
      const errorData = await res.json();
      if (res.status === 404) {
        setError('Product not found');
      } else {
        setError(errorData.error || `Error: ${res.status}`);
      }
      return;
    }
    
    // 📦 PARSE: Get updated product
    const updated = await res.json();
    
    // 🎯 UPDATE: Replace old product with updated version in list
    setProducts(products.map(p => p._id === editId ? updated : p));
    
    // 🧹 CLEANUP: Close form
    setEditId(null);
    setError(null);
  } catch (err) {
    setError(err.message);
  }
};
```

### Step 3: Add Edit Form UI (JSX in return statement)
```javascript
{/* ========== EDIT FORM ========== */}
{editId && (
  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
    <h3>Edit Product</h3>
    
    {/* Product Name Input */}
    <input
      value={editForm.name}
      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
      placeholder="Product Name"
      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px', minWidth: '200px' }}
    />
    
    {/* Product Price Input */}
    <input
      value={editForm.price}
      onChange={e => setEditForm({ ...editForm, price: e.target.value })}
      type="number"
      placeholder="Price"
      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px', minWidth: '150px' }}
    />
    
    {/* Product Quantity Input */}
    <input
      value={editForm.quantity}
      onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
      type="number"
      placeholder="Quantity"
      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px', minWidth: '150px' }}
    />
    
    {/* Save Button */}
    <button
      onClick={handleUpdateSubmit}
      style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
    >
      Save
    </button>
    
    {/* Cancel Button */}
    <button
      onClick={() => setEditId(null)}
      style={{ padding: '8px 12px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
    >
      Cancel
    </button>
  </div>
)}
```

---

# ERROR HANDLING PATTERN

This pattern is used consistently in ALL 5 handlers:

## Pattern Structure

```javascript
const handleXXX = async () => {
  try {
    // 1️⃣ VALIDATE INPUT (before sending request)
    if (!isValid) {
      setError('Error message');
      return;
    }
    
    // 2️⃣ FETCH REQUEST
    const res = await fetch(url, options);
    
    // 3️⃣ CHECK STATUS CODE
    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || `Error: ${res.status}`);
      return;
    }
    
    // 4️⃣ PARSE SUCCESS RESPONSE
    const data = await res.json();
    
    // 5️⃣ UPDATE STATE
    setProducts(data);
    
    // 6️⃣ CLEAR ERRORS & FORMS
    setError(null);
    setShowCreate(false);
    setCreateForm({...});
  } catch (err) {
    // 7️⃣ NETWORK ERROR HANDLER
    setError(err.message);
  }
};
```

## Error Display (in JSX)

```javascript
{/* Error Display */}
{error && (
  <div style={{ 
    background: '#fee2e2', 
    color: '#991b1b', 
    padding: '12px', 
    borderRadius: '4px', 
    marginBottom: '20px',
    border: '1px solid #fecaca'
  }}>
    {error}
  </div>
)}
```

---

# UI INTEGRATION (App.js Complete)

This is the complete App.js file with all 5 features integrated:

```javascript
import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";

function App() {
  // ========== EXISTING STATES ==========
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== SEARCH STATE ==========
  const [search, setSearch] = useState('');

  // ========== SORT STATE ==========
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // ========== FILTER STATE ==========
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // ========== CREATE STATE ==========
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', price: '', quantity: '' });

  // ========== UPDATE STATE ==========
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', quantity: '' });

  // ========== FETCH ALL PRODUCTS ON MOUNT ==========
  useEffect(() => {
    fetch("http://localhost:5003/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ========== SEARCH HANDLER ==========
  const handleSearch = async () => {
    try {
      if (!search || search.trim() === '') {
        setError('Please enter a search term');
        return;
      }
      const res = await fetch(`http://localhost:5003/api/products/search?q=${search}`);
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || `Error: ${res.status}`);
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== SORT HANDLER ==========
  const handleSort = async (field, order) => {
    try {
      const validFields = ["name", "price", "quantity", "createdAt"];
      if (!validFields.includes(field) || !["asc", "desc"].includes(order)) {
        setError('Invalid sort parameters');
        return;
      }
      setSortField(field);
      setSortOrder(order);
      const res = await fetch(`http://localhost:5003/api/products/sort?field=${field}&order=${order}`);
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || `Error: ${res.status}`);
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== FILTER HANDLER ==========
  const handleFilter = async () => {
    try {
      if (minPrice && isNaN(parseFloat(minPrice))) {
        setError('Min Price must be a valid number');
        return;
      }
      if (maxPrice && isNaN(parseFloat(maxPrice))) {
        setError('Max Price must be a valid number');
        return;
      }
      const url = new URL('http://localhost:5003/api/products/filter');
      if (minPrice) url.searchParams.append('minPrice', minPrice);
      if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || `Error: ${res.status}`);
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== CREATE HANDLER ==========
  const handleCreateSubmit = async () => {
    try {
      if (!createForm.name || !createForm.price || !createForm.quantity) {
        setError('All fields are required');
        return;
      }
      if (isNaN(parseFloat(createForm.price))) {
        setError('Price must be a valid number');
        return;
      }
      if (isNaN(parseInt(createForm.quantity))) {
        setError('Quantity must be a valid number');
        return;
      }
      const res = await fetch('http://localhost:5003/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          price: parseFloat(createForm.price),
          quantity: parseInt(createForm.quantity)
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || `Error: ${res.status}`);
        return;
      }
      const newProduct = await res.json();
      setProducts([newProduct, ...products]);
      setShowCreate(false);
      setCreateForm({ name: '', price: '', quantity: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== UPDATE HANDLER ==========
  const handleUpdateSubmit = async () => {
    try {
      if (!editForm.name || !editForm.price || !editForm.quantity) {
        setError('All fields are required');
        return;
      }
      if (isNaN(parseFloat(editForm.price))) {
        setError('Price must be a valid number');
        return;
      }
      if (isNaN(parseInt(editForm.quantity))) {
        setError('Quantity must be a valid number');
        return;
      }
      const res = await fetch(`http://localhost:5003/api/products/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          price: parseFloat(editForm.price),
          quantity: parseInt(editForm.quantity)
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 404) {
          setError('Product not found');
        } else {
          setError(errorData.error || `Error: ${res.status}`);
        }
        return;
      }
      const updated = await res.json();
      setProducts(products.map(p => p._id === editId ? updated : p));
      setEditId(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      {/* ========== ERROR DISPLAY ========== */}
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {/* ========== HEADER ROW: Title + Add Product Button ========== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Product Inventory</h1>
        <button 
          onClick={() => setShowCreate(true)}
          style={{ padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          + Add Product
        </button>
      </div>

      {/* ========== CREATE FORM: Shows when user clicks "+ Add Product" ========== */}
      {showCreate && (
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
          <h3>Create Product</h3>
          <input
            value={createForm.name}
            onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Name"
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px' }}
          />
          <input
            value={createForm.price}
            onChange={e => setCreateForm({ ...createForm, price: e.target.value })}
            type="number"
            placeholder="Price"
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px' }}
          />
          <input
            value={createForm.quantity}
            onChange={e => setCreateForm({ ...createForm, quantity: e.target.value })}
            type="number"
            placeholder="Quantity"
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px' }}
          />
          <button
            onClick={handleCreateSubmit}
            style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
          >
            Save
          </button>
          <button
            onClick={() => setShowCreate(false)}
            style={{ padding: '8px 12px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ========== TOOLBAR: Search + Sort + Filter Controls ========== */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Input */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        <button
          onClick={handleSearch}
          disabled={!search.trim()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #d1d5db', 
            background: search.trim() ? 'white' : '#f3f4f6',
            cursor: search.trim() ? 'pointer' : 'not-allowed',
            borderRadius: '4px',
            opacity: search.trim() ? 1 : 0.6
          }}
        >
          Search
        </button>

        {/* Sort Buttons */}
        <button
          onClick={() => handleSort('price', 'asc')}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            background: sortField === 'price' && sortOrder === 'asc' ? '#111827' : 'white',
            color: sortField === 'price' && sortOrder === 'asc' ? 'white' : 'black',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Price ↑
        </button>
        <button
          onClick={() => handleSort('price', 'desc')}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            background: sortField === 'price' && sortOrder === 'desc' ? '#111827' : 'white',
            color: sortField === 'price' && sortOrder === 'desc' ? 'white' : 'black',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Price ↓
        </button>
        <button
          onClick={() => handleSort('name', 'asc')}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            background: sortField === 'name' && sortOrder === 'asc' ? '#111827' : 'white',
            color: sortField === 'name' && sortOrder === 'asc' ? 'white' : 'black',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          A-Z
        </button>

        {/* Filter Inputs */}
        <input
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          type="number"
          placeholder="Min Price"
          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        <input
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          type="number"
          placeholder="Max Price"
          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        <button
          onClick={handleFilter}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', borderRadius: '4px' }}
        >
          Filter
        </button>
      </div>

      {/* ========== EDIT FORM: Shows when user clicks on a row ========== */}
      {editId && (
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
          <h3>Edit Product</h3>
          <input
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Name"
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px' }}
          />
          <input
            value={editForm.price}
            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
            type="number"
            placeholder="Price"
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px' }}
          />
          <input
            value={editForm.quantity}
            onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
            type="number"
            placeholder="Quantity"
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginRight: '8px', marginBottom: '8px' }}
          />
          <button
            onClick={handleUpdateSubmit}
            style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
          >
            Save
          </button>
          <button
            onClick={() => setEditId(null)}
            style={{ padding: '8px 12px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ========== TABLE DISPLAY ========== */}
      {loading && <div className="state">Loading products...</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && (
        <ProductTable
          products={products}
          onRowClick={(product) => {
            setEditId(product._id);
            setEditForm({ name: product.name, price: product.price, quantity: product.quantity });
          }}
        />
      )}
    </div>
  );
}

export default App;
```

---

# ProductTable.js Complete

```javascript
import React from "react";

function ProductTable({ products, onRowClick }) {
  if (!products || products.length === 0) {
    return <div className="state">No products found.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          // CLICKABLE ROW: Click to open edit form
          <tr 
            key={product._id}
            onClick={() => onRowClick(product)}
            style={{ cursor: "pointer" }}
          >
            <td>{product.name}</td>
            <td>${product.price}</td>
            <td>{product.quantity}</td>
            <td>{new Date(product.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProductTable;
```

---

# QUICK REFERENCE

## Status Codes

| Code | Meaning | When to Use |
|------|---------|------------|
| **200** | OK - Success | GET finds data, PUT updates successfully |
| **201** | Created | POST creates new resource successfully |
| **400** | Bad Request | Input validation failed |
| **404** | Not Found | Resource (product) doesn't exist |
| **500** | Server Error | Database error or unexpected crash |

---

## MongoDB Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `$regex` | Pattern match (search) | `{ name: { $regex: "phone" } }` |
| `$options: 'i'` | Case-insensitive | Add to regex for ignore case |
| `$gte` | Greater than or equal | `{ price: { $gte: 100 } }` |
| `$lte` | Less than or equal | `{ price: { $lte: 5000 } }` |

---

## Type Conversions

```javascript
// String to Number
parseFloat('99.99')   // → 99.99
parseInt('10')        // → 10
Number('42')          // → 42

// Check if valid number
isNaN(parseFloat('abc'))  // → true (not a number)
isNaN(parseFloat('99'))   // → false (is a number)

// Object spread (immutable)
{ ...obj, field: newValue }

// Array map (replace item)
arr.map(item => item._id === targetId ? updated : item)

// Array destructuring (add to front)
[newItem, ...oldArray]
```

---

## Fetch Patterns

### GET with Query Params
```javascript
fetch('http://localhost:5003/api/products/search?q=laptop')
```

### POST with Body
```javascript
fetch('http://localhost:5003/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, price, quantity })
})
```

### PUT by ID with Body
```javascript
fetch(`http://localhost:5003/api/products/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, price, quantity })
})
```

### Parse Response
```javascript
const res = await fetch(url);
if (!res.ok) {
  const error = await res.json();
  console.log(error.error);
  return;
}
const data = await res.json();
```

---

# COMMON MISTAKES

## ❌ MISTAKE 1: Sending Empty Search Query
```javascript
// WRONG - sends ?q= which returns 400
const handleSearch = async () => {
  const res = await fetch(`/api/products/search?q=${search}`);
  const data = await res.json();
  setProducts(data); // data is { error: "..." }, not array!
};

// RIGHT - validate before sending
const handleSearch = async () => {
  if (!search.trim()) {
    setError('Please enter a search term');
    return;
  }
  // ... continue
};
```

## ❌ MISTAKE 2: Not Checking res.ok
```javascript
// WRONG - assumes success
const res = await fetch(url);
const data = await res.json();
setProducts(data); // if res.status is 400, data is { error: "..." }

// RIGHT - check status first
const res = await fetch(url);
if (!res.ok) {
  const error = await res.json();
  setError(error.error);
  return;
}
const data = await res.json();
setProducts(data);
```

## ❌ MISTAKE 3: Trying to .map() on Error Object
```javascript
// WRONG - API returned error, data is object not array
const data = await res.json();
setProducts(data.map(...)); // TypeError: data.map is not a function

// RIGHT - check type or check res.ok first
if (Array.isArray(data)) {
  setProducts(data);
}
```

## ❌ MISTAKE 4: Not Converting String to Number
```javascript
// WRONG - price is string "99", creates { price: "99" } in DB
body: JSON.stringify({
  price: createForm.price // Still a string!
})

// RIGHT - convert to number
body: JSON.stringify({
  price: parseFloat(createForm.price)
})
```

## ❌ MISTAKE 5: Wrong Route Order
```javascript
// WRONG - GET /search matches GET /:id before /search
router.get("/:id", ...);     // Matches /search!
router.get("/search", ...);  // Never reached

// RIGHT - Specific routes BEFORE generic
router.get("/search", ...);  // Specific
router.get("/sort", ...);    // Specific
router.get("/:id", ...);     // Generic
```

## ❌ MISTAKE 6: Form Not Clearing on Error
```javascript
// WRONG - always clears form even on error
const handleCreate = async () => {
  // ... validate and fetch
  setShowCreate(false);      // Closes form even on 400 error!
  setCreateForm({...});
};

// RIGHT - only clear on success
const handleCreate = async () => {
  // ... validate and fetch
  if (!res.ok) {
    setError(errorData.error);
    return;  // Form stays open for user to fix
  }
  // ... on success:
  setShowCreate(false);
  setCreateForm({...});
};
```

## ❌ MISTAKE 7: Mutating State Directly
```javascript
// WRONG - mutates original array
const updated = products;
updated[0].name = 'New Name';
setProducts(updated); // React doesn't detect change

// RIGHT - create new array
const updated = products.map(p => 
  p._id === id ? { ...p, name: 'New Name' } : p
);
setProducts(updated);
```

---

**Good luck! You have ALL the code you need. Just copy-paste and practice! 💪**

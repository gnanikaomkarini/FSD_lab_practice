# 🚀 MERN LAB EXAM - ULTRA-MINIMAL SNIPPETS

## Features
1. [Search](#1-search) - Find by name
2. [Sort](#2-sort) - Order by field
3. [Filter](#3-filter) - Range queries
4. [CREATE](#4-create) - POST new product
5. [UPDATE](#5-update) - PUT existing product

---

## 1️⃣ SEARCH

**Backend `server/routes/products.js`:**
```javascript
router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Query required' });
  const products = await Product.find({ name: { $regex: q, $options: 'i' } });
  res.json(products);
});
```

**Frontend `client/src/App.js`:**
```javascript
// State
const [search, setSearch] = useState('');

// Function
const handleSearch = async () => {
  const res = await fetch(`http://localhost:5003/api/products/search?q=${search}`);
  setProducts(await res.json());
};

// JSX
<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
<button onClick={handleSearch}>Search</button>
```

---

## 2️⃣ SORT

**Backend `server/routes/products.js`:**
```javascript
router.get('/sort', async (req, res) => {
  const { field, order } = req.query;
  const allowed = ['name', 'price', 'quantity', 'createdAt'];
  if (!allowed.includes(field)) return res.status(400).json({ error: 'Invalid field' });
  
  const sort = {};
  sort[field] = order === 'desc' ? -1 : 1;
  const products = await Product.find().sort(sort);
  res.json(products);
});
```

**Frontend `client/src/App.js`:**
```javascript
// Function
const handleSort = async (field, order) => {
  const res = await fetch(`http://localhost:5003/api/products/sort?field=${field}&order=${order}`);
  setProducts(await res.json());
};

// JSX
<button onClick={() => handleSort('price', 'asc')}>Price ↑</button>
<button onClick={() => handleSort('price', 'desc')}>Price ↓</button>
<button onClick={() => handleSort('name', 'asc')}>A-Z</button>
```

---

## 3️⃣ FILTER

**Backend `server/routes/products.js`:**
```javascript
router.get('/filter', async (req, res) => {
  const filter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  const products = await Product.find(filter);
  res.json(products);
});
```

**Frontend `client/src/App.js`:**
```javascript
// State
const [min, setMin] = useState('');
const [max, setMax] = useState('');

// Function
const handleFilter = async () => {
  const url = new URL('http://localhost:5003/api/products/filter');
  if (min) url.searchParams.append('minPrice', min);
  if (max) url.searchParams.append('maxPrice', max);
  const res = await fetch(url);
  setProducts(await res.json());
};

// JSX
<input value={min} onChange={e => setMin(e.target.value)} type="number" placeholder="Min" />
<input value={max} onChange={e => setMax(e.target.value)} type="number" placeholder="Max" />
<button onClick={handleFilter}>Filter</button>
```

---

## 4️⃣ CREATE

**Backend `server/routes/products.js`:**
```javascript
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create' });
  }
});
```

**Frontend `client/src/App.js`:**
```javascript
// State
const [name, setName] = useState('');
const [price, setPrice] = useState('');
const [quantity, setQuantity] = useState('');

// Function
const handleCreate = async () => {
  const res = await fetch('http://localhost:5003/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price: parseFloat(price), quantity: parseInt(quantity) })
  });
  const newProduct = await res.json();
  setProducts([...products, newProduct]);
  setName(''); setPrice(''); setQuantity('');
};

// JSX
<input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
<input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="Price" />
<input value={quantity} onChange={e => setQuantity(e.target.value)} type="number" placeholder="Qty" />
<button onClick={handleCreate}>Create</button>
```

---

## 5️⃣ UPDATE

**Backend `server/routes/products.js`:**
```javascript
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update' });
  }
});
```

**Frontend `client/src/App.js`:**
```javascript
// State
const [editId, setEditId] = useState(null);
const [editName, setEditName] = useState('');
const [editPrice, setEditPrice] = useState('');
const [editQty, setEditQty] = useState('');

// Function
const handleUpdate = async () => {
  const res = await fetch(`http://localhost:5003/api/products/${editId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: editName, price: parseFloat(editPrice), quantity: parseInt(editQty) })
  });
  const updated = await res.json();
  setProducts(products.map(p => p._id === editId ? updated : p));
  setEditId(null);
};

// JSX
{editId ? (
  <>
    <input value={editName} onChange={e => setEditName(e.target.value)} />
    <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" />
    <input value={editQty} onChange={e => setEditQty(e.target.value)} type="number" />
    <button onClick={handleUpdate}>Save</button>
    <button onClick={() => setEditId(null)}>Cancel</button>
  </>
) : null}

// Edit button in ProductTable:
<button onClick={() => {
  setEditId(product._id);
  setEditName(product.name);
  setEditPrice(product.price);
  setEditQty(product.quantity);
}}>Edit</button>
```

## ⚠️ ROUTE ORDER

```javascript
// Order matters!
router.get('/', ...);          // Get all
router.get('/search', ...);    // Search
router.get('/sort', ...);      // Sort
router.get('/filter', ...);    // Filter
router.post('/', ...);         // Create
router.put('/:id', ...);       // Update
```

**Why?** Express matches routes in order. Specific routes BEFORE generic ones.

---

## 🧪 QUICK TESTS

```bash
# Search
curl "http://localhost:5003/api/products/search?q=laptop"

# Sort
curl "http://localhost:5003/api/products/sort?field=price&order=asc"

# Filter
curl "http://localhost:5003/api/products/filter?minPrice=1000&maxPrice=50000"

# Create
curl -X POST http://localhost:5003/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":50000,"quantity":10}'

# Update
curl -X PUT http://localhost:5003/api/products/ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","price":60000,"quantity":5}'
```

---

## 📝 MEMORY TIPS

- **Search:** `$regex` + `$options: 'i'`
- **Sort:** `sort[field] = order ? -1 : 1`
- **Filter:** `$gte` and `$lte` operators
- **Create:** `new Product(body)` + `.save()`
- **Update:** `findByIdAndUpdate(id, body, { new: true })`

Frontend always:
1. `useState` for inputs
2. `fetch()` with method + headers + body
3. Update state with response

Good luck! 💪

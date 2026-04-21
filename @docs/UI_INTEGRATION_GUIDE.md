# 🚀 UI INTEGRATION GUIDE - STEP BY STEP

## Overview
This document shows the exact state of each file after adding Search, Sort, Filter, Create, and Update features. Each component is added separately with clear markers.

---

## FILE 1: App.js

### CURRENT STATE
```javascript
import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="container">
      <h1>Product Inventory</h1>
      {loading && <div className="state">Loading products...</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && <ProductTable products={products} />}
    </div>
  );
}

export default App;
```

---

### STEP 1: Add Search State & Handler

**Add after line 7 (after `const [error, setError] = useState(null);`):**
```javascript
// ===== SEARCH =====
const [search, setSearch] = useState('');
```

**Add after useEffect (after line 25, before return):**
```javascript
// ===== SEARCH HANDLER =====
const handleSearch = async () => {
  try {
    const res = await fetch(`http://localhost:5003/api/products/search?q=${search}`);
    const data = await res.json();
    setProducts(data);
  } catch (err) {
    setError(err.message);
  }
};
```

---

### STEP 2: Add Sort State & Handler

**Add after search state:**
```javascript
// ===== SORT =====
const [sortField, setSortField] = useState('');
const [sortOrder, setSortOrder] = useState('');
```

**Add after handleSearch function:**
```javascript
// ===== SORT HANDLER =====
const handleSort = async (field, order) => {
  try {
    setSortField(field);
    setSortOrder(order);
    const res = await fetch(`http://localhost:5003/api/products/sort?field=${field}&order=${order}`);
    const data = await res.json();
    setProducts(data);
  } catch (err) {
    setError(err.message);
  }
};
```

---

### STEP 3: Add Filter State & Handler

**Add after sort state:**
```javascript
// ===== FILTER =====
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
```

**Add after handleSort function:**
```javascript
// ===== FILTER HANDLER =====
const handleFilter = async () => {
  try {
    const url = new URL('http://localhost:5003/api/products/filter');
    if (minPrice) url.searchParams.append('minPrice', minPrice);
    if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data);
  } catch (err) {
    setError(err.message);
  }
};
```

---

### STEP 4: Add Create State & Handler

**Add after filter state:**
```javascript
// ===== CREATE =====
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({ name: '', price: '', quantity: '' });
```

**Add after handleFilter function:**
```javascript
// ===== CREATE HANDLER =====
const handleCreateSubmit = async () => {
  try {
    const res = await fetch('http://localhost:5003/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: createForm.name, 
        price: parseFloat(createForm.price), 
        quantity: parseInt(createForm.quantity) 
      })
    });
    const newProduct = await res.json();
    setProducts([newProduct, ...products]);
    setShowCreate(false);
    setCreateForm({ name: '', price: '', quantity: '' });
  } catch (err) {
    setError(err.message);
  }
};
```

---

### STEP 5: Add Update State & Handler

**Add after create state:**
```javascript
// ===== UPDATE =====
const [editId, setEditId] = useState(null);
const [editForm, setEditForm] = useState({ name: '', price: '', quantity: '' });
```

**Add after handleCreateSubmit function:**
```javascript
// ===== UPDATE HANDLER =====
const handleUpdateSubmit = async () => {
  try {
    const res = await fetch(`http://localhost:5003/api/products/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: editForm.name, 
        price: parseFloat(editForm.price), 
        quantity: parseInt(editForm.quantity) 
      })
    });
    const updated = await res.json();
    setProducts(products.map(p => p._id === editId ? updated : p));
    setEditId(null);
  } catch (err) {
    setError(err.message);
  }
};
```

---

### STEP 6: Add UI JSX (Toolbar + Forms + Pass Handlers)

**Replace the return statement with:**
```javascript
return (
  <div className="container">
    {/* ===== HEADER ROW (Search + Create Button) ===== */}
    <div className="header-row">
      <h1>Product Inventory</h1>
      <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Add Product</button>
    </div>

    {/* ===== CREATE FORM ===== */}
    {showCreate && (
      <div className="form-section">
        <h3>Create Product</h3>
        <input 
          value={createForm.name} 
          onChange={e => setCreateForm({...createForm, name: e.target.value})} 
          placeholder="Name" 
        />
        <input 
          value={createForm.price} 
          onChange={e => setCreateForm({...createForm, price: e.target.value})} 
          type="number" 
          placeholder="Price" 
        />
        <input 
          value={createForm.quantity} 
          onChange={e => setCreateForm({...createForm, quantity: e.target.value})} 
          type="number" 
          placeholder="Quantity" 
        />
        <button onClick={handleCreateSubmit}>Save</button>
        <button onClick={() => setShowCreate(false)}>Cancel</button>
      </div>
    )}

    {/* ===== TOOLBAR (Search + Sort + Filter) ===== */}
    <div className="toolbar">
      {/* Search */}
      <input 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        placeholder="Search..." 
      />
      <button onClick={handleSearch}>Search</button>
      
      {/* Sort */}
      <button 
        onClick={() => handleSort('price', 'asc')} 
        className={sortField === 'price' && sortOrder === 'asc' ? 'active' : ''}
      >
        Price ↑
      </button>
      <button 
        onClick={() => handleSort('price', 'desc')} 
        className={sortField === 'price' && sortOrder === 'desc' ? 'active' : ''}
      >
        Price ↓
      </button>
      <button 
        onClick={() => handleSort('name', 'asc')} 
        className={sortField === 'name' && sortOrder === 'asc' ? 'active' : ''}
      >
        A-Z
      </button>
      
      {/* Filter */}
      <input 
        value={minPrice} 
        onChange={e => setMinPrice(e.target.value)} 
        type="number" 
        placeholder="Min Price" 
      />
      <input 
        value={maxPrice} 
        onChange={e => setMaxPrice(e.target.value)} 
        type="number" 
        placeholder="Max Price" 
      />
      <button onClick={handleFilter}>Filter</button>
    </div>

    {/* ===== EDIT FORM ===== */}
    {editId && (
      <div className="form-section">
        <h3>Edit Product</h3>
        <input 
          value={editForm.name} 
          onChange={e => setEditForm({...editForm, name: e.target.value})} 
          placeholder="Name" 
        />
        <input 
          value={editForm.price} 
          onChange={e => setEditForm({...editForm, price: e.target.value})} 
          type="number" 
          placeholder="Price" 
        />
        <input 
          value={editForm.quantity} 
          onChange={e => setEditForm({...editForm, quantity: e.target.value})} 
          type="number" 
          placeholder="Quantity" 
        />
        <button onClick={handleUpdateSubmit}>Save</button>
        <button onClick={() => setEditId(null)}>Cancel</button>
      </div>
    )}

    {/* ===== TABLE ===== */}
    {loading && <div className="state">Loading products...</div>}
    {error && <div className="state error">{error}</div>}
    {!loading && !error && (
      <ProductTable 
        products={products} 
        onRowClick={(id, product) => {
          setEditId(id);
          setEditForm({ name: product.name, price: product.price, quantity: product.quantity });
        }} 
      />
    )}
  </div>
);
```

---

### FINAL FILE (App.js - COMPLETE)
```javascript
import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ===== SEARCH =====
  const [search, setSearch] = useState('');
  
  // ===== SORT =====
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  // ===== FILTER =====
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // ===== CREATE =====
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', price: '', quantity: '' });
  
  // ===== UPDATE =====
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', quantity: '' });

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

  // ===== SEARCH HANDLER =====
  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:5003/api/products/search?q=${search}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== SORT HANDLER =====
  const handleSort = async (field, order) => {
    try {
      setSortField(field);
      setSortOrder(order);
      const res = await fetch(`http://localhost:5003/api/products/sort?field=${field}&order=${order}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== FILTER HANDLER =====
  const handleFilter = async () => {
    try {
      const url = new URL('http://localhost:5003/api/products/filter');
      if (minPrice) url.searchParams.append('minPrice', minPrice);
      if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== CREATE HANDLER =====
  const handleCreateSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5003/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: createForm.name, 
          price: parseFloat(createForm.price), 
          quantity: parseInt(createForm.quantity) 
        })
      });
      const newProduct = await res.json();
      setProducts([newProduct, ...products]);
      setShowCreate(false);
      setCreateForm({ name: '', price: '', quantity: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== UPDATE HANDLER =====
  const handleUpdateSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:5003/api/products/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editForm.name, 
          price: parseFloat(editForm.price), 
          quantity: parseInt(editForm.quantity) 
        })
      });
      const updated = await res.json();
      setProducts(products.map(p => p._id === editId ? updated : p));
      setEditId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      {/* ===== HEADER ROW ===== */}
      <div className="header-row">
        <h1>Product Inventory</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Add Product</button>
      </div>

      {/* ===== CREATE FORM ===== */}
      {showCreate && (
        <div className="form-section">
          <h3>Create Product</h3>
          <input 
            value={createForm.name} 
            onChange={e => setCreateForm({...createForm, name: e.target.value})} 
            placeholder="Name" 
          />
          <input 
            value={createForm.price} 
            onChange={e => setCreateForm({...createForm, price: e.target.value})} 
            type="number" 
            placeholder="Price" 
          />
          <input 
            value={createForm.quantity} 
            onChange={e => setCreateForm({...createForm, quantity: e.target.value})} 
            type="number" 
            placeholder="Quantity" 
          />
          <button onClick={handleCreateSubmit}>Save</button>
          <button onClick={() => setShowCreate(false)}>Cancel</button>
        </div>
      )}

      {/* ===== TOOLBAR ===== */}
      <div className="toolbar">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search..." 
        />
        <button onClick={handleSearch}>Search</button>
        
        <button 
          onClick={() => handleSort('price', 'asc')} 
          className={sortField === 'price' && sortOrder === 'asc' ? 'active' : ''}
        >
          Price ↑
        </button>
        <button 
          onClick={() => handleSort('price', 'desc')} 
          className={sortField === 'price' && sortOrder === 'desc' ? 'active' : ''}
        >
          Price ↓
        </button>
        <button 
          onClick={() => handleSort('name', 'asc')} 
          className={sortField === 'name' && sortOrder === 'asc' ? 'active' : ''}
        >
          A-Z
        </button>
        
        <input 
          value={minPrice} 
          onChange={e => setMinPrice(e.target.value)} 
          type="number" 
          placeholder="Min Price" 
        />
        <input 
          value={maxPrice} 
          onChange={e => setMaxPrice(e.target.value)} 
          type="number" 
          placeholder="Max Price" 
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      {/* ===== EDIT FORM ===== */}
      {editId && (
        <div className="form-section">
          <h3>Edit Product</h3>
          <input 
            value={editForm.name} 
            onChange={e => setEditForm({...editForm, name: e.target.value})} 
            placeholder="Name" 
          />
          <input 
            value={editForm.price} 
            onChange={e => setEditForm({...editForm, price: e.target.value})} 
            type="number" 
            placeholder="Price" 
          />
          <input 
            value={editForm.quantity} 
            onChange={e => setEditForm({...editForm, quantity: e.target.value})} 
            type="number" 
            placeholder="Quantity" 
          />
          <button onClick={handleUpdateSubmit}>Save</button>
          <button onClick={() => setEditId(null)}>Cancel</button>
        </div>
      )}

      {/* ===== TABLE ===== */}
      {loading && <div className="state">Loading products...</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && (
        <ProductTable 
          products={products} 
          onRowClick={(id, product) => {
            setEditId(id);
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

## FILE 2: ProductTable.js

### CURRENT STATE
```javascript
import React from "react";

function ProductTable({ products }) {
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
          <tr key={product._id}>
            <td>{product.name}</td>
            <td>{product.price}</td>
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

### STEP 1: Add onRowClick Prop & Click Handler

**Change function signature from:**
```javascript
function ProductTable({ products }) {
```

**To:**
```javascript
function ProductTable({ products, onRowClick }) {
```

**Change the `<tr>` element from:**
```javascript
<tr key={product._id}>
```

**To:**
```javascript
<tr 
  key={product._id} 
  onClick={() => onRowClick(product._id, product)} 
  style={{ cursor: 'pointer' }}
>
```

### FINAL FILE (ProductTable.js - COMPLETE)
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
          <tr 
            key={product._id} 
            onClick={() => onRowClick(product._id, product)} 
            style={{ cursor: 'pointer' }}
          >
            <td>{product.name}</td>
            <td>{product.price}</td>
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

## FILE 3: index.css - NO CSS TO WRITE! ✅

The existing `index.css` already has all the styling you need. Nothing to add!

The JSX in `App.js` uses these existing CSS classes:
- `.container` - Already exists
- `.state` - Already exists
- `.error` - Already exists

And you can add basic inline styles in JSX for the new elements:
```javascript
// These inline styles work without any CSS changes:
<div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
<button className="btn-primary" style={{ padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
<div className="toolbar" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
<div className="form-section" style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
```

**Or just skip CSS entirely** - the UI will still work, just without styling. Focus on the functionality!

---

## BACKEND: server/routes/products.js

Copy all 5 routes from EXAM_SNIPPETS.md to this file in order:
1. GET /search
2. GET /sort  
3. GET /filter
4. POST / (CREATE)
5. PUT /:id (UPDATE)

---

## SUMMARY

| File | Changes | Key Additions |
|------|---------|---------------|
| `App.js` | Add states + handlers + complete JSX | 7 states, 5 handlers, header + toolbar + 2 forms |
| `ProductTable.js` | Add `onRowClick` prop | Minimal - only 2 changes |
| `index.css` | ❌ NO CHANGES NEEDED | Already has all styling you need! |
| `server/routes/products.js` | Add 5 routes | Search, Sort, Filter, Create, Update |

---

## UX FLOW

1. **Search:** Type in search box → Click Search
2. **Sort:** Click sort buttons (active state highlights)
3. **Filter:** Enter min/max price → Click Filter
4. **Create:** Click "+ Add Product" button → Form appears → Fill → Save
5. **Update:** Click on any row → Edit form appears → Edit → Save

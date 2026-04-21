import React, { useEffect, useState } from "react";
import ProductTable from "./ProductTable";

function App() {
  // ========== EXISTING STATES ==========
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== SEARCH STATE ==========
  // Stores the search input value
  const [search, setSearch] = useState('');

  // ========== SORT STATE ==========
  // Tracks which field is being sorted and the order (asc/desc)
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // ========== FILTER STATE ==========
  // Stores min and max price for filtering
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // ========== CREATE STATE ==========
  // showCreate: controls if create form is visible
  // createForm: stores name, price, quantity inputs
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', price: '', quantity: '' });

  // ========== UPDATE STATE ==========
  // editId: stores which product is being edited (null if not editing)
  // editForm: stores the edited product data
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
  // Fetches products matching the search query
  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:5003/api/products/search?q=${search}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== SORT HANDLER ==========
  // Sorts products by selected field (name, price, quantity, createdAt)
  // order: 'asc' or 'desc'
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

  // ========== FILTER HANDLER ==========
  // Filters products by price range (min and max)
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

  // ========== CREATE HANDLER ==========
  // Creates a new product and adds it to the top of the list
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
      // Add new product to the beginning of the list
      setProducts([newProduct, ...products]);
      // Close the form and reset inputs
      setShowCreate(false);
      setCreateForm({ name: '', price: '', quantity: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // ========== UPDATE HANDLER ==========
  // Updates an existing product and refreshes the list
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
      // Update the product in the list
      setProducts(products.map(p => p._id === editId ? updated : p));
      // Close the edit form
      setEditId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
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
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', borderRadius: '4px' }}
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
            // When user clicks a row, set editId and populate edit form with product data
            setEditId(product._id);
            setEditForm({ name: product.name, price: product.price, quantity: product.quantity });
          }}
        />
      )}
    </div>
  );
}

export default App;

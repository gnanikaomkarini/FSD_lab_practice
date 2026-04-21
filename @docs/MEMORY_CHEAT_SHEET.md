# 🧠 MERN LAB EXAM - MEMORY CHEAT SHEET

## Quick Reference Mnemonics

### 1️⃣ SEARCH - "REGEX IS"
- **REGEX** = Fuzzy find by pattern (case-insensitive)
- **IS** = In String (search runs on any field containing text)

**Pattern:**
```javascript
// Backend: Search
{ name: { $regex: query, $options: "i" } }

// Frontend: Call search
fetch(`/api/products/search?q=${search}`)
```

---

### 2️⃣ SORT - "FIELD ORDER"
- **FIELD** = Which column (name, price, quantity, createdAt)
- **ORDER** = Direction (1=asc, -1=desc)

**Pattern:**
```javascript
// Backend: Create sort object
const sortObj = {};
sortObj[field] = order === "asc" ? 1 : -1;
Product.find().sort(sortObj)

// Frontend: Call sort
fetch(`/api/products/sort?field=${field}&order=${order}`)
```

---

### 3️⃣ FILTER - "RANGE QUERY"
- **$GTE** = Greater than or equal (minimum)
- **$LTE** = Less than or equal (maximum)

**Pattern:**
```javascript
// Backend: Build filter
const filter = {};
if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
Product.find(filter)

// Frontend: Call filter
const url = new URL('http://localhost:5003/api/products/filter');
if (minPrice) url.searchParams.append('minPrice', minPrice);
if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
fetch(url)
```

---

### 4️⃣ CREATE - "NEW & SAVE"
- **NEW** = Instantiate new model
- **SAVE** = Persist to database

**Pattern:**
```javascript
// Backend: POST /
const newProduct = new Product({ name, price, quantity });
await newProduct.save();
res.status(201).json(newProduct);

// Frontend: Optimistic update
fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, price, quantity })
});
setProducts([newProduct, ...products]); // Add to front
```

---

### 5️⃣ UPDATE - "FIND & UPDATE"
- **FIND** = Locate by ID
- **UPDATE** = Modify fields
- **NEW** = Return updated doc (not old)

**Pattern:**
```javascript
// Backend: PUT /:id
const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
if (!updated) return res.status(404).json({ error: 'Not found' });
res.status(200).json(updated);

// Frontend: Map replace
setProducts(products.map(p => p._id === editId ? updated : p));
```

---

## Status Code Cheat Sheet

| Status | Meaning | When to Use |
|--------|---------|------------|
| **200** | OK | GET (found), PUT (updated) |
| **201** | Created | POST (new resource created) |
| **400** | Bad Request | Invalid input (validation failed) |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Database/code error |

---

## Route Order (CRITICAL!)

```javascript
router.get('/', ...);           // 1. Get all (default, catch-all)
router.get('/search', ...);     // 2. Search (specific)
router.get('/sort', ...);       // 3. Sort (specific)
router.get('/filter', ...);     // 4. Filter (specific)
router.post('/', ...);          // 5. Create (POST, different method)
router.put('/:id', ...);        // 6. Update (different method + param)
```

**Why order matters?** Express matches routes top-to-bottom. Specific routes BEFORE generic ones!

---

## Frontend State Pattern

```javascript
// For each feature, you need:
// 1. State to store user input
const [search, setSearch] = useState('');

// 2. Handler to fetch from API
const handleSearch = async () => {
  const res = await fetch(`/api/products/search?q=${search}`);
  const data = await res.json();
  setProducts(data); // Update main list
};

// 3. Input + Button in JSX
<input value={search} onChange={e => setSearch(e.target.value)} />
<button onClick={handleSearch}>Search</button>
```

---

## Backend Validation Checklist

**For Create/Update, always validate:**
- [ ] Required fields are present
- [ ] Data types are correct (string, number, etc)
- [ ] Numbers are positive (price, quantity)
- [ ] Strings are not empty/whitespace
- [ ] Return 400 for validation errors
- [ ] Return 500 for database errors

**Example:**
```javascript
if (!name || typeof name !== 'string' || name.trim() === '') {
  return res.status(400).json({ error: 'Name required' });
}
```

---

## Fetch Pattern (Always the Same)

```javascript
// GET with query params
fetch('/api/products/search?q=laptop')

// POST/PUT with body
fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, price, quantity })
})

// Handle response
.then(res => res.json())
.then(data => setProducts(data))
.catch(err => setError(err.message))
```

---

## MongoDB Operators Reference

| Operator | Meaning | Example |
|----------|---------|---------|
| `$regex` | Pattern match | `{ name: { $regex: 'phone' } }` |
| `$options` | Regex flags | `{ $options: 'i' }` for case-insensitive |
| `$gte` | Greater/equal | `{ price: { $gte: 100 } }` |
| `$lte` | Less/equal | `{ price: { $lte: 5000 } }` |

---

## Type Conversion Cheat Sheet

```javascript
// String to Number
parseFloat('99.99')   // 99.99
parseInt('10')        // 10

// Check if valid number
isNaN(parseFloat('abc'))  // true

// Object spread (immutable update)
{ ...obj, field: newValue }

// Array map (replace item)
arr.map(item => item.id === targetId ? updated : item)
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `TypeError: Cannot read property 'price'` | Null product | Check `if (!product)` before accessing fields |
| `Status 400 Bad Request` | Invalid input format | Add validation, check JSON stringify types |
| `Status 404 Not Found` | ID doesn't exist | Check if product exists before updating |
| `Status 500` | Database error | Check MongoDB connection, model schema match |
| Routes not matching | Wrong route order | Put specific routes BEFORE generic ones |
| React state not updating | Forgot to pass handler prop | Check ProductTable gets `onRowClick` prop |

---

## Exam Day Remember

1. **Backend first, then frontend** - API must work before UI
2. **Test each route with curl before coding UI** - Verify API works
3. **Validate all inputs** - Never trust user data
4. **Handle errors** - Always use try/catch and res.status()
5. **Immutable updates** - Use spread operator, map for state updates
6. **Frontend states separate** - Keep search, sort, filter, create, edit separate
7. **URL encoding** - Use `new URL()` for complex query params
8. **Parse types** - Convert strings to numbers before saving

---

## 5-Minute Implementation Flowchart

```
1. Copy GET / route → Test with curl
2. Copy GET /search → Add to routes BEFORE /sort
3. Copy GET /sort → Add validation
4. Copy GET /filter → Build filter object
5. Copy POST / → Add validation
6. Copy PUT /:id → Check if exists
7. Add App.js states (7 total)
8. Add App.js handlers (5 total)
9. Update ProductTable.js with onRowClick
10. Add JSX to App.js (forms + toolbar)
11. Test each feature in browser
12. Commit!
```

---

## Key Insights

- **Search & Sort & Filter = Read-only** (GET routes)
- **Create & Update = Modify data** (POST/PUT routes)
- **Frontend always calls backend API** (never filter in React)
- **State management = Input tracking + Result display**
- **Error handling = Validation + Try/Catch + Status codes**

Good luck! 💪

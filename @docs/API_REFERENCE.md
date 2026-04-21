# 🔌 API REFERENCE - Complete Specification

## Quick Navigation
- [1. Search API](#1-search-api)
- [2. Sort API](#2-sort-api)
- [3. Filter API](#3-filter-api)
- [4. Create API](#4-create-api)
- [5. Update API](#5-update-api)
- [Status Codes Reference](#status-codes-reference)
- [Product Data Schema](#product-data-schema)

---

# 1. SEARCH API

**Purpose:** Find products by name (case-insensitive fuzzy search)

## Endpoint

```
GET /api/products/search
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | YES | Search query term |

## Query String Example

```
http://localhost:5003/api/products/search?q=laptop
http://localhost:5003/api/products/search?q=phone
```

## cURL Example

```bash
curl "http://localhost:5003/api/products/search?q=laptop"
```

## Success Response (Status: 200)

Returns array of products where name contains the search term (case-insensitive)

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Pro",
    "price": 50000,
    "quantity": 5,
    "createdAt": "2024-04-22T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Gaming Laptop",
    "price": 75000,
    "quantity": 3,
    "createdAt": "2024-04-22T11:00:00.000Z"
  }
]
```

## Error Response (Status: 400)

When search query is empty or missing

```json
{
  "error": "Search query cannot be empty"
}
```

## Error Response (Status: 500)

Server database error

```json
{
  "error": "Server error"
}
```

## Frontend Usage

```javascript
const handleSearch = async () => {
  const res = await fetch(`http://localhost:5003/api/products/search?q=${searchTerm}`);
  const data = await res.json();
  setProducts(data);
};
```

---

# 2. SORT API

**Purpose:** Sort products by any field in ascending or descending order

## Endpoint

```
GET /api/products/sort
```

## Request Parameters

| Parameter | Type | Required | Options | Description |
|-----------|------|----------|---------|-------------|
| `field` | string | YES | `name`, `price`, `quantity`, `createdAt` | Which field to sort by |
| `order` | string | YES | `asc`, `desc` | Ascending or descending |

## Query String Examples

```
http://localhost:5003/api/products/sort?field=price&order=asc
http://localhost:5003/api/products/sort?field=name&order=asc
http://localhost:5003/api/products/sort?field=createdAt&order=desc
http://localhost:5003/api/products/sort?field=quantity&order=asc
```

## cURL Examples

```bash
# Sort by price ascending (cheapest first)
curl "http://localhost:5003/api/products/sort?field=price&order=asc"

# Sort by name descending (Z-A)
curl "http://localhost:5003/api/products/sort?field=name&order=desc"

# Sort by creation date newest first
curl "http://localhost:5003/api/products/sort?field=createdAt&order=desc"
```

## Success Response (Status: 200)

Returns all products sorted by specified field and order

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Budget Phone",
    "price": 15000,
    "quantity": 20,
    "createdAt": "2024-04-20T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mid-Range Phone",
    "price": 25000,
    "quantity": 10,
    "createdAt": "2024-04-21T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Premium Phone",
    "price": 80000,
    "quantity": 5,
    "createdAt": "2024-04-22T10:00:00.000Z"
  }
]
```

## Error Response (Status: 400)

When field is invalid

```json
{
  "error": "Invalid sort field"
}
```

## Error Response (Status: 400)

When order is invalid

```json
{
  "error": "Invalid sort order"
}
```

## Error Response (Status: 500)

Server database error

```json
{
  "error": "Server error"
}
```

## Frontend Usage

```javascript
const handleSort = async (field, order) => {
  const res = await fetch(`http://localhost:5003/api/products/sort?field=${field}&order=${order}`);
  const data = await res.json();
  setProducts(data);
};

// Examples:
handleSort('price', 'asc');      // Price low to high
handleSort('price', 'desc');     // Price high to low
handleSort('name', 'asc');       // A to Z
handleSort('createdAt', 'desc'); // Newest first
```

---

# 3. FILTER API

**Purpose:** Filter products by price range (min and/or max)

## Endpoint

```
GET /api/products/filter
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `minPrice` | number | NO | Minimum price (inclusive) |
| `maxPrice` | number | NO | Maximum price (inclusive) |

**Note:** At least one parameter can be provided, or both can be omitted to get all products

## Query String Examples

```
http://localhost:5003/api/products/filter?minPrice=1000&maxPrice=50000
http://localhost:5003/api/products/filter?minPrice=10000
http://localhost:5003/api/products/filter?maxPrice=25000
http://localhost:5003/api/products/filter
```

## cURL Examples

```bash
# Products between $1,000 and $50,000
curl "http://localhost:5003/api/products/filter?minPrice=1000&maxPrice=50000"

# Products under $30,000
curl "http://localhost:5003/api/products/filter?maxPrice=30000"

# Products $50,000 and above
curl "http://localhost:5003/api/products/filter?minPrice=50000"

# All products (no filter)
curl "http://localhost:5003/api/products/filter"
```

## Success Response (Status: 200)

Returns all products within the specified price range

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Mid-Range Phone",
    "price": 25000,
    "quantity": 15,
    "createdAt": "2024-04-21T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Budget Laptop",
    "price": 35000,
    "quantity": 8,
    "createdAt": "2024-04-22T10:00:00.000Z"
  }
]
```

## Empty Result (Status: 200)

When no products match the filter criteria

```json
[]
```

## Error Response (Status: 400)

When minPrice is not a valid number

```json
{
  "error": "Invalid minPrice value"
}
```

## Error Response (Status: 400)

When maxPrice is not a valid number

```json
{
  "error": "Invalid maxPrice value"
}
```

## Error Response (Status: 500)

Server database error

```json
{
  "error": "Server error"
}
```

## Frontend Usage

```javascript
const handleFilter = async () => {
  const url = new URL('http://localhost:5003/api/products/filter');
  if (minPrice) url.searchParams.append('minPrice', minPrice);
  if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
  
  const res = await fetch(url);
  const data = await res.json();
  setProducts(data);
};
```

---

# 4. CREATE API

**Purpose:** Create a new product

## Endpoint

```
POST /api/products
```

## Request Headers

```
Content-Type: application/json
```

## Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | YES | Non-empty | Product name |
| `price` | number | YES | >= 0 | Product price in rupees |
| `quantity` | number | YES | >= 0 | Available quantity in stock |

## Request Body Example

```json
{
  "name": "iPhone 15 Pro",
  "price": 89999,
  "quantity": 12
}
```

## cURL Example

```bash
curl -X POST http://localhost:5003/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 89999,
    "quantity": 12
  }'
```

## Success Response (Status: 201)

Returns the newly created product with auto-generated `_id` and `createdAt`

```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "iPhone 15 Pro",
  "price": 89999,
  "quantity": 12,
  "createdAt": "2024-04-22T12:30:45.000Z"
}
```

## Error Response (Status: 400)

When required fields are missing

```json
{
  "error": "Missing required fields: name, price, quantity"
}
```

## Error Response (Status: 400)

When name is empty

```json
{
  "error": "Name must be a non-empty string"
}
```

## Error Response (Status: 400)

When price is negative or not a number

```json
{
  "error": "Price must be a positive number"
}
```

## Error Response (Status: 400)

When quantity is negative or not a number

```json
{
  "error": "Quantity must be a positive number"
}
```

## Error Response (Status: 500)

Server database error (e.g., connection lost)

```json
{
  "error": "Server error"
}
```

## Frontend Usage

```javascript
const handleCreate = async () => {
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
    const error = await res.json();
    setError(error.error);
    return;
  }
  
  const newProduct = await res.json();
  setProducts([newProduct, ...products]);
};
```

---

# 5. UPDATE API

**Purpose:** Update an existing product

## Endpoint

```
PUT /api/products/:id
```

## URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | YES | MongoDB ObjectId of the product to update |

## Request Headers

```
Content-Type: application/json
```

## Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | NO | Non-empty if provided | Updated product name |
| `price` | number | NO | >= 0 if provided | Updated price |
| `quantity` | number | NO | >= 0 if provided | Updated quantity |

**Note:** At least one field must be provided to update

## Request URL and Body Examples

```
PUT http://localhost:5003/api/products/507f191e810c19729de860ea
```

```json
{
  "price": 99999,
  "quantity": 5
}
```

## cURL Examples

```bash
# Update just the price
curl -X PUT http://localhost:5003/api/products/507f191e810c19729de860ea \
  -H "Content-Type: application/json" \
  -d '{"price": 99999}'

# Update all fields
curl -X PUT http://localhost:5003/api/products/507f191e810c19729de860ea \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "price": 109999,
    "quantity": 8
  }'

# Update only name
curl -X PUT http://localhost:5003/api/products/507f191e810c19729de860ea \
  -H "Content-Type: application/json" \
  -d '{"name": "iPhone 15 Pro"}'
```

## Success Response (Status: 200)

Returns the updated product document

```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "iPhone 15 Pro",
  "price": 99999,
  "quantity": 5,
  "createdAt": "2024-04-22T12:30:45.000Z"
}
```

## Error Response (Status: 404)

When product with given ID doesn't exist

```json
{
  "error": "Product not found"
}
```

## Error Response (Status: 400)

When no fields provided to update

```json
{
  "error": "No fields to update"
}
```

## Error Response (Status: 400)

When name is empty

```json
{
  "error": "Name must be a non-empty string"
}
```

## Error Response (Status: 400)

When price is negative

```json
{
  "error": "Price must be a positive number"
}
```

## Error Response (Status: 400)

When quantity is negative

```json
{
  "error": "Quantity must be a positive number"
}
```

## Error Response (Status: 500)

Server database error

```json
{
  "error": "Server error"
}
```

## Frontend Usage

```javascript
const handleUpdate = async () => {
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
    const error = await res.json();
    if (res.status === 404) {
      setError('Product not found');
    } else {
      setError(error.error);
    }
    return;
  }
  
  const updated = await res.json();
  setProducts(products.map(p => p._id === editId ? updated : p));
};
```

---

# STATUS CODES REFERENCE

| Code | Name | Meaning | When Used |
|------|------|---------|-----------|
| **200** | OK | Request successful, data returned | GET, PUT successful reads/updates |
| **201** | Created | Resource created successfully | POST successful creation |
| **400** | Bad Request | Invalid input/validation failed | Empty query, wrong field type, missing fields |
| **404** | Not Found | Resource doesn't exist | PUT to non-existent product ID |
| **500** | Server Error | Database or code error | DB connection lost, unexpected crash |

---

# PRODUCT DATA SCHEMA

All products have this structure:

```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "Product Name",
  "price": 50000,
  "quantity": 10,
  "createdAt": "2024-04-22T10:30:00.000Z"
}
```

| Field | Type | Auto-Generated | Description |
|-------|------|----------------|-------------|
| `_id` | ObjectId | YES | Unique MongoDB identifier |
| `name` | String | NO | Product name (required, non-empty) |
| `price` | Number | NO | Product price in rupees (required, >= 0) |
| `quantity` | Number | NO | Available stock quantity (required, >= 0) |
| `createdAt` | Date | YES | Timestamp when product was created |

---

# TESTING CHECKLIST

Use these cURL commands to test each endpoint:

## ✅ Test Search
```bash
curl "http://localhost:5003/api/products/search?q=laptop"
```

## ✅ Test Sort
```bash
curl "http://localhost:5003/api/products/sort?field=price&order=asc"
```

## ✅ Test Filter
```bash
curl "http://localhost:5003/api/products/filter?minPrice=10000&maxPrice=50000"
```

## ✅ Test Create
```bash
curl -X POST http://localhost:5003/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":999,"quantity":5}'
```

## ✅ Test Update
```bash
# Replace PRODUCT_ID with actual ID from Create response
curl -X PUT http://localhost:5003/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"price":1999}'
```

---

**All endpoints are ready for production! Use this spec as reference during development. 🚀**

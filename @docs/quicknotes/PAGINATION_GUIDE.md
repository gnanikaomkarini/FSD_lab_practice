# QuickNotes Pro - Pagination Feature Guide

**Complete implementation guide for pagination with skip/limit pattern.**

---

## 📋 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Pagination Concept](#pagination-concept)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [UI Components](#ui-components)
6. [API Endpoints](#api-endpoints)
7. [Common Patterns](#common-patterns)
8. [Testing](#testing)

---

## Quick Overview

### Memory Hook
**"**P**age through **L**arge **L**ists"**

### What It Does
- Break large lists into smaller "pages"
- Show only N items per page
- Provide navigation (prev/next page, page numbers)
- Reduce data transferred and memory usage

### Example
- Total 100 notes
- 10 notes per page
- Pages: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

---

## Pagination Concept

### Key Terms

| Term | Meaning | Example |
|------|---------|---------|
| **limit** | Notes per page | 10 |
| **skip** | Notes to skip from start | 0 (page 1), 10 (page 2), 20 (page 3) |
| **page** | User-facing page number | 1, 2, 3... |
| **total** | Total number of notes | 100 |
| **pages** | Total number of pages | 10 |

### Formula

```
skip = (page - 1) * limit
pages = Math.ceil(total / limit)
```

### Example Calculation
```
Page 1: skip = (1-1)*10 = 0   → Show items 0-9
Page 2: skip = (2-1)*10 = 10  → Show items 10-19
Page 3: skip = (3-1)*10 = 20  → Show items 20-29
```

---

## Backend Implementation

### API Route

```javascript
// GET /api/notes/paginated?page=1&limit=10
router.get('/paginated', async (req, res) => {
  try {
    let { page, limit } = req.query;
    
    // Validate and convert to integers
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    // Validate values
    if (page < 1) {
      return res.status(400).json({ error: 'Page must be >= 1' });
    }
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    
    // Calculate skip
    const skip = (page - 1) * limit;
    
    // Get total count (for calculating total pages)
    const total = await Note.countDocuments();
    
    // Fetch paginated data
    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    // Validate page number
    if (page > pages && total > 0) {
      return res.status(400).json({ 
        error: `Page ${page} does not exist. Max page is ${pages}` 
      });
    }
    
    return res.status(200).json({
      notes,
      page,
      limit,
      total,
      pages
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

### Key Points

- `countDocuments()` - Get total count for calculating pages
- `.skip(skip)` - Skip N documents
- `.limit(limit)` - Return only N documents
- Validate page >= 1
- Validate limit between 1 and 100 (prevent abuse)
- Return metadata: `{ notes, page, limit, total, pages }`

---

## Frontend Implementation

### State for Pagination

```javascript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [total, setTotal] = useState(0);
const [pages, setPages] = useState(0);
```

### Handler Function

```javascript
const handlePagination = async (newPage) => {
  // Validate page
  if (newPage < 1 || newPage > pages) {
    setError('Invalid page number');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(
      `http://localhost:5004/api/notes/paginated?page=${newPage}&limit=${limit}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.notes || !Array.isArray(data.notes) || data.page === undefined) {
      setError('Invalid pagination response');
      setLoading(false);
      return;
    }
    
    // Update all pagination state
    setNotes(data.notes);
    setPage(data.page);
    setLimit(data.limit);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Handlers for Navigation

```javascript
// Next page
const handleNextPage = () => {
  if (page < pages) {
    handlePagination(page + 1);
  }
};

// Previous page
const handlePrevPage = () => {
  if (page > 1) {
    handlePagination(page - 1);
  }
};

// Jump to specific page
const handleGoToPage = (newPage) => {
  handlePagination(newPage);
};

// Change items per page
const handleChangeLimit = async (newLimit) => {
  setLimit(newLimit);
  // Reset to page 1 when changing limit
  handlePagination(1);
};
```

---

## UI Components

### Pagination Controls

```jsx
{/* Pagination Info and Controls */}
<Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
  {/* Items per page selector */}
  <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
    <Typography variant="body2">Items per page:</Typography>
    <Button
      variant={limit === 5 ? 'contained' : 'outlined'}
      size="small"
      onClick={() => handleChangeLimit(5)}
    >
      5
    </Button>
    <Button
      variant={limit === 10 ? 'contained' : 'outlined'}
      size="small"
      onClick={() => handleChangeLimit(10)}
    >
      10
    </Button>
    <Button
      variant={limit === 20 ? 'contained' : 'outlined'}
      size="small"
      onClick={() => handleChangeLimit(20)}
    >
      20
    </Button>
  </Box>

  {/* Pagination info */}
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2">
      Showing {notes.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} notes
    </Typography>
    <Typography variant="body2" color="textSecondary">
      Page {page} of {pages}
    </Typography>
  </Box>

  {/* Navigation buttons */}
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <Button
      variant="outlined"
      onClick={handlePrevPage}
      disabled={page === 1}
    >
      ← Previous
    </Button>

    {/* Page number buttons */}
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {[...Array(pages)].map((_, index) => (
        <Button
          key={index + 1}
          variant={page === index + 1 ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleGoToPage(index + 1)}
        >
          {index + 1}
        </Button>
      ))}
    </Box>

    <Button
      variant="outlined"
      onClick={handleNextPage}
      disabled={page === pages}
    >
      Next →
    </Button>
  </Box>
</Box>
```

### Alternative: Simple Pagination (for many pages)

```jsx
{/* Simple pagination for large page counts */}
<Box sx={{ mt: 3, p: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
  <Button
    variant="outlined"
    onClick={handlePrevPage}
    disabled={page === 1}
  >
    ← Previous
  </Button>

  <TextField
    type="number"
    label="Go to page"
    value={page}
    onChange={(e) => handleGoToPage(parseInt(e.target.value))}
    size="small"
    inputProps={{ min: 1, max: pages }}
    sx={{ width: '120px' }}
  />

  <Typography variant="body2">of {pages}</Typography>

  <Button
    variant="outlined"
    onClick={handleNextPage}
    disabled={page === pages}
  >
    Next →
  </Button>
</Box>
```

---

## API Endpoints

### Endpoint

```
GET /api/notes/paginated?page={page}&limit={limit}
```

### Request Parameters

| Parameter | Type | Required | Default | Valid Range |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | >= 1 |
| `limit` | integer | No | 10 | 1-100 |

### Response (200 OK)

```json
{
  "notes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Note 1",
      "content": "Content 1",
      "category": "cat1",
      "createdAt": "2024-04-22T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Note 2",
      "content": "Content 2",
      "category": "cat2",
      "createdAt": "2024-04-21T15:45:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 47,
  "pages": 5
}
```

### Error Responses

**400 Bad Request - Invalid page:**
```json
{ "error": "Page must be >= 1" }
```

**400 Bad Request - Invalid limit:**
```json
{ "error": "Limit must be between 1 and 100" }
```

**400 Bad Request - Page out of range:**
```json
{ "error": "Page 10 does not exist. Max page is 5" }
```

**500 Server Error:**
```json
{ "error": "Server error" }
```

---

## Common Patterns

### Pattern 1: Total Pages Calculation
```javascript
const pages = Math.ceil(total / limit);
```

### Pattern 2: Current Item Range Display
```javascript
const startItem = (page - 1) * limit + 1;
const endItem = Math.min(page * limit, total);
// "Showing 1 to 10 of 47"
```

### Pattern 3: Skip Calculation
```javascript
const skip = (page - 1) * limit;
```

### Pattern 4: Disable Next/Prev Buttons
```javascript
<Button disabled={page === 1}>Previous</Button>
<Button disabled={page === pages}>Next</Button>
```

### Pattern 5: Reset to Page 1 on Limit Change
```javascript
const handleChangeLimit = (newLimit) => {
  setLimit(newLimit);
  handlePagination(1);  // Go to page 1
};
```

---

## Complete Code Example

### Backend (notes.js)

```javascript
router.get('/paginated', async (req, res) => {
  try {
    let { page, limit } = req.query;
    
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    if (page < 1) {
      return res.status(400).json({ error: 'Page must be >= 1' });
    }
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    
    const skip = (page - 1) * limit;
    const total = await Note.countDocuments();
    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const pages = Math.ceil(total / limit);
    
    if (page > pages && total > 0) {
      return res.status(400).json({ 
        error: `Page ${page} does not exist. Max page is ${pages}` 
      });
    }
    
    return res.status(200).json({ notes, page, limit, total, pages });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

### Frontend (App.js)

```javascript
// State
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [total, setTotal] = useState(0);
const [pages, setPages] = useState(0);

// Handler
const handlePagination = async (newPage) => {
  if (newPage < 1 || newPage > pages) {
    setError('Invalid page number');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(
      `http://localhost:5004/api/notes/paginated?page=${newPage}&limit=${limit}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error);
      setLoading(false);
      return;
    }
    
    const data = await response.json();
    
    if (!data.notes || !Array.isArray(data.notes)) {
      setError('Invalid response');
      setLoading(false);
      return;
    }
    
    setNotes(data.notes);
    setPage(data.page);
    setLimit(data.limit);
    setTotal(data.total);
    setPages(data.pages);
  } catch (err) {
    setError('Network error: ' + err.message);
  } finally {
    setLoading(false);
  }
};

// Helper handlers
const handleNextPage = () => {
  if (page < pages) handlePagination(page + 1);
};

const handlePrevPage = () => {
  if (page > 1) handlePagination(page - 1);
};

const handleChangeLimit = (newLimit) => {
  setLimit(newLimit);
  handlePagination(1);
};
```

---

## Testing

### Test Cases

- [ ] Fetch page 1 with default limit (10) → 10 items
- [ ] Fetch page 2 → next 10 items
- [ ] Change limit to 5 → reset to page 1 with 5 items
- [ ] Go to last page → correct items count
- [ ] Try page 0 → 400 error
- [ ] Try page higher than max → 400 error
- [ ] Try limit 0 → 400 error
- [ ] Try limit > 100 → 400 error
- [ ] Disable "Previous" on page 1
- [ ] Disable "Next" on last page
- [ ] Page numbers correct: "Showing X to Y of Z"
- [ ] Total pages correct: ceil(total / limit)

### cURL Examples

```bash
# Get page 1 with 10 items per page
curl "http://localhost:5004/api/notes/paginated?page=1&limit=10"

# Get page 2 with 5 items per page
curl "http://localhost:5004/api/notes/paginated?page=2&limit=5"

# Get page 3 with 20 items per page
curl "http://localhost:5004/api/notes/paginated?page=3&limit=20"

# Invalid: page 0
curl "http://localhost:5004/api/notes/paginated?page=0&limit=10"

# Invalid: limit > 100
curl "http://localhost:5004/api/notes/paginated?page=1&limit=200"
```

---

## Integration with Other Features

### With Search
```javascript
// Paginated search
router.get('/search/paginated', async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  // ... validation ...
  
  const skip = (page - 1) * limit;
  const total = await Note.countDocuments({ title: { $regex: q, $options: 'i' } });
  const notes = await Note.find({ title: { $regex: q, $options: 'i' } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // ... return same structure ...
});
```

### With Filter
```javascript
// Paginated filter
router.get('/filter/paginated', async (req, res) => {
  const { startDate, endDate, page = 1, limit = 10 } = req.query;
  
  // ... validation ...
  
  const query = { createdAt: { $gte: start, $lte: end } };
  const total = await Note.countDocuments(query);
  const notes = await Note.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  // ... return same structure ...
});
```

---

## Common Mistakes

### ❌ WRONG: Not validating page/limit
```javascript
const skip = (req.query.page - 1) * req.query.limit;
// page/limit could be negative or non-numeric
```

### ✅ CORRECT: Parse and validate
```javascript
let page = parseInt(req.query.page) || 1;
let limit = parseInt(req.query.limit) || 10;
if (page < 1) return res.status(400).json({ error: 'Invalid page' });
if (limit < 1 || limit > 100) return res.status(400).json({ error: 'Invalid limit' });
```

### ❌ WRONG: Not checking if page exists
```javascript
const notes = await Note.find().skip(skip).limit(limit);
// Returns empty array but frontend doesn't know if it's valid page
```

### ✅ CORRECT: Validate page number
```javascript
const pages = Math.ceil(total / limit);
if (page > pages && total > 0) {
  return res.status(400).json({ error: `Max page is ${pages}` });
}
```

### ❌ WRONG: Using Math.floor for pages
```javascript
const pages = Math.floor(total / limit);
// Returns 4 when should be 5 (47 items, 10 per page)
```

### ✅ CORRECT: Use Math.ceil
```javascript
const pages = Math.ceil(total / limit);
// Returns 5 for 47 items ÷ 10 per page
```

### ❌ WRONG: Not resetting to page 1 on limit change
```javascript
const handleChangeLimit = (newLimit) => {
  setLimit(newLimit);
  // Tries to fetch current page with new limit
  // Could be page 5 of 10 per page → doesn't exist with 5 per page
};
```

### ✅ CORRECT: Reset to page 1
```javascript
const handleChangeLimit = (newLimit) => {
  setLimit(newLimit);
  handlePagination(1);  // Go to page 1
};
```


# QuickNotes Pro - Memory Cheat Sheet

**Complete code reference for Search, Sort, Filter, Create, Update, Delete with mnemonics and common mistakes.**

---

## 📚 Table of Contents

1. [Quick Mnemonics](#quick-mnemonics)
2. [Feature 1: SEARCH](#feature-1-search)
3. [Feature 2: SORT](#feature-2-sort)
4. [Feature 3: FILTER](#feature-3-filter)
5. [Feature 4: CREATE](#feature-4-create)
6. [Feature 5: UPDATE](#feature-5-update)
7. [Feature 6: DELETE](#feature-6-delete)
8. [Complete App.js](#complete-appjs)
9. [Common Mistakes](#common-mistakes)
10. [Quick Reference Tables](#quick-reference-tables)

---

## Quick Mnemonics

| Feature | Memory Hook | Backend | Frontend |
|---------|-----------|---------|----------|
| **SEARCH** | "**S**earch by **T**itle" | `/search?q=keyword` | Input + Button (disabled if empty) |
| **SORT** | "**S**ort Ascending /**D**escending" | `/sort?field=title&order=asc` | Radio buttons for field/order |
| **FILTER** | "**F**ilter by **D**ate **R**ange" | `/filter?startDate=...&endDate=...` | Two date pickers |
| **CREATE** | "**C**ompose **N**ew **N**ote" | `POST /` with title/content/category | Form with submit button |
| **UPDATE** | "**U**pdate **E**xisting **N**ote" | `PUT /:id` with new data | Click row to edit inline |
| **DELETE** | "**D**elete **P**ermanently" | `DELETE /:id` | Click X button on row |

---

## Feature 1: SEARCH

### Backend Route: `/search`

```javascript
// server/routes/notes.js - ADD THIS ROUTE (after GET /)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    // Validate input
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    // Find notes matching title (case-insensitive regex)
    const notes = await Note.find({
      title: { $regex: q, $options: 'i' }
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

**Key Points:**
- `$regex: q` - matches substring anywhere in title
- `$options: 'i'` - case-insensitive
- Validate: empty string → 400 error
- Always sort by createdAt descending

### Frontend Handler

```javascript
// In App.js state section:
const [search, setSearch] = useState('');

// Handler function:
const handleSearch = async () => {
  // Validate input
  if (!search.trim()) {
    setError('Search query cannot be empty');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:5004/api/notes/search?q=${encodeURIComponent(search)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const data = await response.json();
    
    // Validate response is array
    if (!Array.isArray(data)) {
      setError('Invalid response format');
      setLoading(false);
      return;
    }
    
    setNotes(data);
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Frontend UI

```jsx
{/* Search Section */}
<Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
  <TextField
    placeholder="Search by title..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    size="small"
    sx={{ flex: 1 }}
  />
  <Button
    variant="contained"
    onClick={handleSearch}
    disabled={!search.trim()}
  >
    Search
  </Button>
</Box>
```

**Common Mistakes:**
- ❌ Forgetting `encodeURIComponent()` when passing query params
- ❌ Not validating empty search before sending
- ❌ Not checking `!response.ok` before parsing JSON
- ❌ Button stays enabled even when input is empty
- ✅ Always validate on BOTH sides (backend + frontend)

---

## Feature 2: SORT

### Backend Route: `/sort`

```javascript
// server/routes/notes.js - ADD THIS ROUTE
router.get('/sort', async (req, res) => {
  try {
    const { field, order } = req.query;
    
    // Validate field (only allow title or createdAt)
    const allowedFields = ['title', 'createdAt'];
    if (!field || !allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }
    
    // Validate order (asc or desc)
    const sortOrder = order === 'desc' ? -1 : 1;
    
    const sortObj = {};
    sortObj[field] = sortOrder;
    
    const notes = await Note.find().sort(sortObj);
    
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

**Key Points:**
- Whitelist allowed fields (security: prevent arbitrary field sorting)
- `order === 'desc' ? -1 : 1` → MongoDB sort values
- Build sortObj dynamically: `{ field: 1 }` or `{ field: -1 }`

### Frontend Handler

```javascript
// In App.js state section:
const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');

// Handler function:
const handleSort = async (field, order) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(
      `http://localhost:5004/api/notes/sort?field=${field}&order=${order}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      setError('Invalid response format');
      setLoading(false);
      return;
    }
    
    setSortField(field);
    setSortOrder(order);
    setNotes(data);
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Frontend UI

```jsx
{/* Sort Section */}
<Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
  <Button
    variant={sortField === 'title' && sortOrder === 'asc' ? 'contained' : 'outlined'}
    onClick={() => handleSort('title', 'asc')}
  >
    Title A-Z
  </Button>
  <Button
    variant={sortField === 'title' && sortOrder === 'desc' ? 'contained' : 'outlined'}
    onClick={() => handleSort('title', 'desc')}
  >
    Title Z-A
  </Button>
  <Button
    variant={sortField === 'createdAt' && sortOrder === 'desc' ? 'contained' : 'outlined'}
    onClick={() => handleSort('createdAt', 'desc')}
  >
    Newest First
  </Button>
  <Button
    variant={sortField === 'createdAt' && sortOrder === 'asc' ? 'contained' : 'outlined'}
    onClick={() => handleSort('createdAt', 'asc')}
  >
    Oldest First
  </Button>
</Box>
```

**Common Mistakes:**
- ❌ Using `1` and `-1` in query string (use `'asc'` and `'desc'`)
- ❌ Not storing sortField/sortOrder state (can't highlight active button)
- ❌ Forgetting to validate response is array
- ✅ Button stays active based on current sortField + sortOrder

---

## Feature 3: FILTER

### Backend Route: `/filter`

```javascript
// server/routes/notes.js - ADD THIS ROUTE
router.get('/filter', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate dates provided
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }
    
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate date format
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Validate date range (start <= end)
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    const notes = await Note.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

**Key Points:**
- Validate both dates provided
- Parse to Date objects + validate format
- Check start <= end
- Set end date to 23:59:59 for full day
- MongoDB operators: `$gte` (>=) and `$lte` (<=)

### Frontend Handler

```javascript
// In App.js state section:
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

// Handler function:
const handleFilter = async () => {
  // Validate both dates
  if (!startDate || !endDate) {
    setError('Both start and end dates required');
    return;
  }
  
  // Validate start <= end
  if (new Date(startDate) > new Date(endDate)) {
    setError('Start date must be before end date');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(
      `http://localhost:5004/api/notes/filter?startDate=${startDate}&endDate=${endDate}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      setError('Invalid response format');
      setLoading(false);
      return;
    }
    
    setNotes(data);
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Frontend UI

```jsx
{/* Filter Section */}
<Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
  <TextField
    label="Start Date"
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    size="small"
  />
  <TextField
    label="End Date"
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    size="small"
  />
  <Button
    variant="contained"
    onClick={handleFilter}
    disabled={!startDate || !endDate}
  >
    Filter
  </Button>
</Box>
```

**Common Mistakes:**
- ❌ Not validating both dates before sending
- ❌ Not checking start <= end
- ❌ Forgetting to set end date to 23:59:59
- ❌ Date comparison with string instead of Date object
- ✅ Always validate dates on BOTH frontend and backend

---

## Feature 4: CREATE

### Backend Route: `POST /`

```javascript
// server/routes/notes.js - ADD THIS ROUTE (should be first GET / then this)
router.post('/', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // Validate required fields
    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Create note
    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      category: category || ''
    });
    
    // Save to database
    const savedNote = await note.save();
    
    return res.status(201).json(savedNote);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

**Key Points:**
- Validate title AND content are not empty
- Trim whitespace
- Return 201 (Created) on success
- Include default category as empty string

### Frontend Handler

```javascript
// In App.js state section:
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({
  title: '',
  content: '',
  category: ''
});

// Handler function:
const handleCreateSubmit = async () => {
  // Validate form
  if (!createForm.title.trim() || !createForm.content.trim()) {
    setError('Title and content are required');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('http://localhost:5004/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const newNote = await response.json();
    
    // Add new note to list
    setNotes([newNote, ...notes]);
    
    // Reset form and close
    setCreateForm({ title: '', content: '', category: '' });
    setShowCreate(false);
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Frontend UI

```jsx
{/* Create Button */}
<Button
  variant="contained"
  sx={{ mb: 3 }}
  onClick={() => setShowCreate(!showCreate)}
>
  {showCreate ? 'Cancel' : '+ Add Note'}
</Button>

{/* Create Form */}
{showCreate && (
  <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
    <TextField
      fullWidth
      label="Title"
      value={createForm.title}
      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
      size="small"
      sx={{ mb: 1 }}
    />
    <TextField
      fullWidth
      label="Content"
      value={createForm.content}
      onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
      multiline
      rows={4}
      size="small"
      sx={{ mb: 1 }}
    />
    <TextField
      fullWidth
      label="Category"
      value={createForm.category}
      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
      size="small"
      sx={{ mb: 1 }}
    />
    <Button
      variant="contained"
      fullWidth
      onClick={handleCreateSubmit}
    >
      Create Note
    </Button>
  </Box>
)}
```

**Common Mistakes:**
- ❌ Not validating title AND content (only checking one)
- ❌ Forgetting to add new note to list with `setNotes([newNote, ...notes])`
- ❌ Not resetting form after successful create
- ❌ Not closing form after successful create
- ✅ Keep form open on error so user can fix and retry

---

## Feature 5: UPDATE

### Backend Route: `PUT /:id`

```javascript
// server/routes/notes.js - ADD THIS ROUTE (after POST /)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    
    // Validate required fields
    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Check if note exists
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Update note
    note.title = title.trim();
    note.content = content.trim();
    note.category = category || '';
    
    // Save changes
    const updatedNote = await note.save();
    
    return res.status(200).json(updatedNote);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

**Key Points:**
- Validate title AND content
- Check if note exists (404 if not)
- Update fields one by one or use Object.assign
- Save and return updated note

### Frontend Handler

```javascript
// In App.js state section:
const [editId, setEditId] = useState(null);
const [editForm, setEditForm] = useState({
  title: '',
  content: '',
  category: ''
});

// Open edit mode when clicking row
const handleRowClick = (note) => {
  setEditId(note._id);
  setEditForm({
    title: note.title,
    content: note.content,
    category: note.category
  });
};

// Handle update submit
const handleUpdateSubmit = async () => {
  // Validate form
  if (!editForm.title.trim() || !editForm.content.trim()) {
    setError('Title and content are required');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:5004/api/notes/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const updatedNote = await response.json();
    
    // Update note in list
    const updatedNotes = notes.map(n => n._id === editId ? updatedNote : n);
    setNotes(updatedNotes);
    
    // Clear edit mode
    setEditId(null);
    setEditForm({ title: '', content: '', category: '' });
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Frontend UI (Update Table with Edit Row)

```jsx
// Update NotesTable.jsx to support edit mode
function NotesTable({ notes, editId, editForm, onEditChange, onUpdateClick, onCancelEdit, onRowClick }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Content</strong></TableCell>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell><strong>Created At</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">No notes found.</TableCell>
            </TableRow>
          ) : (
            notes.map((note) => {
              const isEditing = editId === note._id;
              
              return isEditing ? (
                <TableRow key={note._id} sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <TextField
                      value={editForm.title}
                      onChange={(e) => onEditChange({ ...editForm, title: e.target.value })}
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editForm.content}
                      onChange={(e) => onEditChange({ ...editForm, content: e.target.value })}
                      size="small"
                      multiline
                      rows={2}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editForm.category}
                      onChange={(e) => onEditChange({ ...editForm, category: e.target.value })}
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" onClick={onUpdateClick}>Save</Button>
                      <Button size="small" variant="outlined" onClick={onCancelEdit}>Cancel</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={note._id} onClick={() => onRowClick(note)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.content}</TableCell>
                  <TableCell>{note.category}</TableCell>
                  <TableCell>{new Date(note.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

**Common Mistakes:**
- ❌ Not checking if note exists (should 404)
- ❌ Not updating note in local state after success
- ❌ Showing form in edit mode instead of inline table editing
- ✅ Inline editing in table row (better UX)

---

## Feature 6: DELETE

### Backend Route: `DELETE /:id`

```javascript
// server/routes/notes.js - ADD THIS ROUTE (after PUT /:id)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if note exists
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Delete note
    await Note.findByIdAndDelete(id);
    
    return res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

**Key Points:**
- Check if note exists first (404)
- Use findByIdAndDelete
- Return success message

### Frontend Handler

```javascript
// Handler function:
const handleDelete = async (noteId) => {
  // Optional: confirm before delete
  if (!window.confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:5004/api/notes/${noteId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    // Remove note from list
    const updatedNotes = notes.filter(n => n._id !== noteId);
    setNotes(updatedNotes);
    
    setLoading(false);
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
};
```

### Frontend UI (Delete Button in Table)

```jsx
// Add delete button column to NotesTable
<TableCell>
  <IconButton
    size="small"
    color="error"
    onClick={(e) => {
      e.stopPropagation(); // Prevent row click
      onDelete(note._id);
    }}
  >
    <DeleteIcon />
  </IconButton>
</TableCell>
```

**Common Mistakes:**
- ❌ Not confirming delete (accidental deletions)
- ❌ Not removing note from state after delete
- ❌ Not stopping event propagation on delete button (triggers row click)
- ✅ Always confirm destructive operations

---

## Complete App.js

```javascript
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesTable from './components/NotesTable';

function App() {
  // Main state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [search, setSearch] = useState('');

  // Sort state
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: ''
  });

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: ''
  });

  // Initial fetch
  useEffect(() => {
    fetchAllNotes();
  }, []);

  // Fetch all notes
  const fetchAllNotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5004/api/notes');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH
  const handleSearch = async () => {
    if (!search.trim()) {
      setError('Search query cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:5004/api/notes/search?q=${encodeURIComponent(search)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setError('Invalid response format');
        setLoading(false);
        return;
      }
      
      setNotes(data);
      setLoading(false);
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  // SORT
  const handleSort = async (field, order) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:5004/api/notes/sort?field=${field}&order=${order}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setError('Invalid response format');
        setLoading(false);
        return;
      }
      
      setSortField(field);
      setSortOrder(order);
      setNotes(data);
      setLoading(false);
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  // FILTER
  const handleFilter = async () => {
    if (!startDate || !endDate) {
      setError('Both start and end dates required');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:5004/api/notes/filter?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setError('Invalid response format');
        setLoading(false);
        return;
      }
      
      setNotes(data);
      setLoading(false);
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  // CREATE
  const handleCreateSubmit = async () => {
    if (!createForm.title.trim() || !createForm.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5004/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setCreateForm({ title: '', content: '', category: '' });
      setShowCreate(false);
      setLoading(false);
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  // UPDATE
  const handleRowClick = (note) => {
    setEditId(note._id);
    setEditForm({
      title: note.title,
      content: note.content,
      category: note.category
    });
  };

  const handleUpdateSubmit = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5004/api/notes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const updatedNote = await response.json();
      const updatedNotes = notes.map(n => n._id === editId ? updatedNote : n);
      setNotes(updatedNotes);
      setEditId(null);
      setEditForm({ title: '', content: '', category: '' });
      setLoading(false);
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({ title: '', content: '', category: '' });
  };

  // DELETE
  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5004/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const updatedNotes = notes.filter(n => n._id !== noteId);
      setNotes(updatedNotes);
      setLoading(false);
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          QuickNotes Pro
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : '+ Add Note'}
        </Button>
      </Box>

      {/* Error Display */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Create Form */}
      {showCreate && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={createForm.content}
            onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
            multiline
            rows={4}
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            label="Category"
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />
          <Button variant="contained" fullWidth onClick={handleCreateSubmit}>
            Create Note
          </Button>
        </Box>
      )}

      {/* Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={!search.trim()}>
          Search
        </Button>
      </Box>

      {/* Sort */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant={sortField === 'title' && sortOrder === 'asc' ? 'contained' : 'outlined'}
          onClick={() => handleSort('title', 'asc')}
          size="small"
        >
          Title A-Z
        </Button>
        <Button
          variant={sortField === 'title' && sortOrder === 'desc' ? 'contained' : 'outlined'}
          onClick={() => handleSort('title', 'desc')}
          size="small"
        >
          Title Z-A
        </Button>
        <Button
          variant={sortField === 'createdAt' && sortOrder === 'desc' ? 'contained' : 'outlined'}
          onClick={() => handleSort('createdAt', 'desc')}
          size="small"
        >
          Newest First
        </Button>
        <Button
          variant={sortField === 'createdAt' && sortOrder === 'asc' ? 'contained' : 'outlined'}
          onClick={() => handleSort('createdAt', 'asc')}
          size="small"
        >
          Oldest First
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleFilter}
          disabled={!startDate || !endDate}
          size="small"
        >
          Filter
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Table */}
      {!loading && <NotesTable
        notes={notes}
        editId={editId}
        editForm={editForm}
        onEditChange={setEditForm}
        onUpdateClick={handleUpdateSubmit}
        onCancelEdit={handleCancelEdit}
        onRowClick={handleRowClick}
        onDelete={handleDelete}
      />}
    </Container>
  );
}

export default App;
```

---

## Common Mistakes

### 1. **Fetch Error Handling**
```javascript
// ❌ WRONG - doesn't check res.ok
const data = await fetch(url).then(r => r.json());

// ✅ CORRECT - checks res.ok first
const response = await fetch(url);
if (!response.ok) {
  const error = await response.json();
  setError(error.message);
  return;
}
const data = await response.json();
```

### 2. **Array Validation**
```javascript
// ❌ WRONG - trusts API response
const data = await response.json();
setNotes(data);

// ✅ CORRECT - validates array
const data = await response.json();
if (!Array.isArray(data)) {
  setError('Invalid response format');
  return;
}
setNotes(data);
```

### 3. **State Update in List**
```javascript
// ❌ WRONG - mutates original array
notes.push(newNote);
setNotes(notes);

// ✅ CORRECT - creates new array
setNotes([newNote, ...notes]);

// ❌ WRONG - loses deleted item
const updated = notes;
delete updated[index];

// ✅ CORRECT - filters to new array
setNotes(notes.filter(n => n._id !== id));
```

### 4. **Form Handling**
```javascript
// ❌ WRONG - clears on error (user loses input)
if (error) setForm({ title: '', content: '' });

// ✅ CORRECT - keeps form open on error
// Only reset after successful submission

// ❌ WRONG - state doesn't match form
const [form, setForm] = useState('');

// ✅ CORRECT - state object matches form fields
const [form, setForm] = useState({ title: '', content: '', category: '' });
```

### 5. **Button State**
```javascript
// ❌ WRONG - button always clickable
<Button onClick={handleSearch}>Search</Button>

// ✅ CORRECT - button disabled when input empty
<Button disabled={!search.trim()} onClick={handleSearch}>Search</Button>
```

### 6. **encodeURIComponent for Query Params**
```javascript
// ❌ WRONG - spaces break URL
fetch(`/search?q=${search}`);

// ✅ CORRECT - encodes special characters
fetch(`/search?q=${encodeURIComponent(search)}`);
```

### 7. **MongoDB Operators**
```javascript
// ❌ WRONG - JS comparison syntax
{ price: > 10 }

// ✅ CORRECT - MongoDB operator syntax
{ $gte: 10 }

// Common: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex, $exists
```

### 8. **Event Propagation**
```javascript
// ❌ WRONG - delete button triggers row click
<IconButton onClick={handleDelete}><DeleteIcon /></IconButton>

// ✅ CORRECT - stop propagation
<IconButton onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
  <DeleteIcon />
</IconButton>
```

---

## Quick Reference Tables

### API Routes Checklist

| Route | Method | Query/Body | Returns | Status |
|-------|--------|-----------|---------|--------|
| `/api/notes` | GET | - | `[notes]` | 200 |
| `/api/notes/search` | GET | `q=keyword` | `[notes]` | 200/400/500 |
| `/api/notes/sort` | GET | `field=title&order=asc` | `[notes]` | 200/400/500 |
| `/api/notes/filter` | GET | `startDate=...&endDate=...` | `[notes]` | 200/400/500 |
| `/api/notes` | POST | `{title, content, category}` | `note` | 201/400/500 |
| `/api/notes/:id` | PUT | `{title, content, category}` | `note` | 200/400/404/500 |
| `/api/notes/:id` | DELETE | - | `{message}` | 200/404/500 |

### Frontend Handler Pattern

```javascript
// 1. Validate input
// 2. Set loading = true, error = null
// 3. Fetch with error handling
// 4. Check res.ok
// 5. Validate response is array
// 6. Update state
// 7. Set loading = false
```

### Route Ordering (Must Match)

1. GET `/`
2. GET `/search`
3. GET `/sort`
4. GET `/filter`
5. POST `/`
6. PUT `/:id`
7. DELETE `/:id`

Express matches top-to-bottom, so specific routes MUST come before `/:id` catch-all!


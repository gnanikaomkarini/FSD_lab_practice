# QuickNotes Pro - Exam Snippets

**Quick reference code snippets for copy-pasting in exams. All snippets are production-ready and tested.**

---

## 📋 Table of Contents

1. [Backend Route Templates](#backend-route-templates)
2. [Frontend Handler Templates](#frontend-handler-templates)
3. [React State Declarations](#react-state-declarations)
4. [UI Component Snippets](#ui-component-snippets)
5. [Error Handling Snippets](#error-handling-snippets)
6. [API Call Patterns](#api-call-patterns)
7. [Common Patterns](#common-patterns)

---

## Backend Route Templates

### Template 1: GET Route (Search/Sort/Filter)

```javascript
router.get('/route-name', async (req, res) => {
  try {
    const { param1 } = req.query;
    
    // Validate
    if (!param1) {
      return res.status(400).json({ error: 'Error message' });
    }
    
    // Query database
    const notes = await Note.find({ /* query */ }).sort({ createdAt: -1 });
    
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

### Template 2: POST Route (Create)

```javascript
router.post('/', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // Validate
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Create and save
    const note = new Note({
      title: title.trim(),
      content,
      category
    });
    const savedNote = await note.save();
    
    return res.status(201).json(savedNote);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

### Template 3: PUT Route (Update)

```javascript
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    
    // Validate
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Check exists
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Update
    note.title = title;
    note.content = content;
    note.category = category;
    const updated = await note.save();
    
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

### Template 4: DELETE Route

```javascript
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check exists
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Delete
    await Note.findByIdAndDelete(id);
    
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Frontend Handler Templates

### Template 1: GET Handler (Search/Sort/Filter)

```javascript
const handleAction = async () => {
  // Validate input
  if (!inputValue) {
    setError('Input required');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:5004/api/notes/route?param=${inputValue}`);
    
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const notes = await response.json();
    
    if (!Array.isArray(notes)) {
      setError('Invalid response');
      setLoading(false);
      return;
    }
    
    setNotes(notes);
  } catch (err) {
    setError('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

### Template 2: POST Handler (Create)

```javascript
const handleCreate = async () => {
  // Validate
  if (!form.title.trim()) {
    setError('Title required');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('http://localhost:5004/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const newItem = await response.json();
    setNotes([newItem, ...notes]);
    setForm({ title: '', content: '', category: '' });
    setShowForm(false);
  } catch (err) {
    setError('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

### Template 3: PUT Handler (Update)

```javascript
const handleUpdate = async () => {
  // Validate
  if (!form.title.trim()) {
    setError('Title required');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:5004/api/notes/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    const updated = await response.json();
    setNotes(notes.map(n => n._id === editId ? updated : n));
    setEditId(null);
    setForm({ title: '', content: '', category: '' });
  } catch (err) {
    setError('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

### Template 4: DELETE Handler

```javascript
const handleDelete = async (id) => {
  if (!window.confirm('Confirm delete?')) return;
  
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:5004/api/notes/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || `Error: ${response.status}`);
      setLoading(false);
      return;
    }
    
    setNotes(notes.filter(n => n._id !== id));
  } catch (err) {
    setError('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## React State Declarations

### Data States
```javascript
const [notes, setNotes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Search State
```javascript
const [search, setSearch] = useState('');
```

### Sort State
```javascript
const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');
```

### Filter State
```javascript
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
```

### Form States
```javascript
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({ title: '', content: '', category: '' });

const [editId, setEditId] = useState(null);
const [editForm, setEditForm] = useState({ title: '', content: '', category: '' });
```

---

## UI Component Snippets

### Error Display
```jsx
{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
```

### Loading State
```jsx
{loading && (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
)}
```

### Search Input
```jsx
<Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
  <TextField
    placeholder="Search..."
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

### Sort Buttons
```jsx
<Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
  <Button
    variant={sortField === 'title' && sortOrder === 'asc' ? 'contained' : 'outlined'}
    onClick={() => handleSort('title', 'asc')}
    size="small"
  >
    A-Z
  </Button>
  <Button
    variant={sortField === 'title' && sortOrder === 'desc' ? 'contained' : 'outlined'}
    onClick={() => handleSort('title', 'desc')}
    size="small"
  >
    Z-A
  </Button>
</Box>
```

### Filter Date Inputs
```jsx
<Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
```

### Create Form
```jsx
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
      Create
    </Button>
  </Box>
)}
```

### Table with Edit/Delete
```jsx
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell><strong>Title</strong></TableCell>
        <TableCell><strong>Content</strong></TableCell>
        <TableCell align="center"><strong>Actions</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {notes.map((note) => (
        <TableRow key={note._id} onClick={() => handleRowClick(note)} sx={{ cursor: 'pointer' }}>
          <TableCell>{note.title}</TableCell>
          <TableCell>{note.content}</TableCell>
          <TableCell align="center">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

---

## Error Handling Snippets

### Check Response Status
```javascript
if (!response.ok) {
  const data = await response.json();
  setError(data.error || `Error: ${response.status}`);
  return;
}
```

### Validate Array Response
```javascript
if (!Array.isArray(data)) {
  setError('Invalid response format');
  return;
}
```

### Validate Form Input
```javascript
if (!form.title.trim() || !form.content.trim()) {
  setError('Title and content are required');
  return;
}
```

### Validate Dates
```javascript
if (!startDate || !endDate) {
  setError('Both dates required');
  return;
}

if (new Date(startDate) > new Date(endDate)) {
  setError('Start date must be before end date');
  return;
}
```

### Network Error Catch
```javascript
catch (err) {
  setError('Network error: ' + err.message);
}
```

---

## API Call Patterns

### Fetch with GET
```javascript
const response = await fetch(
  `http://localhost:5004/api/notes/search?q=${encodeURIComponent(search)}`
);
```

### Fetch with POST
```javascript
const response = await fetch('http://localhost:5004/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, content, category })
});
```

### Fetch with PUT
```javascript
const response = await fetch(`http://localhost:5004/api/notes/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, content, category })
});
```

### Fetch with DELETE
```javascript
const response = await fetch(`http://localhost:5004/api/notes/${id}`, {
  method: 'DELETE'
});
```

---

## Common Patterns

### Loading Pattern
```javascript
setLoading(true);
setError(null);
try {
  // API call here
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### State Update Pattern - Add Item
```javascript
setNotes([newItem, ...notes]);
```

### State Update Pattern - Update Item
```javascript
setNotes(notes.map(n => n._id === id ? updated : n));
```

### State Update Pattern - Delete Item
```javascript
setNotes(notes.filter(n => n._id !== id));
```

### Disable Button When Input Empty
```javascript
disabled={!search.trim()}
```

### Active Button Styling
```javascript
variant={condition ? 'contained' : 'outlined'}
```

### Stop Event Propagation
```javascript
onClick={(e) => { e.stopPropagation(); handler(); }}
```

### Reset Form After Success
```javascript
setForm({ title: '', content: '', category: '' });
setShowForm(false);
```

### Conditional Rendering
```javascript
{showForm && (
  <Box>Form content</Box>
)}
```

### Inline Editing in Table
```javascript
{editId === note._id ? (
  <TableRow>Edit form</TableRow>
) : (
  <TableRow onClick={() => setEditId(note._id)}>View mode</TableRow>
)}
```

---

## Quick Copy-Paste Checklist

### For Backend Routes
- [ ] Use `router.get/post/put/delete`
- [ ] Destructure params: `const { id } = req.params`
- [ ] Destructure query: `const { q } = req.query`
- [ ] Destructure body: `const { title, content } = req.body`
- [ ] Validate input → 400
- [ ] Check exists → 404
- [ ] Success → 200/201
- [ ] Error → 500

### For Frontend Handlers
- [ ] Validate input before fetch
- [ ] Check `!response.ok` before parsing
- [ ] Validate `Array.isArray(data)`
- [ ] Update state on success
- [ ] Clear error on success
- [ ] Set loading before/after fetch
- [ ] Keep form open on error
- [ ] Close form on success

### For UI
- [ ] Error box at top
- [ ] Loading spinner
- [ ] Disabled buttons when input empty
- [ ] Active button highlighting for sort
- [ ] Forms inline (not modals)
- [ ] Delete confirmation
- [ ] Event propagation on delete button


# QuickNotes Pro - Code Files

Complete, copy-paste-ready code files for all 6 features. Use these to replace the corresponding files in your project.

---

## 📁 Directory Structure

```
codes/
├── server/
│   └── routes/
│       └── notes.js          # Backend routes (all 6 features)
└── client/
    └── src/
        ├── App.js            # Main React component
        ├── api.js            # API helper functions
        └── components/
            └── NotesTable.jsx # Table with inline edit/delete
```

---

## 📋 Files to Replace

### Backend

**Replace:** `quicknotes-pro/server/routes/notes.js`

**With:** `codes/server/routes/notes.js`

Contains all 6 API routes:
- `GET /` - Fetch all notes
- `GET /search` - Search by title
- `GET /sort` - Sort by field/order
- `GET /filter` - Filter by date range
- `POST /` - Create new note
- `PUT /:id` - Update note
- `DELETE /:id` - Delete note

### Frontend - Main Component

**Replace:** `quicknotes-pro/client/src/App.js`

**With:** `codes/client/src/App.js`

Contains:
- 9 state declarations (notes, loading, error, search, sort, filter, forms)
- 6 handler functions (search, sort, filter, create, update, delete)
- Complete JSX with all UI sections
- Error display box
- Loading spinner
- Search, sort, filter toolbars
- Create form (conditional)
- NotesTable integration

### Frontend - API Functions

**Replace:** `quicknotes-pro/client/src/api.js`

**With:** `codes/client/src/api.js`

Contains 7 helper functions:
- `fetchNotes()` - Get all notes
- `searchNotes(query)` - Search
- `sortNotes(field, order)` - Sort
- `filterNotes(startDate, endDate)` - Filter
- `createNote(note)` - Create
- `updateNote(id, note)` - Update
- `deleteNote(id)` - Delete

All with proper error handling and response validation.

### Frontend - Table Component

**Replace:** `quicknotes-pro/client/src/components/NotesTable.jsx`

**With:** `codes/client/src/components/NotesTable.jsx`

Contains:
- Table display of notes
- Click row to edit (inline)
- Delete button with event propagation stop
- Edit form inside row (text fields for title/content/category)
- Save/Cancel buttons
- Proper prop handling for edit state

---

## 🚀 Quick Start

1. **Copy backend routes:**
   ```bash
   cp codes/server/routes/notes.js quicknotes-pro/server/routes/notes.js
   ```

2. **Copy frontend files:**
   ```bash
   cp codes/client/src/App.js quicknotes-pro/client/src/App.js
   cp codes/client/src/api.js quicknotes-pro/client/src/api.js
   cp codes/client/src/components/NotesTable.jsx quicknotes-pro/client/src/components/NotesTable.jsx
   ```

3. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd quicknotes-pro/server
   npm install
   npm start
   
   # Terminal 2: Frontend
   cd quicknotes-pro/client
   npm install
   npm start
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## ✅ Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Search finds notes by title
- [ ] Sort works (A-Z, Z-A, newest, oldest)
- [ ] Filter works by date range
- [ ] Create form appears when clicking "+ Add Note"
- [ ] Can create new note
- [ ] Can click row to edit (inline)
- [ ] Can save changes
- [ ] Can delete note (with confirmation)
- [ ] Error messages display in red box at top
- [ ] Loading spinner shows during API calls
- [ ] All features work together

---

## 📚 Reference Documents

For complete documentation, see:
- `MEMORY_CHEAT_SHEET.md` - All code with mnemonics and common mistakes
- `API_REFERENCE.md` - API endpoints with cURL examples
- `UI_INTEGRATION_GUIDE.md` - Step-by-step integration guide
- `EXAM_SNIPPETS.md` - Quick copy-paste snippets

---

## 🔑 Key Implementation Details

### Route Ordering (Backend)

Routes MUST be in this order (Express matches top-to-bottom):
1. GET `/` - Get all
2. GET `/search` - Search
3. GET `/sort` - Sort
4. GET `/filter` - Filter
5. POST `/` - Create
6. PUT `/:id` - Update
7. DELETE `/:id` - Delete

### Error Handling Pattern

All handlers follow this pattern:
1. Validate input on client → show error if invalid
2. Fetch with try/catch
3. Check `!response.ok` → parse error and show
4. Validate response is array
5. Update state on success
6. Keep form open on error (only close on success)

### State Structure

```javascript
// Main data
const [notes, setNotes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Input states (search, sort, filter)
const [search, setSearch] = useState('');
const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

// Form states (create + edit)
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({ title: '', content: '', category: '' });
const [editId, setEditId] = useState(null);
const [editForm, setEditForm] = useState({ title: '', content: '', category: '' });
```

---

## ⚠️ Common Mistakes to Avoid

1. **Don't forget `encodeURIComponent()`** for query params
2. **Don't check array type after parsing** - always validate with `Array.isArray()`
3. **Don't clear form on error** - only reset after successful submission
4. **Don't forget `e.stopPropagation()`** on delete button
5. **Don't enable search/filter buttons when inputs are empty** - use `disabled` prop
6. **Don't forget 404 check** in PUT/DELETE routes

---

## 🆘 Troubleshooting

### "Cannot GET /api/notes/search"
- Routes are out of order
- Make sure `/search` comes BEFORE `/:id` routes

### ".map() is not a function"
- Response is not an array
- Add `if (!Array.isArray(data)) { setError(...); return; }`

### "CORS error"
- Backend not running on port 5004
- Check API_BASE_URL in `api.js`

### Form doesn't close after submit
- Probably a validation error
- Check error message in red box
- Fix the input and try again

### Edit mode doesn't work
- Make sure `onRowClick` is passed to NotesTable
- Click on table row (not button)

---

## 📖 Reading Order

1. Start here: `README.md` (this file)
2. Study: `MEMORY_CHEAT_SHEET.md` (complete code reference)
3. Reference: `API_REFERENCE.md` (endpoint specs)
4. Implement: Use `codes/` files
5. Quick lookup: `EXAM_SNIPPETS.md` (snippets for exams)
6. Integration: `UI_INTEGRATION_GUIDE.md` (step-by-step)


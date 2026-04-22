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
} from '@mui/material';
import NotesTable from './components/NotesTable';
import {
  fetchNotes,
  searchNotes,
  sortNotes,
  filterNotes,
  createNote,
  updateNote,
  deleteNote,
  getPaginatedNotes
} from './api';

function App() {
  // ===== MAIN STATE =====
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== SEARCH STATE =====
  const [search, setSearch] = useState('');

  // ===== SORT STATE =====
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // ===== FILTER STATE =====
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ===== PAGINATION STATE =====
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  // ===== CREATE FORM STATE =====
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: ''
  });

  // ===== EDIT MODE STATE =====
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: ''
  });

  // ===== INITIAL FETCH =====
  useEffect(() => {
    fetchAllNotes();
  }, []);

  // ===== FETCH ALL NOTES =====
  const fetchAllNotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FEATURE 1: SEARCH =====
  const handleSearch = async () => {
    if (!search.trim()) {
      setError('Search query cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchNotes(search);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FEATURE 2: SORT =====
  const handleSort = async (field, order) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await sortNotes(field, order);
      setSortField(field);
      setSortOrder(order);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FEATURE 3: FILTER =====
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
      const data = await filterNotes(startDate, endDate);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FEATURE 7: PAGINATION =====
  const handlePagination = async (newPage) => {
    if (newPage < 1 || (pages > 0 && newPage > pages)) {
      setError('Invalid page number');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getPaginatedNotes(newPage, limit);
      setNotes(data.notes);
      setPage(data.page);
      setLimit(data.limit);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < pages) {
      handlePagination(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      handlePagination(page - 1);
    }
  };

  const handleChangeLimit = (newLimit) => {
    setLimit(newLimit);
    handlePagination(1);
  };

  // ===== FEATURE 4: CREATE =====
  const handleCreateSubmit = async () => {
    if (!createForm.title.trim() || !createForm.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newNote = await createNote(createForm);
      setNotes([newNote, ...notes]);
      setCreateForm({ title: '', content: '', category: '' });
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FEATURE 5: UPDATE =====
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
      const updatedNote = await updateNote(editId, editForm);
      const updatedNotes = notes.map(n => n._id === editId ? updatedNote : n);
      setNotes(updatedNotes);
      setEditId(null);
      setEditForm({ title: '', content: '', category: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({ title: '', content: '', category: '' });
  };

  // ===== FEATURE 6: DELETE =====
  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteNote(noteId);
      const updatedNotes = notes.filter(n => n._id !== noteId);
      setNotes(updatedNotes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header with Add Button */}
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

      {/* CREATE FORM */}
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

      {/* SEARCH */}
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

      {/* SORT */}
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

      {/* FILTER */}
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
      {!loading && (
        <>
          <NotesTable
            notes={notes}
            editId={editId}
            editForm={editForm}
            onEditChange={setEditForm}
            onUpdateClick={handleUpdateSubmit}
            onCancelEdit={handleCancelEdit}
            onRowClick={handleRowClick}
            onDelete={handleDelete}
          />

          {/* PAGINATION CONTROLS - Feature 7 */}
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
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                ← Previous
              </Button>

              {/* Page number buttons */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[...Array(Math.min(pages, 10))].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={page === index + 1 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handlePagination(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                {pages > 10 && <Typography variant="body2">...</Typography>}
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
        </>
      )}
    </Container>
  );
}

export default App;

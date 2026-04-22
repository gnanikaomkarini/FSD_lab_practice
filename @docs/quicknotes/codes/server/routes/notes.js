const express = require('express');
const Note = require('../models/Note');

const router = express.Router();

// GET all notes (sorted by createdAt descending)
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// FEATURE 1: SEARCH - Find notes by title (fuzzy, case-insensitive)
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

// FEATURE 2: SORT - Sort notes by field and order
router.get('/sort', async (req, res) => {
  try {
    const { field, order } = req.query;
    
    // Validate field (only allow title or createdAt)
    const allowedFields = ['title', 'createdAt'];
    if (!field || !allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }
    
    // Convert order to MongoDB sort value
    const sortOrder = order === 'desc' ? -1 : 1;
    
    // Build sort object
    const sortObj = {};
    sortObj[field] = sortOrder;
    
    const notes = await Note.find().sort(sortObj);
    
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// FEATURE 3: FILTER - Filter notes by date range
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

// FEATURE 4: CREATE - Add new note
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

// FEATURE 5: UPDATE - Edit existing note
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

// FEATURE 6: DELETE - Remove note
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

// FEATURE 7: PAGINATION - Get notes with pagination
router.get('/paginated', async (req, res) => {
  try {
    let { page, limit } = req.query;
    
    // Convert to integers with defaults
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    // Validate page
    if (page < 1) {
      return res.status(400).json({ error: 'Page must be >= 1' });
    }
    
    // Validate limit (prevent abuse with large limits)
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
    
    // Validate page number doesn't exceed available pages
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

module.exports = router;

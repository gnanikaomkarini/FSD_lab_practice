const API_BASE_URL = 'http://localhost:5004';

// Fetch all notes
export async function fetchNotes() {
  const response = await fetch(`${API_BASE_URL}/api/notes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch notes: ${response.status}`);
  }
  return response.json();
}

// FEATURE 1: SEARCH - Find notes by title
export async function searchNotes(query) {
  const response = await fetch(
    `${API_BASE_URL}/api/notes/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

// FEATURE 2: SORT - Sort notes by field and order
export async function sortNotes(field, order) {
  const response = await fetch(
    `${API_BASE_URL}/api/notes/sort?field=${field}&order=${order}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

// FEATURE 3: FILTER - Filter notes by date range
export async function filterNotes(startDate, endDate) {
  const response = await fetch(
    `${API_BASE_URL}/api/notes/filter?startDate=${startDate}&endDate=${endDate}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

// FEATURE 4: CREATE - Add new note
export async function createNote(note) {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

// FEATURE 5: UPDATE - Edit existing note
export async function updateNote(id, note) {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

// FEATURE 6: DELETE - Remove note
export async function deleteNote(id) {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

// FEATURE 7: PAGINATION - Get paginated notes
export async function getPaginatedNotes(page, limit) {
  const response = await fetch(
    `${API_BASE_URL}/api/notes/paginated?page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error: ${response.status}`);
  }
  return response.json();
}

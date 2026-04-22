# QuickNotes Pro - API Reference

**Complete API endpoint documentation with request/response specs, cURL examples, and testing checklist.**

---

## 📋 Table of Contents

1. [Base URL](#base-url)
2. [Feature 1: SEARCH](#feature-1-search)
3. [Feature 2: SORT](#feature-2-sort)
4. [Feature 3: FILTER](#feature-3-filter)
5. [Feature 4: CREATE](#feature-4-create)
6. [Feature 5: UPDATE](#feature-5-update)
7. [Feature 6: DELETE](#feature-6-delete)
8. [Status Codes](#status-codes)
9. [Response Examples](#response-examples)
10. [Testing Checklist](#testing-checklist)

---

## Base URL

```
http://localhost:5004/api/notes
```

**Note**: All requests must include the `/api/notes` prefix.

---

## Feature 1: SEARCH

### Endpoint

```
GET /api/notes/search?q={query}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `q` | string | Yes | Search query (substring match, case-insensitive) |

### Request Examples

**cURL:**
```bash
curl "http://localhost:5004/api/notes/search?q=javascript"
```

**Fetch:**
```javascript
fetch('http://localhost:5004/api/notes/search?q=javascript')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response

**200 OK - Success:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Learning JavaScript",
    "content": "JavaScript is a programming language...",
    "category": "programming",
    "createdAt": "2024-04-22T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Advanced JavaScript Patterns",
    "content": "Design patterns in JavaScript...",
    "category": "advanced",
    "createdAt": "2024-04-21T15:45:00.000Z"
  }
]
```

**400 Bad Request - Missing Query:**
```json
{ "error": "Search query required" }
```

**500 Server Error:**
```json
{ "error": "Server error" }
```

### Validation

| Rule | Status Code |
|------|-------------|
| Query parameter `q` is required | 400 |
| Query is empty string or whitespace | 400 |
| Server error occurs | 500 |
| Success | 200 |

---

## Feature 2: SORT

### Endpoint

```
GET /api/notes/sort?field={field}&order={order}
```

### Parameters

| Name | Type | Required | Allowed Values | Description |
|------|------|----------|----------------|-------------|
| `field` | string | Yes | `title`, `createdAt` | Field to sort by |
| `order` | string | Yes | `asc`, `desc` | Sort order |

### Request Examples

**cURL - Sort by Title A-Z:**
```bash
curl "http://localhost:5004/api/notes/sort?field=title&order=asc"
```

**cURL - Sort by Date Newest First:**
```bash
curl "http://localhost:5004/api/notes/sort?field=createdAt&order=desc"
```

**Fetch:**
```javascript
fetch('http://localhost:5004/api/notes/sort?field=title&order=asc')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response

**200 OK - Sorted Notes:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced JavaScript Patterns",
    "content": "Design patterns in JavaScript...",
    "category": "advanced",
    "createdAt": "2024-04-21T15:45:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Learning JavaScript",
    "content": "JavaScript is a programming language...",
    "category": "programming",
    "createdAt": "2024-04-22T10:30:00.000Z"
  }
]
```

**400 Bad Request - Invalid Field:**
```json
{ "error": "Invalid sort field" }
```

### Validation

| Rule | Status Code |
|------|-------------|
| Field not in allowed list | 400 |
| Field parameter missing | 400 |
| Order parameter invalid | 400 |
| Success | 200 |

---

## Feature 3: FILTER

### Endpoint

```
GET /api/notes/filter?startDate={date}&endDate={date}
```

### Parameters

| Name | Type | Required | Format | Description |
|------|------|----------|--------|-------------|
| `startDate` | string | Yes | `YYYY-MM-DD` | Filter start date (inclusive) |
| `endDate` | string | Yes | `YYYY-MM-DD` | Filter end date (inclusive, until 23:59:59) |

### Request Examples

**cURL - Notes from April 20 to April 22:**
```bash
curl "http://localhost:5004/api/notes/filter?startDate=2024-04-20&endDate=2024-04-22"
```

**Fetch:**
```javascript
fetch('http://localhost:5004/api/notes/filter?startDate=2024-04-20&endDate=2024-04-22')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response

**200 OK - Filtered Notes:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Learning JavaScript",
    "content": "JavaScript is a programming language...",
    "category": "programming",
    "createdAt": "2024-04-22T10:30:00.000Z"
  }
]
```

**400 Bad Request - Missing Dates:**
```json
{ "error": "Start date and end date required" }
```

**400 Bad Request - Invalid Date Format:**
```json
{ "error": "Invalid date format" }
```

**400 Bad Request - Start After End:**
```json
{ "error": "Start date must be before end date" }
```

### Validation

| Rule | Status Code |
|------|-------------|
| Either date is missing | 400 |
| Date format is invalid (not YYYY-MM-DD) | 400 |
| Start date is after end date | 400 |
| Success | 200 |

---

## Feature 4: CREATE

### Endpoint

```
POST /api/notes
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Note title (trimmed) |
| `content` | string | Yes | Note content (trimmed) |
| `category` | string | No | Note category (defaults to empty string) |

### Request Examples

**cURL:**
```bash
curl -X POST "http://localhost:5004/api/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Note",
    "content": "This is the content of my note",
    "category": "personal"
  }'
```

**Fetch:**
```javascript
fetch('http://localhost:5004/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My New Note',
    content: 'This is the content of my note',
    category: 'personal'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response

**201 Created - Note Created Successfully:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "My New Note",
  "content": "This is the content of my note",
  "category": "personal",
  "createdAt": "2024-04-22T12:00:00.000Z"
}
```

**400 Bad Request - Missing Title/Content:**
```json
{ "error": "Title and content are required" }
```

**400 Bad Request - Title/Content Empty:**
```json
{ "error": "Title and content are required" }
```

### Validation

| Rule | Status Code |
|------|-------------|
| Title or content missing | 400 |
| Title or content is empty/whitespace | 400 |
| Success | 201 |

---

## Feature 5: UPDATE

### Endpoint

```
PUT /api/notes/{id}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the note |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Updated note title (trimmed) |
| `content` | string | Yes | Updated note content (trimmed) |
| `category` | string | No | Updated note category |

### Request Examples

**cURL:**
```bash
curl -X PUT "http://localhost:5004/api/notes/507f1f77bcf86cd799439013" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Note Title",
    "content": "This is the updated content",
    "category": "work"
  }'
```

**Fetch:**
```javascript
fetch('http://localhost:5004/api/notes/507f1f77bcf86cd799439013', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Note Title',
    content: 'This is the updated content',
    category: 'work'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response

**200 OK - Note Updated:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Updated Note Title",
  "content": "This is the updated content",
  "category": "work",
  "createdAt": "2024-04-22T12:00:00.000Z"
}
```

**400 Bad Request - Missing Title/Content:**
```json
{ "error": "Title and content are required" }
```

**404 Not Found - Note Doesn't Exist:**
```json
{ "error": "Note not found" }
```

### Validation

| Rule | Status Code |
|------|-------------|
| Title or content missing/empty | 400 |
| Note ID doesn't exist | 404 |
| Success | 200 |

---

## Feature 6: DELETE

### Endpoint

```
DELETE /api/notes/{id}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the note |

### Request Examples

**cURL:**
```bash
curl -X DELETE "http://localhost:5004/api/notes/507f1f77bcf86cd799439013"
```

**Fetch:**
```javascript
fetch('http://localhost:5004/api/notes/507f1f77bcf86cd799439013', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response

**200 OK - Note Deleted:**
```json
{ "message": "Note deleted" }
```

**404 Not Found - Note Doesn't Exist:**
```json
{ "error": "Note not found" }
```

### Validation

| Rule | Status Code |
|------|-------------|
| Note ID doesn't exist | 404 |
| Success | 200 |

---

## Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST |
| **400** | Bad Request | Validation error (missing fields, invalid format) |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Database or server error |

---

## Response Examples

### Error Response Structure

All errors follow this pattern:

```json
{ "error": "Specific error message" }
```

### Note Object Structure

All successful responses return note objects:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Note Title",
  "content": "Note content here",
  "category": "category_name",
  "createdAt": "2024-04-22T10:30:00.000Z"
}
```

### Array Response

Search, sort, and filter return arrays:

```json
[
  { "_id": "...", "title": "...", "content": "...", "category": "...", "createdAt": "..." },
  { "_id": "...", "title": "...", "content": "...", "category": "...", "createdAt": "..." }
]
```

---

## Testing Checklist

### Setup

- [ ] MongoDB is running on `mongodb://127.0.0.1:27017`
- [ ] Backend server running on `http://localhost:5004`
- [ ] Sample data seeded (check MongoDB for notes)

### Feature 1: SEARCH

- [ ] Search with valid query returns matching notes
- [ ] Search with empty query returns 400 error
- [ ] Search is case-insensitive
- [ ] Search matches substring anywhere in title
- [ ] Response is valid array

### Feature 2: SORT

- [ ] Sort by title A-Z returns notes in correct order
- [ ] Sort by title Z-A returns notes in correct order
- [ ] Sort by date newest first works
- [ ] Sort by date oldest first works
- [ ] Invalid field returns 400 error
- [ ] Response is valid array

### Feature 3: FILTER

- [ ] Filter with valid date range returns notes in that range
- [ ] Filter with missing start date returns 400 error
- [ ] Filter with missing end date returns 400 error
- [ ] Filter with invalid date format returns 400 error
- [ ] Filter with start > end returns 400 error
- [ ] Filter includes notes from entire end date (up to 23:59:59)
- [ ] Response is valid array

### Feature 4: CREATE

- [ ] Create with valid title and content creates note and returns 201
- [ ] Created note has correct title, content, category
- [ ] Created note has auto-generated `_id` and `createdAt`
- [ ] Create without title returns 400 error
- [ ] Create without content returns 400 error
- [ ] Create with empty title returns 400 error
- [ ] Create with empty content returns 400 error
- [ ] Category defaults to empty string if not provided

### Feature 5: UPDATE

- [ ] Update with valid title and content updates note and returns 200
- [ ] Updated note has correct new title, content, category
- [ ] Updated note keeps same `_id` and `createdAt`
- [ ] Update without title returns 400 error
- [ ] Update without content returns 400 error
- [ ] Update with empty title returns 400 error
- [ ] Update with empty content returns 400 error
- [ ] Update non-existent note returns 404 error

### Feature 6: DELETE

- [ ] Delete existing note returns 200 and success message
- [ ] Deleted note is no longer in database
- [ ] Delete non-existent note returns 404 error
- [ ] Confirm dialog appears before delete

### Integration

- [ ] All features work together (create, search, sort, filter, update, delete)
- [ ] Errors are displayed correctly on frontend
- [ ] Loading state works during API calls
- [ ] Forms stay open on error, close on success

---

## Quick cURL Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:5004/api/notes"

echo "Testing GET all notes..."
curl -s "$BASE_URL" | jq '.'

echo -e "\n\nTesting SEARCH..."
curl -s "$BASE_URL/search?q=javascript" | jq '.'

echo -e "\n\nTesting SORT by title..."
curl -s "$BASE_URL/sort?field=title&order=asc" | jq '.'

echo -e "\n\nTesting FILTER by date..."
curl -s "$BASE_URL/filter?startDate=2024-04-20&endDate=2024-04-23" | jq '.'

echo -e "\n\nTesting CREATE..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"Test content","category":"test"}' | jq '.'

echo -e "\n\nTesting UPDATE..."
NOTE_ID=$(curl -s "$BASE_URL" | jq -r '.[0]._id')
curl -s -X PUT "$BASE_URL/$NOTE_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","content":"Updated content","category":"updated"}' | jq '.'

echo -e "\n\nTesting DELETE..."
curl -s -X DELETE "$BASE_URL/$NOTE_ID" | jq '.'
```

Save as `test-api.sh`, then run:
```bash
chmod +x test-api.sh
./test-api.sh
```


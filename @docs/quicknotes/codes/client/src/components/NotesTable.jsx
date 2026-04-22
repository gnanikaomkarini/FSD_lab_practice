import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function NotesTable({
  notes,
  editId,
  editForm,
  onEditChange,
  onUpdateClick,
  onCancelEdit,
  onRowClick,
  onDelete,
}) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="notes table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Content</strong></TableCell>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell><strong>Created At</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No notes found.
              </TableCell>
            </TableRow>
          ) : (
            notes.map((note) => {
              const isEditing = editId === note._id;

              return isEditing ? (
                // EDIT MODE - inline form
                <TableRow key={note._id} sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <TextField
                      value={editForm.title}
                      onChange={(e) =>
                        onEditChange({ ...editForm, title: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editForm.content}
                      onChange={(e) =>
                        onEditChange({ ...editForm, content: e.target.value })
                      }
                      size="small"
                      multiline
                      rows={2}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editForm.category}
                      onChange={(e) =>
                        onEditChange({ ...editForm, category: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={onUpdateClick}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={onCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                // VIEW MODE - clickable row
                <TableRow
                  key={note._id}
                  onClick={() => onRowClick(note)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f9f9f9' }
                  }}
                >
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.content}</TableCell>
                  <TableCell>{note.category}</TableCell>
                  <TableCell>
                    {new Date(note.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note._id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default NotesTable;

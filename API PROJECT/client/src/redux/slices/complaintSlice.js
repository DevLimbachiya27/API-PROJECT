import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/complaints', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

export const fetchComplaint = createAsyncThunk(
  'complaints/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaint');
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit complaint');
    }
  }
);

export const assignComplaint = createAsyncThunk(
  'complaints/assign',
  async ({ id, assignedTo }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/complaints/${id}/assign`, { assignedTo });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign complaint');
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/complaints/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const addComment = createAsyncThunk(
  'complaints/addComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/complaints/${id}/comments`, { text });
      return { id, comments: response.data.comments };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    complaints: [],
    currentComplaint: null,
    loading: false,
    error: null
  },
  reducers: {
    clearComplaintError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload.complaints;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchComplaint.fulfilled, (state, action) => {
        state.currentComplaint = action.payload.complaint;
        state.loading = false;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.complaints.unshift(action.payload.complaint);
      })
      .addCase(assignComplaint.fulfilled, (state, action) => {
        const idx = state.complaints.findIndex(c => c._id === action.payload.complaint._id);
        if (idx !== -1) state.complaints[idx] = action.payload.complaint;
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const idx = state.complaints.findIndex(c => c._id === action.payload.complaint._id);
        if (idx !== -1) state.complaints[idx] = action.payload.complaint;
        if (state.currentComplaint?._id === action.payload.complaint._id) {
          state.currentComplaint = action.payload.complaint;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentComplaint?._id === action.payload.id) {
          state.currentComplaint.comments = action.payload.comments;
        }
      });
  }
});

export const { clearComplaintError } = complaintSlice.actions;
export default complaintSlice.reducer;

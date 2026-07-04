import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchVisitors = createAsyncThunk(
  'visitors/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/visitors', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visitors');
    }
  }
);

export const fetchMyVisitors = createAsyncThunk(
  'visitors/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/visitors/myvisitors');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visitors');
    }
  }
);

export const registerVisitor = createAsyncThunk(
  'visitors/register',
  async (visitorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/visitors', visitorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register visitor');
    }
  }
);

export const approveVisitor = createAsyncThunk(
  'visitors/approve',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/visitors/${id}/approve`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update visitor');
    }
  }
);

export const recordVisitorExit = createAsyncThunk(
  'visitors/exit',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/visitors/${id}/exit`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record exit');
    }
  }
);

const visitorSlice = createSlice({
  name: 'visitors',
  initialState: {
    visitors: [],
    loading: false,
    error: null
  },
  reducers: {
    clearVisitorError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.loading = false;
        state.visitors = action.payload.visitors;
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyVisitors.fulfilled, (state, action) => {
        state.visitors = action.payload.visitors;
        state.loading = false;
      })
      .addCase(registerVisitor.fulfilled, (state, action) => {
        state.visitors.unshift(action.payload.visitor);
      })
      .addCase(approveVisitor.fulfilled, (state, action) => {
        const idx = state.visitors.findIndex(v => v._id === action.payload.visitor._id);
        if (idx !== -1) state.visitors[idx] = action.payload.visitor;
      })
      .addCase(recordVisitorExit.fulfilled, (state, action) => {
        const idx = state.visitors.findIndex(v => v._id === action.payload.visitor._id);
        if (idx !== -1) state.visitors[idx] = action.payload.visitor;
      });
  }
});

export const { clearVisitorError } = visitorSlice.actions;
export default visitorSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotices = createAsyncThunk(
  'notices/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/notices', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notices');
    }
  }
);

export const createNotice = createAsyncThunk(
  'notices/create',
  async (noticeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/notices', noticeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notice');
    }
  }
);

export const deleteNotice = createAsyncThunk(
  'notices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notices/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notice');
    }
  }
);

const noticeSlice = createSlice({
  name: 'notices',
  initialState: {
    notices: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = action.payload.notices;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNotice.fulfilled, (state, action) => {
        state.notices.unshift(action.payload.notice);
      })
      .addCase(deleteNotice.fulfilled, (state, action) => {
        state.notices = state.notices.filter(n => n._id !== action.payload);
      });
  }
});

export default noticeSlice.reducer;

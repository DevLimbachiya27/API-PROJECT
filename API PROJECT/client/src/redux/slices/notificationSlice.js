import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/readall');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex(n => n._id === action.payload.notification._id);
        if (idx !== -1) state.notifications[idx].isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });
  }
});

export default notificationSlice.reducer;

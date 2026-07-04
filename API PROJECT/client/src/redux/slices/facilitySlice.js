import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFacilities = createAsyncThunk(
  'facilities/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch facilities');
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'facilities/checkAvailability',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities/availability', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

export const bookFacility = createAsyncThunk(
  'facilities/book',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/facilities/book', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed');
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'facilities/fetchBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities/bookings', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const approveBooking = createAsyncThunk(
  'facilities/approve',
  async ({ id, status, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/facilities/bookings/${id}/approve`, { status, remarks });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

const facilitySlice = createSlice({
  name: 'facilities',
  initialState: {
    facilities: [],
    bookings: [],
    availability: null,
    loading: false,
    error: null
  },
  reducers: {
    clearFacilityError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.facilities = action.payload.facilities;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookFacility.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload.booking);
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b._id === action.payload.booking._id);
        if (idx !== -1) state.bookings[idx] = action.payload.booking;
      });
  }
});

export const { clearFacilityError } = facilitySlice.actions;
export default facilitySlice.reducer;

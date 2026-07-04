import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBills = createAsyncThunk(
  'billing/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/billing', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bills');
    }
  }
);

export const generateBills = createAsyncThunk(
  'billing/generate',
  async (billData, { rejectWithValue }) => {
    try {
      const response = await api.post('/billing/generate', billData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate bills');
    }
  }
);

export const recordPayment = createAsyncThunk(
  'billing/pay',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/billing/${id}/pay`, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment failed');
    }
  }
);

export const fetchBillingSummary = createAsyncThunk(
  'billing/summary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/billing/summary', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    bills: [],
    summary: null,
    loading: false,
    error: null
  },
  reducers: {
    clearBillingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload.bills;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        const idx = state.bills.findIndex(b => b._id === action.payload.bill._id);
        if (idx !== -1) state.bills[idx] = action.payload.bill;
      })
      .addCase(fetchBillingSummary.fulfilled, (state, action) => {
        state.summary = action.payload.summary;
      });
  }
});

export const { clearBillingError } = billingSlice.actions;
export default billingSlice.reducer;

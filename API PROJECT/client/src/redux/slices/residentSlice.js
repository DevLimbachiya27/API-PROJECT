import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchResidents = createAsyncThunk(
  'residents/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/residents', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch residents');
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  'residents/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/residents/myprofile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const createResident = createAsyncThunk(
  'residents/create',
  async (residentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/residents', residentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create resident');
    }
  }
);

export const addFamilyMember = createAsyncThunk(
  'residents/addFamily',
  async ({ residentId, memberData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/residents/${residentId}/family`, memberData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add family member');
    }
  }
);

export const addVehicle = createAsyncThunk(
  'residents/addVehicle',
  async ({ residentId, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/residents/${residentId}/vehicles`, vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register vehicle');
    }
  }
);

const residentSlice = createSlice({
  name: 'residents',
  initialState: {
    residents: [],
    myProfile: null,
    currentResident: null,
    loading: false,
    error: null
  },
  reducers: {
    clearResidentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResidents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResidents.fulfilled, (state, action) => {
        state.loading = false;
        state.residents = action.payload.residents;
      })
      .addCase(fetchResidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload.resident;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createResident.fulfilled, (state, action) => {
        state.residents.push(action.payload.resident);
      });
  }
});

export const { clearResidentError } = residentSlice.actions;
export default residentSlice.reducer;

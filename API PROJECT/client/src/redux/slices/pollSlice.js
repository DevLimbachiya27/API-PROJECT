import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPolls = createAsyncThunk(
  'polls/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/polls', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch polls');
    }
  }
);

export const createPoll = createAsyncThunk(
  'polls/create',
  async (pollData, { rejectWithValue }) => {
    try {
      const response = await api.post('/polls', pollData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create poll');
    }
  }
);

export const castVote = createAsyncThunk(
  'polls/vote',
  async ({ id, optionIndex }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/polls/${id}/vote`, { optionIndex });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cast vote');
    }
  }
);

const pollSlice = createSlice({
  name: 'polls',
  initialState: {
    polls: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload.polls;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.polls.unshift(action.payload.poll);
      })
      .addCase(castVote.fulfilled, (state, action) => {
        const idx = state.polls.findIndex(p => p._id === action.payload.poll._id);
        if (idx !== -1) {
          state.polls[idx] = { ...action.payload.poll, hasVoted: true };
        }
      });
  }
});

export default pollSlice.reducer;

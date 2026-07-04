import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import residentReducer from './slices/residentSlice';
import visitorReducer from './slices/visitorSlice';
import complaintReducer from './slices/complaintSlice';
import billingReducer from './slices/billingSlice';
import facilityReducer from './slices/facilitySlice';
import noticeReducer from './slices/noticeSlice';
import pollReducer from './slices/pollSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    residents: residentReducer,
    visitors: visitorReducer,
    complaints: complaintReducer,
    billing: billingReducer,
    facilities: facilityReducer,
    notices: noticeReducer,
    polls: pollReducer,
    notifications: notificationReducer
  },
  devTools: import.meta.env.DEV
});

export default store;

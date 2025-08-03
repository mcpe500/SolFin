import { configureStore } from '@reduxjs/toolkit';
import sessionsReducer from './data/sessions/sessionsSlice';
import userReducer from './data/user/userSlice';
import locationsReducer from './data/locations/locationsSlice'; // Import the default export

export const store = configureStore({
  reducer: {
    sessions: sessionsReducer,
    user: userReducer,
    locations: locationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
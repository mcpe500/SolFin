import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from './user.state';
import { fetchUserProfile, loginUser, registerUser } from '../../api/backendApi';
import { getUserData, setIsLoggedInData, setHasSeenTutorialData, setUsernameData } from '../dataApi'; // Keep local storage interactions and import getUserData

const initialState: UserState = {
  isLoggedin: false,
  username: undefined,
  darkMode: false,
  hasSeenTutorial: false,
  loading: false,
};

// Async thunk for loading user data from backend
export const loadUserData = createAsyncThunk(
  'user/loadUserData',
  async (userId?: string) => { // Make userId optional
    if (userId) {
      const data = await fetchUserProfile(userId);
      return data;
    }
    // If no userId provided, attempt to get from local storage or return default state
    const data = await getUserData(); // Use the local dataApi for initial load
    return data;
  }
);

// Async thunk for user login
export const userLogin = createAsyncThunk(
  'user/login',
  async (credentials: any, { dispatch }) => {
    const { user, token } = await loginUser(credentials);
    await setIsLoggedInData(true); // Update local storage
    await setUsernameData(user.username); // Update local storage
    dispatch(userSlice.actions.setLoggedin(true)); // Update Redux state
    dispatch(userSlice.actions.setUsername(user.username)); // Update Redux state
    return user;
  }
);

// Async thunk for user registration
export const userRegister = createAsyncThunk(
  'user/register',
  async (userData: any, { dispatch }) => {
    const newUser = await registerUser(userData);
    // Optionally log in the user after registration
    // await dispatch(userLogin({ email: userData.email, password: userData.password }));
    return newUser;
  }
);

// Async thunk for logging out user
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { dispatch }) => {
    await setIsLoggedInData(false);
    await setUsernameData(undefined);
    dispatch(userSlice.actions.setLoggedin(false));
    dispatch(userSlice.actions.setUsername(undefined));
  }
);

// Async thunk for setting logged in status (primarily for local storage sync)
export const setIsLoggedIn = createAsyncThunk(
  'user/setIsLoggedIn',
  async (loggedIn: boolean) => {
    await setIsLoggedInData(loggedIn);
    return loggedIn;
  }
);

// Async thunk for setting username (primarily for local storage sync)
export const setUsername = createAsyncThunk(
  'user/setUsername',
  async (username?: string) => {
    await setUsernameData(username);
    return username;
  }
);

// Async thunk for setting has seen tutorial status (primarily for local storage sync)
export const setHasSeenTutorial = createAsyncThunk(
  'user/setHasSeenTutorial',
  async (hasSeenTutorial: boolean) => {
    await setHasSeenTutorialData(hasSeenTutorial);
    return hasSeenTutorial;
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setLoggedin: (state, action: PayloadAction<boolean>) => {
      state.isLoggedin = action.payload;
    },
    setUsername: (state, action: PayloadAction<string | undefined>) => {
      state.username = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadUserData.rejected, (state) => {
        state.loading = false;
        // Handle error if needed
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.isLoggedin = true;
        state.username = action.payload.username;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        // Optionally handle state after registration if not auto-logging in
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedin = false;
        state.username = undefined;
      })
      .addCase(setIsLoggedIn.fulfilled, (state, action) => {
        state.isLoggedin = action.payload;
      })
      .addCase(setUsername.fulfilled, (state, action) => {
        state.username = action.payload;
      })
      .addCase(setHasSeenTutorial.fulfilled, (state, action) => {
        state.hasSeenTutorial = action.payload;
      });
  },
});

export const { setDarkMode } = userSlice.actions;

export default userSlice.reducer;
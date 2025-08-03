import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Location } from '../../models/Location';
import { fetchLocations } from '../../api/backendApi'; // Import from backendApi

export interface LocationsState {
  locations: Location[];
}

const initialState: LocationsState = {
  locations: [],
};

// Async thunk for loading locations data
export const loadLocations = createAsyncThunk(
  'locations/loadLocations',
  async () => {
    const locations: Location[] = await fetchLocations(); // Use fetchLocations from backendApi
    return locations;
  }
);

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {}, // No direct reducers for now, state is managed by thunks
  extraReducers: (builder) => {
    builder
      .addCase(loadLocations.fulfilled, (state, action: PayloadAction<Location[]>) => {
        state.locations = action.payload;
      })
      .addCase(loadLocations.rejected, (state, action) => {
        console.error('Error loading locations:', action.error);
        // Set default locations if data cannot be loaded
        state.locations = [
          {
            id: 1,
            name: 'Monona Terrace Convention Center',
            lat: 43.071584,
            lng: -89.38012,
            center: true,
          },
        ];
      });
  },
});

export default locationsSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { normalize, schema } from 'normalizr';
import { fetchConfData } from '../../api/backendApi'; // Import from backendApi
import { Session, Schedule } from '../../models/Schedule';
import { Speaker } from '../../models/Speaker';
import { Location } from '../../models/Location';

// Define Normalizr schemas
const speakerSchema = new schema.Entity('speakers', {}, { idAttribute: 'id' });
const sessionSchema = new schema.Entity('sessions', {
  speakers: [speakerSchema]
}, { idAttribute: 'id' });
const locationSchema = new schema.Entity('locations', {}, { idAttribute: 'id' });

// Define the normalized state shape
interface SessionsState {
  sessions: {
    byId: { [key: string]: Session };
    allIds: string[];
  };
  speakers: {
    byId: { [key: string]: Speaker };
    allIds: string[];
  };
  locations: {
    byId: { [key: string]: Location };
    allIds: string[];
  };
  schedule: Schedule; // Schedule might remain as is or be normalized further
  favorites: string[]; // Changed to string[] to match normalized IDs
  filteredTracks: string[];
  searchText?: string;
  mapCenterId?: number;
  loading: boolean;
  allTracks: string[];
  menuEnabled: boolean;
}

const initialState: SessionsState = {
  sessions: { byId: {}, allIds: [] },
  speakers: { byId: {}, allIds: [] },
  locations: { byId: {}, allIds: [] },
  schedule: { groups: [], date: '' }, // Added missing 'date' property
  favorites: [],
  filteredTracks: [],
  searchText: '',
  mapCenterId: 0,
  loading: false,
  allTracks: [],
  menuEnabled: true,
};

// Async thunk for loading conference data
export const loadConfData = createAsyncThunk(
  'sessions/loadConfData',
  async () => {
    const data = await fetchConfData(); // Use fetchConfData from backendApi
    // Normalize the incoming data
    const normalizedData = normalize(data, {
      sessions: [sessionSchema],
      speakers: [speakerSchema],
      locations: [locationSchema]
    });
    return normalizedData.entities;
  }
);

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<string>) => {
      state.favorites.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    updateFilteredTracks: (state, action: PayloadAction<string[]>) => {
      state.filteredTracks = action.payload;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setMenuEnabled: (state, action: PayloadAction<boolean>) => {
      state.menuEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadConfData.fulfilled, (state, action) => {
        state.loading = false;
        // Populate normalized data
        if (action.payload.sessions) {
          state.sessions.byId = action.payload.sessions;
          state.sessions.allIds = Object.keys(action.payload.sessions);
        }
        if (action.payload.speakers) {
          state.speakers.byId = action.payload.speakers;
          state.speakers.allIds = Object.keys(action.payload.speakers);
        }
        if (action.payload.locations) {
          state.locations.byId = action.payload.locations;
          state.locations.allIds = Object.keys(action.payload.locations);
        }
        // Assuming schedule is part of data, but not normalized in this step
        // state.schedule = action.payload.schedule; 
      })
      .addCase(loadConfData.rejected, (state, action) => {
        state.loading = false;
        console.error('Failed to load conference data:', action.error);
      });
  },
});

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store'; // Import RootState

export const { addFavorite, removeFavorite, updateFilteredTracks, setSearchText, setMenuEnabled } = sessionsSlice.actions;

export default sessionsSlice.reducer;

// Selectors
const selectSessionsState = (state: RootState) => state.sessions;

export const getAllSessions = createSelector(
  selectSessionsState,
  (sessionsState) => sessionsState.sessions.allIds.map(id => sessionsState.sessions.byId[id])
);

export const getSpeakers = createSelector(
  selectSessionsState,
  (sessionsState) => sessionsState.speakers.allIds.map(id => sessionsState.speakers.byId[id])
);

export const getLocations = createSelector(
  selectSessionsState,
  (sessionsState) => sessionsState.locations.allIds.map(id => sessionsState.locations.byId[id])
);

export const getFilteredSessions = createSelector(
  [getAllSessions, selectSessionsState],
  (allSessions, sessionsState) => {
    const { filteredTracks, searchText } = sessionsState;
    const lowerCaseSearchText = searchText ? searchText.toLowerCase() : '';

    return allSessions.filter(session => {
      const matchesTracks = filteredTracks.length === 0 || session.tracks.some(track => filteredTracks.includes(track));
      const matchesSearch = lowerCaseSearchText === '' ||
        session.name.toLowerCase().includes(lowerCaseSearchText) ||
        session.speakerNames.some(name => name.toLowerCase().includes(lowerCaseSearchText)) ||
        session.location.toLowerCase().includes(lowerCaseSearchText);
      return matchesTracks && matchesSearch;
    });
  }
);

export const getGroupedSchedule = createSelector(
  [getFilteredSessions],
  (sessions) => {
    const groups: Schedule['groups'] = [];
    const sortedSessions = [...sessions].sort((a, b) => {
      if (a.timeStart > b.timeStart) return 1;
      if (a.timeStart < b.timeStart) return -1;
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });

    sortedSessions.forEach(session => {
      const time = session.timeStart; // Assuming timeStart is unique for grouping
      let group = groups.find(g => g.time === time);
      if (!group) {
        group = { time, sessions: [] };
        groups.push(group);
      }
      group.sessions.push(session);
    });
    return { date: '', groups }; // Dummy date for now, as it's not in normalized sessions
  }
);

export const getGroupedFavorites = createSelector(
  [getAllSessions, selectSessionsState],
  (allSessions, sessionsState) => {
    const favoriteSessionIds = sessionsState.favorites;
    const favoriteSessions = allSessions.filter(session => favoriteSessionIds.includes(session.id.toString()));
    
    const groups: Schedule['groups'] = [];
    const sortedFavoriteSessions = [...favoriteSessions].sort((a, b) => {
      if (a.timeStart > b.timeStart) return 1;
      if (a.timeStart < b.timeStart) return -1;
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });

    sortedFavoriteSessions.forEach(session => {
      const time = session.timeStart;
      let group = groups.find(g => g.time === time);
      if (!group) {
        group = { time, sessions: [] };
        groups.push(group);
      }
      group.sessions.push(session);
    });
    return { date: '', groups }; // Dummy date for now
  }
);

export const getSessionById = createSelector(
  [selectSessionsState, (state: RootState, sessionId: string) => sessionId],
  (sessionsState, sessionId) => sessionsState.sessions.byId[sessionId]
);
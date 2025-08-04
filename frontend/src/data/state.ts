import { Schedule } from '../models/Schedule';
import { Speaker } from '../models/Speaker';
import { Location } from '../models/Location';

/**
 * @interface AppState
 * @description Defines the shape of the entire application state managed by Redux.
 *              This interface aggregates the state slices from different parts of the application.
 */
export interface AppState {
  /**
   * @property {object} data - Contains general application data.
   * @property {Schedule} data.schedule - The conference schedule data.
   * @property {Speaker[]} data.speakers - An array of speaker data.
   * @property {any[]} data.sessions - An array of session data.
   * @property {string[]} data.filteredTracks - An array of currently active filter tracks.
   * @property {string[]} data.favorites - An array of session IDs marked as favorites.
   * @property {string} data.searchText - The current search text applied to sessions.
   * @property {Location[]} data.locations - An array of location data.
   * @property {number} data.mapCenterId - The ID of the location to be centered on the map.
   */
  data: {
    schedule: Schedule;
    speakers: Speaker[];
    sessions: any[]; // Consider defining a more specific interface for sessions
    filteredTracks: string[];
    favorites: string[];
    searchText: string;
    locations: Location[];
    mapCenterId: number;
  };
  // Add other top-level state properties as needed, e.g., 'user', 'ui'
  user: {
    hasSeenTutorial: boolean;
    darkMode: boolean;
    isLoggedIn: boolean;
    username?: string;
    loading: boolean;
  };
}

/**
 * @constant initialState
 * @description The initial state for the Redux store, conforming to the `AppState` interface.
 */
export const initialState: AppState = {
  data: {
    schedule: { date: '', groups: [] },
    speakers: [],
    sessions: [],
    filteredTracks: [],
    favorites: [],
    searchText: '',
    locations: [],
    mapCenterId: 0,
  },
  user: {
    hasSeenTutorial: false,
    darkMode: false,
    isLoggedIn: false,
    loading: false,
  },
};

/**
 * @function reducers
 * @description This is a placeholder for combining reducers. In a full Redux setup,
 *              this would typically use `combineReducers` from Redux.
 * @param {AppState} state - The current application state.
 * @param {any} action - The dispatched action.
 * @returns {AppState} The new state after applying the action.
 * @deprecated This reducer is a placeholder; actual logic should be implemented using Redux Toolkit slices.
 */
export const reducers = (state: AppState, action: any): AppState => {
  // This is a placeholder reducer.
  // Real application logic for state updates would go here, typically managed by Redux Toolkit slices.
  // For now, it just returns the current state.
  return state;
};
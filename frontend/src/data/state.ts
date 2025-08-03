import { Schedule } from '../models/Schedule';
import { Speaker } from '../models/Speaker';
import { Location } from '../models/Location';

export interface AppState {
  data: {
    schedule: Schedule;
    speakers: Speaker[];
    sessions: any[];
    filteredTracks: string[];
    favorites: string[];
    searchText: string;
    locations: Location[];
    mapCenterId: number;
  };
}

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
};

export const reducers = (state: AppState, action: any): AppState => {
  // This is a placeholder reducer.
  // Real application logic for state updates would go here.
  // For now, it just returns the current state.
  return state;
};
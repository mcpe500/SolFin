import { createSelector } from 'reselect';
import { Schedule, Session, ScheduleGroup } from '../models/Schedule';
import { Speaker } from '../models/Speaker';
import { Location } from '../models/Location';
import { AppState } from './state';
import { convertTo24Hour } from '../utils/time'; // Import the new utility function

/**
 * @function getSchedule
 * @description Selector to get the raw schedule data from the Redux state.
 * @param {AppState} state - The Redux application state.
 * @returns {Schedule} The schedule object.
 */
const getSchedule = (state: AppState) => {
  return state.data.schedule;
};

/**
 * @function getSpeakers
 * @description Selector to get the speakers data from the Redux state.
 * @param {AppState} state - The Redux application state.
 * @returns {Speaker[]} An array of speaker objects.
 */
export const getSpeakers = (state: AppState) => state.data.speakers;

/**
 * @function getSessions
 * @description Selector to get the sessions data from the Redux state.
 * @param {AppState} state - The Redux application state.
 * @returns {any[]} An array of session objects.
 */
const getSessions = (state: AppState) => state.data.sessions;

/**
 * @function getFilteredTracks
 * @description Selector to get the currently filtered tracks from the Redux state.
 * @param {AppState} state - The Redux application state.
 * @returns {string[]} An array of track names.
 */
const getFilteredTracks = (state: AppState) => state.data.filteredTracks;

/**
 * @function getFavoriteIds
 * @description Selector to get the IDs of favorite sessions from the Redux state.
 * @param {AppState} state - The Redux application state.
 * @returns {string[]} An array of favorite session IDs.
 */
const getFavoriteIds = (state: AppState) => state.data.favorites;

/**
 * @function getSearchText
 * @description Selector to get the current search text from the Redux state.
 * @param {AppState} state - The Redux application state.
 * @returns {string} The search text string.
 */
const getSearchText = (state: AppState) => state.data.searchText;

/**
 * @function getFilteredSchedule
 * @description A memoized selector that filters the schedule based on selected tracks
 *              and sorts sessions within each group by time.
 * @param {Schedule} schedule - The raw schedule data.
 * @param {string[]} filteredTracks - An array of track names to filter the sessions by.
 * @returns {Schedule} A new Schedule object with filtered and sorted sessions.
 */
export const getFilteredSchedule = createSelector(
  getSchedule,
  getFilteredTracks,
  (schedule, filteredTracks) => {
    const groups: ScheduleGroup[] = [];

    // Sort the groups by time using the external utility function
    const sortedGroups = [...schedule.groups].sort((a, b) => {
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });

    sortedGroups.forEach((group: ScheduleGroup) => {
      const sessions: Session[] = [];
      group.sessions.forEach((session) => {
        // Filter sessions based on whether their tracks are included in filteredTracks
        if (session.tracks.some(track => filteredTracks.includes(track))) {
          sessions.push(session);
        }
      });

      if (sessions.length) {
        // Sort sessions within each group by start time using the external utility function
        const sortedSessions = sessions.sort((a, b) => {
          const timeA = convertTo24Hour(a.timeStart);
          const timeB = convertTo24Hour(b.timeStart);
          return timeA.localeCompare(timeB);
        });

        const groupToAdd: ScheduleGroup = {
          time: group.time,
          sessions: sortedSessions,
        };
        groups.push(groupToAdd);
      }
    });

    return {
      date: schedule.date,
      groups,
    } as Schedule;
  }
);

/**
 * @function getSearchedSchedule
 * @description A memoized selector that further filters the schedule based on a search text.
 * @param {Schedule} schedule - The already filtered schedule data.
 * @param {string} searchText - The text to search for within session names.
 * @returns {Schedule} A new Schedule object with sessions filtered by search text.
 */
export const getSearchedSchedule = createSelector(
  getFilteredSchedule,
  getSearchText,
  (schedule, searchText) => {
    if (!searchText) {
      return schedule; // Return original schedule if no search text
    }
    const groups: ScheduleGroup[] = [];
    schedule.groups.forEach((group: ScheduleGroup) => {
      const sessions = group.sessions.filter(
        (s: Session) => s.name.toLowerCase().includes(searchText.toLowerCase()) // Use includes for better readability
      );
      if (sessions.length) {
        const groupToAdd: ScheduleGroup = {
          time: group.time,
          sessions,
        };
        groups.push(groupToAdd);
      }
    });
    return {
      date: schedule.date,
      groups,
    } as Schedule;
  }
);

/**
 * @function getScheduleList
 * @description A memoized selector that returns the final filtered and searched schedule.
 * @param {Schedule} schedule - The schedule data after applying filters and search.
 * @returns {Schedule} The schedule object ready for display.
 */
export const getScheduleList = createSelector(
  getSearchedSchedule,
  (schedule) => schedule // Simply returns the result of the previous selector
);

/**
 * @function getGroupedFavorites
 * @description A memoized selector that filters the schedule to show only favorite sessions,
 *              grouped by time.
 * @param {Schedule} schedule - The schedule data.
 * @param {string[]} favoriteIds - An array of favorite session IDs.
 * @returns {Schedule} A new Schedule object containing only favorite sessions.
 */
export const getGroupedFavorites = createSelector(
  getScheduleList,
  getFavoriteIds,
  (schedule, favoriteIds) => {
    const groups: ScheduleGroup[] = [];
    schedule.groups.forEach((group: ScheduleGroup) => {
      const sessions = group.sessions.filter(
        (s: Session) => favoriteIds.includes(s.id.toString()) // Use includes for better readability
      );
      if (sessions.length) {
        const groupToAdd: ScheduleGroup = {
          time: group.time,
          sessions,
        };
        groups.push(groupToAdd);
      }
    });
    return {
      date: schedule.date,
      groups,
    } as Schedule;
  }
);

/**
 * @function getIdParam
 * @description Helper selector to extract the 'id' parameter from React Router props.
 * @param {AppState} _state - The Redux application state (unused but required by reselect).
 * @param {any} props - The component's props, expected to contain `match.params.id`.
 * @returns {string} The 'id' parameter from the URL.
 */
const getIdParam = (_state: AppState, props: any) => {
  return props.match.params['id'];
};

/**
 * @function getSession
 * @description A memoized selector that finds a specific session by its ID.
 * @param {any[]} sessions - An array of session objects.
 * @param {string} id - The ID of the session to find.
 * @returns {Session | undefined} The found session object or `undefined` if not found.
 */
export const getSession = createSelector(
  getSessions,
  getIdParam,
  (sessions, id) => {
    return sessions.find((s: Session) => s.id === id);
  }
);

/**
 * @function getSpeaker
 * @description A memoized selector that finds a specific speaker by their ID.
 * @param {Speaker[]} speakers - An array of speaker objects.
 * @param {string} id - The ID of the speaker to find.
 * @returns {Speaker | undefined} The found speaker object or `undefined` if not found.
 */
export const getSpeaker = createSelector(
  getSpeakers,
  getIdParam,
  (speakers, id) => speakers.find((x: Speaker) => x.id === id)
);

/**
 * @function getSpeakerSessions
 * @description A memoized selector that groups sessions by speaker name.
 * @param {any[]} sessions - An array of session objects.
 * @returns {{ [key: string]: Session[] }} An object where keys are speaker names and values are arrays of their sessions.
 */
export const getSpeakerSessions = createSelector(getSessions, (sessions) => {
  const speakerSessions: { [key: string]: Session[] } = {};

  sessions.forEach((session: Session) => {
    session.speakerNames &&
      session.speakerNames.forEach((name) => {
        if (speakerSessions[name]) {
          speakerSessions[name].push(session);
        } else {
          speakerSessions[name] = [session];
        }
      });
  });
  return speakerSessions;
});

/**
 * @function mapCenter
 * @description Selector to determine the map center coordinates based on `mapCenterId`.
 *              If `mapCenterId` is not found, returns a default map center.
 * @param {AppState} state - The Redux application state.
 * @returns {{ id: number; name: string; lat: number; lng: number; }} An object representing the map center.
 */
export const mapCenter = (state: AppState) => {
  const item = state.data.locations.find(
    (l: Location) => l.id === state.data.mapCenterId
  );
  if (item == null) {
    // Default map center if the specified ID is not found
    return {
      id: 1,
      name: 'Map Center',
      lat: 43.071584,
      lng: -89.38012,
    };
  }
  return item;
};

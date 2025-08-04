/**
 * @module time
 * @description Utility functions for time-related operations.
 */

/**
 * Converts a 12-hour time string (e.g., "10:00 AM", "2:30 PM") to a 24-hour time string (e.g., "10:00", "14:30").
 * This helper function is primarily used for consistent time comparisons and sorting.
 * @param {string} timeStr - The time string in 12-hour format (e.g., "10:00 AM", "2:30 PM").
 * @returns {string} The time string in 24-hour format (e.g., "10:00", "14:30").
 */
export const convertTo24Hour = (timeStr: string): string => {
  const [time, period] = timeStr.toLowerCase().split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
};
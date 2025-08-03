/**
 * @module logger
 * @description A simple logging utility that can be extended for analytics integration.
 */

/**
 * Logs an informational message.
 * @param {string} message - The message to log.
 * @param {any[]} optionalParams - Additional parameters to log.
 */
export const info = (message: string, ...optionalParams: any[]) => {
  console.log(`[INFO] ${message}`, ...optionalParams);
};

/**
 * Logs a warning message.
 * @param {string} message - The message to log.
 * @param {any[]} optionalParams - Additional parameters to log.
 */
export const warn = (message: string, ...optionalParams: any[]) => {
  console.warn(`[WARN] ${message}`, ...optionalParams);
};

/**
 * Logs an error message.
 * @param {string} message - The message to log.
 * @param {any[]} optionalParams - Additional parameters to log.
 */
export const error = (message: string, ...optionalParams: any[]) => {
  console.error(`[ERROR] ${message}`, ...optionalParams);
};

// You can add more log levels (e.g., debug, verbose) as needed.
// For production, you might replace console.log with calls to an analytics service.
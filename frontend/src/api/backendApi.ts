import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Axios instance configured for interacting with the backend API.
 * It automatically includes the JWT token from local storage in the Authorization header
 * for all outgoing requests.
 */
const backendApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

backendApi.interceptors.request.use(
  /**
   * Request interceptor: Automatically attaches the JWT token from local storage
   * to the Authorization header of outgoing requests.
   * @param {import('axios').AxiosRequestConfig} config - The Axios request configuration.
   * @returns {import('axios').AxiosRequestConfig} The modified request configuration.
   */
  (config) => {
    const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  /**
   * Error handler for request interceptor.
   * @param {any} error - The error object.
   * @returns {Promise<any>} A rejected Promise with the error.
   */
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * @function fetchConfData
 * @description Fetches conference data from the backend.
 * @returns {Promise<any>} A Promise that resolves with the conference data.
 * @throws {Error} If the API call fails.
 */
export const fetchConfData = async () => {
  const response = await backendApi.get('/confdata'); // Assuming a /confdata endpoint
  return response.data;
};

/**
 * @function loginUser
 * @description Authenticates a user with the backend and stores the received JWT token.
 * @param {object} credentials - User credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<{user: object, token: string}>} A Promise that resolves with the user data and JWT token.
 * @throws {Error} If the authentication fails.
 */
export const loginUser = async (credentials: any) => {
  const response = await backendApi.post('/users/login', credentials);
  const { user, token } = response.data;
  localStorage.setItem('authToken', token); // Store token in local storage
  return { user, token };
};

/**
 * @function registerUser
 * @description Registers a new user with the backend.
 * @param {object} userData - User registration data.
 * @returns {Promise<object>} A Promise that resolves with the new user data.
 * @throws {Error} If the registration fails.
 */
export const registerUser = async (userData: any) => {
  const response = await backendApi.post('/users/register', userData);
  return response.data;
};

/**
 * @function fetchUserProfile
 * @description Fetches a user's profile data from the backend.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} A Promise that resolves with the user profile data.
 * @throws {Error} If fetching the profile fails.
 */
export const fetchUserProfile = async (userId: string) => {
  const response = await backendApi.get(`/users/${userId}`);
  return response.data;
};

/**
 * @function updateUserProfile
 * @description Updates a user's profile data on the backend.
 * @param {string} userId - The ID of the user.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} A Promise that resolves with the updated user profile data.
 * @throws {Error} If updating the profile fails.
 */
export const updateUserProfile = async (userId: string, updateData: any) => {
  const response = await backendApi.put(`/users/${userId}`, updateData);
  return response.data;
};

/**
 * @function fetchUserPreferences
 * @description Fetches user preferences from the backend.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} A Promise that resolves with the user preferences data.
 * @throws {Error} If fetching preferences fails.
 */
export const fetchUserPreferences = async (userId: string) => {
  const response = await backendApi.get(`/users/${userId}/preferences`);
  return response.data;
};

/**
 * @function updateUserPreference
 * @description Updates a specific user preference on the backend.
 * @param {string} userId - The ID of the user.
 * @param {string} key - The preference key.
 * @param {any} value - The preference value.
 * @returns {Promise<object>} A Promise that resolves with the updated preference data.
 * @throws {Error} If updating the preference fails.
 */
export const updateUserPreference = async (userId: string, key: string, value: any) => {
  const response = await backendApi.put(`/users/${userId}/preferences/${key}`, { value });
  return response.data;
};

/**
 * @function fetchLocations
 * @description Fetches locations data. Currently returns static data as a placeholder.
 * @returns {Promise<any>} A Promise that resolves with the locations data.
 * @deprecated This function currently returns static data and should be replaced with a backend API call.
 */
export const fetchLocations = async () => {
  // Placeholder for now, assuming a /locations endpoint will be implemented on the backend.
  // For now, return static data.
  const response = await fetch('/assets/data/locations.json');
  return response.json();
};

/**
 * Response interceptor: Handles API errors by logging and creating custom error messages.
 * @param {import('axios').AxiosResponse} response - The Axios response object.
 * @returns {import('axios').AxiosResponse} The response object if successful.
 * @throws {Error} Throws a custom Error object with more descriptive messages based on the error type.
 */
backendApi.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  (error) => {
    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500; // Default status code for unhandled errors

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx (e.g., 4xx, 5xx)
      statusCode = error.response.status;
      // Prefer a specific error message from the backend if available
      errorMessage = error.response.data?.message || error.response.data?.error || error.message;

      console.error(`API Error Response [${statusCode}]:`, error.response.data);
      console.error('API Error Headers:', error.response.headers);

      return Promise.reject(new Error(`API Error ${statusCode}: ${errorMessage}`));

    } else if (error.request) {
      // The request was made but no response was received (e.g., network down, CORS issue)
      errorMessage = 'Network Error: No response received from the server. Please check your internet connection or server status.';
      console.error('API No Response Error:', error.request);
      return Promise.reject(new Error(errorMessage));

    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = `Request Setup Error: ${error.message}`;
      console.error('API Request Setup Error:', error.message);
      return Promise.reject(new Error(errorMessage));
    }
  }
);

export default backendApi;
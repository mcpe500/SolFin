import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const backendApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
backendApi.interceptors.request.use(
  (config: any) => { // Explicitly type config
    const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => { // Explicitly type error
    return Promise.reject(error);
  }
);

/**
 * Fetches conference data from the backend.
 * @returns {Promise<any>} The conference data.
 */
export const fetchConfData = async () => {
  const response = await backendApi.get('/confdata'); // Assuming a /confdata endpoint
  return response.data;
};

/**
 * Authenticates a user with the backend.
 * @param {object} credentials - User credentials (email, password).
 * @returns {Promise<any>} The user data and JWT token.
 */
export const loginUser = async (credentials: any) => {
  const response = await backendApi.post('/users/login', credentials);
  const { user, token } = response.data;
  localStorage.setItem('authToken', token); // Store token
  return { user, token };
};

/**
 * Registers a new user with the backend.
 * @param {object} userData - User registration data.
 * @returns {Promise<any>} The new user data.
 */
export const registerUser = async (userData: any) => {
  const response = await backendApi.post('/users/register', userData);
  return response.data;
};

/**
 * Fetches user profile data from the backend.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<any>} The user profile data.
 */
export const fetchUserProfile = async (userId: string) => {
  const response = await backendApi.get(`/users/${userId}`);
  return response.data;
};

/**
 * Updates user profile data on the backend.
 * @param {string} userId - The ID of the user.
 * @param {object} updateData - The data to update.
 * @returns {Promise<any>} The updated user profile data.
 */
export const updateUserProfile = async (userId: string, updateData: any) => {
  const response = await backendApi.put(`/users/${userId}`, updateData);
  return response.data;
};

/**
 * Fetches user preferences from the backend.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<any>} The user preferences data.
 */
export const fetchUserPreferences = async (userId: string) => {
  const response = await backendApi.get(`/users/${userId}/preferences`);
  return response.data;
};

/**
 * Updates a user preference on the backend.
 * @param {string} userId - The ID of the user.
 * @param {string} key - The preference key.
 * @param {any} value - The preference value.
 * @returns {Promise<any>} The updated preference data.
 */
export const updateUserPreference = async (userId: string, key: string, value: any) => {
  const response = await backendApi.put(`/users/${userId}/preferences/${key}`, { value });
  return response.data;
};

/**
 * Fetches locations data from the backend.
 * Currently returns static data as a placeholder.
 * @returns {Promise<any>} The locations data.
 */
export const fetchLocations = async () => {
  // Placeholder for now, assuming a /locations endpoint will be implemented on the backend.
  // For now, return static data.
  const response = await fetch('/assets/data/locations.json');
  return response.json();
};

// Add a response interceptor for error handling
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      console.error('API Error Headers:', error.response.headers);

      const message = error.response.data?.error || error.message;
      const statusCode = error.response.status;

      // You can throw a custom error here or return a rejected promise with structured error info
      return Promise.reject(new Error(`API Error ${statusCode}: ${message}`));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', error.request);
      return Promise.reject(new Error('Network Error: No response received from server.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
      return Promise.reject(new Error(`Request Error: ${error.message}`));
    }
  }
);

export default backendApi;
import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configure axios to include credentials for all requests
axios.defaults.withCredentials = true;

// Create an instance specifically for auth to ensure proper cookie handling
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to make store compatible with both React and Solid
const createCompatStore = (fn) => {
  const store = create(fn);
  // Add a Solid-compatible way to use the store
  store.use = (...args) => {
    const state = store.getState();
    return args.reduce((acc, key) => {
      acc[key] = state[key];
      return acc;
    }, {});
  };
  return store;
};

export const useAuthStore = createCompatStore((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password) => {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      set({ user: response.data.user, isAuthenticated: true });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ loading: true });
      const response = await authApi.get('/auth/me');
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        loading: false 
      });
      return response.data.user;
    } catch (error) {
      console.log('Auth check failed:', error.response?.status);
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  }
})); 
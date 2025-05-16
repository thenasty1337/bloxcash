import { createSignal, createEffect } from 'solid-js';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a proper axios instance for authentication
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error interceptor to handle unauthorized responses
authApi.interceptors.response.use(
  response => response,
  async error => {
    // If the error is due to an expired token and it's not a login/refresh request
    const isLoginOrRefresh = error.config.url.includes('/auth/login') || 
                            error.config.url.includes('/auth/refresh-token');
                            
    if (error.response?.status === 401 && !isLoginOrRefresh) {
      try {
        // Try to refresh the token
        await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { 
          withCredentials: true 
        });
        
        // If successful, retry the original request
        return authApi(error.config);
      } catch (refreshError) {
        // If refresh fails, clear auth state
        const authStore = useAuthStore;
        if (authStore) {
          authStore.logout(false); // Silent logout (no API call)
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Create auth store
const createAuthStore = () => {
  // Auth state signals
  const [user, setUser] = createSignal(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.post('/auth/login', { email, password });
      
      // Set auth state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (callApi = true) => {
    setLoading(true);
    
    try {
      // Only call the API if explicitly requested
      if (callApi) {
        await authApi.post('/auth/logout');
      }
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Logout failed.';
      console.error('Logout error:', err);
      
      // Still clear local state even if API fails
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Explicitly refresh the token - useful for maintaining auth across deployments
  const refreshToken = async () => {
    setLoading(true);
    
    try {
      // Call the refresh token endpoint
      const response = await authApi.post('/auth/refresh-token');
      
      // If we get here, the refresh was successful
      // Check authentication to get the user data
      const authResponse = await authApi.get('/auth/me');
      
      // Set auth state
      setUser(authResponse.data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: authResponse.data.user };
    } catch (err) {
      // Token refresh failed
      console.error('Token refresh failed:', err);
      // Do not update state here - let checkAuth handle that if needed
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    setLoading(true);
    
    try {
      const response = await authApi.get('/auth/me');
      
      // Set auth state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.data.user };
    } catch (err) {
      // Do not set error on checkAuth - this is expected to fail when not logged in
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.post('/auth/signup', { 
        username, 
        email, 
        password 
      });
      
      // Set auth state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    setLoading(true);
    
    try {
      await authApi.post('/auth/revoke-all');
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Logout failed.';
      console.error('Logout from all devices error:', err);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Helper function for authenticated API calls
  const authFetch = async (url, options = {}) => {
    try {
      const response = await authApi({
        url,
        ...options
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Operation failed.';
      console.error(`API call error (${url}):`, err);
      return { success: false, error: errorMessage };
    }
  };

  // Create SolidJS compatible store interface
  return {
    // State getters
    get user() { return user() },
    get isAuthenticated() { return isAuthenticated() },
    get loading() { return loading() },
    get error() { return error() },
    
    // Methods
    login,
    logout,
    register,
    checkAuth,
    refreshToken,
    logoutAll,
    authFetch,
    
    // Signal getters (for reactivity in components)
    use: () => ({
      user: user(),
      isAuthenticated: isAuthenticated(),
      loading: loading(),
      error: error()
    })
  };
};

// Create singleton instance
const useAuthStore = createAuthStore();
export default useAuthStore;
import {toast} from "solid-toast";
import {errors} from "../resources/errors";
import authStore from "../stores/authStore";
import { disconnectSocket } from "../utils/socket";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const dropdowns = []

export function createNotification(type, message, options) {
    if (type === 'success') {
        return toast.success(message, options)
    } else if (type === 'error') {
        return toast.error(message, options)
    }
    return toast(message, options)
}

export async function api(path, method, body, notification = false, headers =  { 'Content-Type': 'application/json' }) {
    try {
        const fullPath = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
        // Properly stringify body if it's an object
        const processedBody = body && typeof body === 'object' ? JSON.stringify(body) : body;
        
        let res = await fetch(fullPath, {
            method,
            headers,
            credentials: 'include',
            body: processedBody,
        })
        let data = await res.json()

        if (data.error && notification) {
            toast.error(errors[data.error] || data.error)
        } else if (data.error && data.error === 'DISABLED') {
            toast.error(errors[data.error] || data.error)
        }

        return data
    } catch (e) {
        console.log('There was an error when trying to fetch ' + path, e)
        
        // Return a more informative error object instead of just null
        return {
            error: 'NETWORK_ERROR',
            message: 'Unable to connect to server. Please check your internet connection.',
            originalError: e.message,
            path: path
        }
    }
}

export async function authedAPI(path, method, body, notification = false) {
    // Session authentication is handled automatically by the browser
    // credentials: 'include' ensures cookies are sent with the request
    // No need to set Authorization header for session-based auth
    return await api(path, method, body, notification);
}

export async function fetchUser(mutateUser) {
    let data = await api('/auth/me', 'GET', null, false);

    if (data?.user) {
        if (mutateUser) {
            mutateUser(data.user);
        }
        return data.user;
    } else {
        if (mutateUser) {
            mutateUser(null);
        }
        return null;
    }
}

export function addDropdown(setValue) {
    dropdowns.push(setValue)
}

export function closeDropdowns() {
    dropdowns.forEach(dropdown => dropdown(false))
}

export function getRandomNumber(min, max, chance) {
    const range = max - min + 1

    if (!chance)
        return Math.floor(Math.random() * range) + min;
    return Math.floor(chance.random() * range) + min;
}

export function logout() {
    // Use the auth store's logout function which handles JWT token revocation
    
    // First disconnect the socket
    disconnectSocket();
    
    // Then logout via the API
    authStore.logout().then(() => {
        console.log('Successfully logged out');
        // Reload the page to reset the UI state
        window.location.reload();
    }).catch(err => {
        console.error('Logout error:', err);
        // Force page reload even if logout API call fails
        window.location.reload();
    });
}

// Favorites API functions
export const favorites = {
  // Get user's favorite slots
  async get(limit = 50, offset = 0) {
    try {
      const response = await api(`/slots/favorites?limit=${limit}&offset=${offset}`, 'GET', null, true);
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Toggle favorite status for a slot
  async toggle(slug) {
    try {
      const response = await api(`/slots/favorites/${slug}`, 'POST', null, true);
      return response;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Check if a slot is favorited
  async check(slug) {
    try {
      const response = await api(`/slots/favorites/check/${slug}`, 'GET', null, true);
      return response;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
  }
}; 
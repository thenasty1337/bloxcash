import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

// Get server URL from environment or use default
const serverUrl = import.meta.env.VITE_SERVER_URL || '/';

// Create socket instance
const socket = io(serverUrl, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transportOptions: {
    polling: {
      extraHeaders: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  }
});

// Handle reconnection with auth check
socket.on('reconnect', () => {
  // For Solid.js compatibility, get the current state this way
  const state = useAuthStore.getState();
  if (state.isAuthenticated && state.user) {
    socket.emit('auth');
  }
});

// Function to refresh socket connection when auth state changes
export const refreshSocketConnection = () => {
  const state = useAuthStore.getState();
  if (state.isAuthenticated) {
    socket.disconnect().connect();
  }
};

export default socket; 
import { io } from 'socket.io-client';
import authStore from '../stores/authStore';

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
  // Check authentication status directly from the store
  if (authStore.isAuthenticated && authStore.user) {
    socket.emit('auth');
    console.log('Socket reconnected, sent auth request');
  }
});

// Function to refresh socket connection when auth state changes
export const refreshSocketConnection = () => {
  console.log('Refreshing socket connection');
  // Force disconnect and reconnect the socket
  socket.disconnect();
  // Use setTimeout to ensure disconnect is completed before reconnecting
  setTimeout(() => socket.connect(), 100);
  return socket;
};

// Function specifically for logout to ensure socket is properly disconnected
export const disconnectSocket = () => {
  console.log('Disconnecting socket due to logout');
  socket.disconnect();
};


export default socket; 
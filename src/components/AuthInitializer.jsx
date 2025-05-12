import { createEffect } from 'solid-js';
import { useAuthStore } from '../stores/authStore';

export function AuthInitializer() {
  // In Solid.js, we access the store directly, not through hooks
  createEffect(() => {
    // Check authentication status when the component mounts
    useAuthStore.getState().checkAuth();
  });

  // This component doesn't render anything
  return null;
} 
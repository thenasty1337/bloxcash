import { createEffect } from 'solid-js';
import authStore from '../stores/authStore';
import { useUser } from '../contexts/usercontextprovider';

export function AuthStoreSync() {
  const [user, { mutateUser }] = useUser();
  
  // Synchronize authStore state with the user context when authStore changes
  createEffect(() => {
    // Check if auth store has a user that should be synced to user context
    if (authStore.user && !user() && authStore.isAuthenticated) {
      mutateUser(authStore.user);
    }
  });

  // No visual output
  return null;
} 
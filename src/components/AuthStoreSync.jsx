import { createEffect } from 'solid-js';
import { useAuthStore } from '../stores/authStore';
import { useUser } from '../contexts/usercontextprovider';

export function AuthStoreSync() {
  const [user, { mutateUser }] = useUser();
  
  // Synchronize authStore state with the user context when authStore changes
  createEffect(() => {
    const unsubscribe = useAuthStore.subscribe(state => {
      if (state.user && !user() && state.isAuthenticated) {
        mutateUser(state.user);
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  });

  // No visual output
  return null;
} 
import { onMount, createEffect } from 'solid-js';
import authStore from '../stores/authStore';

/**
 * Component that initializes authentication state when the app loads
 * Place this component at the root of your application
 */
const AuthInitializer = (props) => {
  onMount(async () => {
    console.log('Initializing authentication state...');
    // Try to maintain auth state across page refreshes and app updates
    try {
      // First try refresh token in case the access token is expired
      await authStore.refreshToken();
      console.log('Auth initialized with token refresh');
    } catch (e) {
      console.log('Token refresh failed, falling back to checkAuth');
      // If refresh fails, try regular auth check as fallback
      try {
        await authStore.checkAuth();
        console.log('Auth initialized with checkAuth');
      } catch (err) {
        console.log('Authentication initialization failed', err);
      }
    }
  });

  // Connection recovery logic
  createEffect(() => {
    // When the app gets focus after being in background, check auth
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, checking auth state');
        await authStore.checkAuth();
      }
    };

    // After the browser reconnects to the internet, check auth
    const handleOnline = async () => {
      console.log('Browser came online, checking auth state');
      await authStore.checkAuth();
    };

    // Handle app wake up and reconnection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  });

  return props.children;
};

export default AuthInitializer;
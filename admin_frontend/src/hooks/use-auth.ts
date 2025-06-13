'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean | null;
}

export function useAuth(redirectOnUnauthenticated = true) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: null
  });
  
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base}/auth/me`, { credentials: 'include' });
        
        if (!res.ok) {
          setAuthState({
            user: null,
            loading: false,
            authenticated: false
          });
          
          if (redirectOnUnauthenticated) {
            console.log('User not authenticated, redirecting to login');
            router.replace('/auth/sign-in');
          }
          return;
        }

        const data = await res.json();
        
        if (!data.user) {
          setAuthState({
            user: null,
            loading: false,
            authenticated: false
          });
          
          if (redirectOnUnauthenticated) {
            console.log('No user data, redirecting to login');
            router.replace('/auth/sign-in');
          }
          return;
        }

        setAuthState({
          user: data.user,
          loading: false,
          authenticated: true
        });
        
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          loading: false,
          authenticated: false
        });
        
        if (redirectOnUnauthenticated) {
          toast.error('Authentication check failed');
          router.replace('/auth/sign-in');
        }
      }
    })();
  }, [base, router, redirectOnUnauthenticated]);

  const logout = async () => {
    try {
      await fetch(`${base}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      });
      
      router.replace('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const checkAuthAndRedirect = (response: Response) => {
    if (response.status === 401) {
      toast.error('Session expired. Please login again.');
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      });
      router.replace('/auth/sign-in');
      return true;
    }
    return false;
  };

  const checkAuthError = (data: any) => {
    if (data.error === "UNAUTHENTICATED") {
      toast.error('Session expired. Please login again.');
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      });
      router.replace('/auth/sign-in');
      return true;
    }
    return false;
  };

  return {
    ...authState,
    logout,
    checkAuthAndRedirect,
    checkAuthError
  };
} 
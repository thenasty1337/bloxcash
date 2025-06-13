"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Settings {
  email: string;
  email_verified: boolean;
  anonymous_mode: boolean;
}

export default function ProfileViewPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [anon, setAnon] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);

  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080';

  // Check authentication first
  useEffect(() => {
    (async () => {
      try {
        // First check if user is authenticated
        const authRes = await fetch(`${base}/auth/me`, { credentials: 'include' });
        
        if (!authRes.ok) {
          console.log('User not authenticated, redirecting to login');
          setAuthenticated(false);
          router.replace('/auth/sign-in');
          return;
        }

        const authData = await authRes.json();
        if (!authData.user) {
          console.log('No user data, redirecting to login');
          setAuthenticated(false);
          router.replace('/auth/sign-in');
          return;
        }

        setAuthenticated(true);

        // Now fetch user settings
        const settingsRes = await fetch(`${base}/user/settings`, { credentials: 'include' });
        
        if (!settingsRes.ok) {
          if (settingsRes.status === 401) {
            console.log('Settings request unauthorized, redirecting to login');
            setAuthenticated(false);
            router.replace('/auth/sign-in');
            return;
          }
          throw new Error(`Failed to fetch settings: ${settingsRes.status}`);
        }

        const settingsData = await settingsRes.json();
        
        if (settingsData.error === "UNAUTHENTICATED") {
          console.log('Settings response indicates unauthenticated, redirecting to login');
          setAuthenticated(false);
          router.replace('/auth/sign-in');
          return;
        }

        console.log('Loaded settings:', settingsData);
        setSettings(settingsData);
        setEmail(settingsData.email || '');
        setAnon(settingsData.anonymous_mode || false);
        
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile settings');
        setAuthenticated(false);
        router.replace('/auth/sign-in');
      } finally {
        setLoading(false);
      }
    })();
  }, [base, router]);

  async function updateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }
    
    setEmailLoading(true);
    
    try {
      const res = await fetch(`${base}/user/settings/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        router.replace('/auth/sign-in');
        return;
      }

      const data = await res.json();
      
      if (data.error === "UNAUTHENTICATED") {
        toast.error('Session expired. Please login again.');
        router.replace('/auth/sign-in');
        return;
      }
      
      if (res.ok) {
        toast.success('Email updated successfully');
        setSettings(prev => prev ? { ...prev, email: email.trim() } : null);
      } else {
        toast.error(data.message || 'Failed to update email');
      }
    } catch (error) {
      console.error('Email update error:', error);
      toast.error('Network error occurred');
    } finally {
      setEmailLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwords.current.trim() || !passwords.newPass.trim()) {
      toast.error('Both password fields are required');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const res = await fetch(`${base}/user/settings/password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.newPass
        })
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        router.replace('/auth/sign-in');
        return;
      }

      const data = await res.json();
      
      if (data.error === "UNAUTHENTICATED") {
        toast.error('Session expired. Please login again.');
        router.replace('/auth/sign-in');
        return;
      }
      
      if (res.ok) {
        toast.success('Password changed successfully');
        setPasswords({ current: '', newPass: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error occurred');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function toggleAnon() {
    setAnonLoading(true);
    
    try {
      const newAnonValue = !anon;
      const res = await fetch(`${base}/user/settings/anon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anon: newAnonValue })
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        router.replace('/auth/sign-in');
        return;
      }

      const data = await res.json();
      
      if (data.error === "UNAUTHENTICATED") {
        toast.error('Session expired. Please login again.');
        router.replace('/auth/sign-in');
        return;
      }
      
      if (res.ok && !data.error) {
        setAnon(newAnonValue);
        setSettings(prev => prev ? { ...prev, anonymous_mode: newAnonValue } : null);
        toast.success(`Anonymous mode ${newAnonValue ? 'enabled' : 'disabled'}`);
      } else {
        toast.error(data.message || 'Failed to update anonymous mode');
      }
    } catch (error) {
      console.error('Anonymous mode toggle error:', error);
      toast.error('Network error occurred');
    } finally {
      setAnonLoading(false);
    }
  }

  // Show loading while checking authentication
  if (loading || authenticated === null) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Loading profile settings...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!authenticated) {
    return null;
  }

  if (!settings) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">Failed to load profile settings</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Address
              </CardTitle>
              <CardDescription>
                Update your email address for account notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Current Email</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1"
                      required
                    />
                    {settings.email_verified ? (
                      <Badge variant="secondary" className="shrink-0">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="shrink-0">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  {settings.email && (
                    <p className="text-sm text-muted-foreground">
                      Current: {settings.email}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={emailLoading || email === settings.email || !email.trim()}
                >
                  {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Email
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                      placeholder="Enter your current password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.newPass}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                      placeholder="Enter your new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={passwordLoading || !passwords.current.trim() || !passwords.newPass.trim()}
                >
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and visibility preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous-mode" className="text-base">
                    Anonymous Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hide your identity from other users when enabled
                  </p>
                </div>
                <Switch
                  id="anonymous-mode"
                  checked={anon}
                  onCheckedChange={toggleAnon}
                  disabled={anonLoading}
                />
              </div>
              {anonLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Updating...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

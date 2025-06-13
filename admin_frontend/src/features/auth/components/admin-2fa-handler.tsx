'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Smartphone, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock,
  QrCode,
  Loader2,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { cn } from '@/lib/utils';

interface Admin2FAHandlerProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'setup' | 'authenticate' | 'authorized' | 'unauthorized';

export function Admin2FAHandler({ children }: Admin2FAHandlerProps) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [manualEntryKey, setManualEntryKey] = useState<string>('');
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check initial auth status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Session timer
  useEffect(() => {
    if (sessionTimeLeft > 0) {
      const timer = setInterval(() => {
        setSessionTimeLeft(prev => {
          if (prev <= 1) {
            setAuthState('authenticate');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionTimeLeft]);

  const checkAuthStatus = async () => {
    setAuthState('loading');
    
    // First check if already authorized
    try {
      const authResponse = await clientApi('/admin/auth') as any;
      
      if (authResponse.success) {
        setAuthState('authorized');
        if (authResponse.sessionTimeLeft) {
          setSessionTimeLeft(authResponse.sessionTimeLeft);
        }
        return;
      }
    } catch (authError: any) {
      // Auth check failed, continue to 2FA check
    }

    // Not authorized, check 2FA status
    try {
      const twoFAResponse = await clientApi('/admin/2fa', { 
        method: 'POST',
        body: JSON.stringify({}) // Empty body to check status
      }) as any;
      
      if (twoFAResponse.setupRequired) {
        setQrCode(twoFAResponse.secret);
        setManualEntryKey(twoFAResponse.manualEntryKey);
        setAuthState('setup');
      } else if (twoFAResponse.success) {
        setAuthState('authorized');
        if (twoFAResponse.sessionTimeLeft) {
          setSessionTimeLeft(twoFAResponse.sessionTimeLeft);
        }
      } else {
        setError('Unexpected authentication response');
        setAuthState('unauthorized');
      }
    } catch (twoFAError: any) {
      // Handle 2FA API errors - this is where TOKEN_REQUIRED should be caught
      
      // Extract the actual error message
      let errorMessage = twoFAError.message || '';
      if (twoFAError.data?.error) {
        errorMessage = twoFAError.data.error;
      }
      
      // Handle specific error cases
      if (errorMessage === 'TOKEN_REQUIRED' || errorMessage === '2FA_REQUIRED') {
        setAuthState('authenticate');
      } else if (errorMessage === 'UNAUTHORIZED') {
        setError('You do not have admin permissions');
        setAuthState('unauthorized');
      } else {
        // Check if the error data contains setup information
        const errorData = twoFAError.data;
        if (errorData?.setupRequired) {
          setQrCode(errorData.secret);
          setManualEntryKey(errorData.manualEntryKey);
          setAuthState('setup');
        } else {
          setError(`Authentication failed: ${errorMessage || 'Unknown error'}`);
          setAuthState('unauthorized');
        }
      }
    }
  };

  const handleTokenChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newToken = [...token];
    newToken[index] = value.slice(-1);
    setToken(newToken);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    const fullToken = newToken.join('');
    if (fullToken.length === 6) {
      if (authState === 'setup') {
        handleSetupComplete(fullToken);
      } else {
        handleAuthenticate(fullToken);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !token[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSetupComplete = async (authToken: string) => {
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await clientApi('/admin/2fa', {
        method: 'POST',
        body: JSON.stringify({ token: authToken })
      }) as any;

      if (response.success) {
        setAuthState('authorized');
        if (response.sessionTimeLeft) {
          setSessionTimeLeft(response.sessionTimeLeft);
        }
      } else {
        setError(response.error === 'INVALID_SETUP_TOKEN' 
          ? 'Invalid verification code. Please try again.' 
          : 'Setup failed. Please try again.');
        setToken(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      
      // Handle specific error messages
      if (error.message?.includes('INVALID_SETUP_TOKEN')) {
        setError('Invalid verification code. Please try again.');
      } else if (error.message?.includes('SETUP_SESSION_EXPIRED')) {
        setError('Setup session expired. Please refresh the page and try again.');
      } else {
        setError('Setup failed. Please try again.');
      }
      
      setToken(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAuthenticate = async (authToken: string) => {
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await clientApi('/admin/2fa', {
        method: 'POST',
        body: JSON.stringify({ token: authToken })
      }) as any;

      if (response.success) {
        setAuthState('authorized');
        if (response.sessionTimeLeft) {
          setSessionTimeLeft(response.sessionTimeLeft);
        }
      } else {
        setError(response.error === 'INVALID_TOKEN' 
          ? 'Invalid authentication code. Please try again.' 
          : 'Authentication failed. Please try again.');
        setToken(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      
      // Handle specific error messages
      if (error.message?.includes('INVALID_TOKEN')) {
        setError('Invalid authentication code. Please try again.');
      } else if (error.message?.includes('TOKEN_REQUIRED')) {
        setError('Authentication code is required.');
      } else if (error.message?.includes('SESSION_EXPIRED')) {
        setError('Session expired. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      
      setToken(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAndRetry = () => {
    setToken(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  // Show loading state
  if (authState === 'loading') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Checking Authentication</CardTitle>
              <CardDescription>Please wait while we verify your access...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (authState === 'unauthorized') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                {error || 'You do not have permission to access this area.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={checkAuthStatus}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show 2FA setup state
  if (authState === 'setup') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Set Up Two-Factor Authentication</CardTitle>
              <CardDescription>
                Secure your admin access with 2FA using Google Authenticator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <Label className="text-sm font-medium">Scan QR Code</Label>
                <div className="mt-2 inline-block rounded-lg border-2 border-muted p-4">
                  <img 
                    src={qrCode} 
                    alt="2FA QR Code" 
                    className="h-48 w-48"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Open your authenticator app and scan this code
                </p>
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <Label htmlFor="manual-key" className="text-sm font-medium">
                  Or enter manually
                </Label>
                <div className="flex">
                  <Input
                    id="manual-key"
                    value={manualEntryKey}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => copyToClipboard(manualEntryKey)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Enter verification code</Label>
                
                <div className="flex justify-center gap-2">
                  {token.map((digit, index) => (
                    <Input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleTokenChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className="h-12 w-12 text-center text-lg font-bold"
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={resetAndRetry}
                    variant="outline"
                    disabled={isVerifying}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSetupComplete(token.join(''))}
                    disabled={token.join('').length !== 6 || isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show 2FA authentication state
  if (authState === 'authenticate') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Authentication Code</Label>
                
                <div className="flex justify-center gap-2">
                  {token.map((digit, index) => (
                    <Input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleTokenChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className="h-12 w-12 text-center text-lg font-bold"
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={resetAndRetry}
                    variant="outline"
                    disabled={isVerifying}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleAuthenticate(token.join(''))}
                    disabled={token.join('').length !== 6 || isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Authenticate'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is authorized - show the admin interface with session timer
  return (
    <div className="min-h-screen">
      {sessionTimeLeft > 0 && (
        <div className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Session expires in: <strong>{formatTime(sessionTimeLeft)}</strong></span>
            <Badge variant="secondary" className="ml-2">
              2FA Active
            </Badge>
          </div>
        </div>
      )}
      {children}
    </div>
  );
} 
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info } from "lucide-react";
import { toast } from 'sonner';

export default function SignInViewPage() {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <AdminLoginForm />
    </div>
  );
}

function AdminLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('123@protonmail.com');
  const [password, setPassword] = useState('test123');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080'}/auth/login`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );
      const data = await res.json();
      
      if (!res.ok || data.error) {
        toast.error(data.message || 'Login failed');
      } else {
        toast.success('Login successful!');
        router.push('/dashboard/overview');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      {/* Test Credentials Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Test Credentials</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Email: <Badge variant="secondary" className="text-xs">123@protonmail.com</Badge></p>
                <p>Password: <Badge variant="secondary" className="text-xs">test123</Badge></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Form */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="123@protonmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="test123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

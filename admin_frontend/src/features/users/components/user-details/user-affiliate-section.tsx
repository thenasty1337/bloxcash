'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { 
  Users, 
  DollarSign,
  TrendingUp,
  UserPlus,
  Settings,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface UserAffiliateSectionProps {
  userDetails: any;
}

export function UserAffiliateSection({ userDetails }: UserAffiliateSectionProps) {
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newEarnings, setNewEarnings] = useState('');
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isEarningsDialogOpen, setIsEarningsDialogOpen] = useState(false);

  const userId = userDetails?.user?.id;

  useEffect(() => {
    if (userId) {
      fetchAffiliateData();
    }
  }, [userId]);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      const data = await clientApi(`/admin/users/affiliates/${userId}`, { method: 'GET' });
      setAffiliateData(data);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Failed to fetch affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = async () => {
    try {
      await clientApi(`/admin/users/affiliates/${userId}/lock`, {
        method: 'POST',
        body: JSON.stringify({ lock: !affiliateData.affiliateCodeLock })
      });
      toast.success(`Affiliate code ${affiliateData.affiliateCodeLock ? 'unlocked' : 'locked'} successfully`);
      fetchAffiliateData();
    } catch (error) {
      toast.error('Failed to update affiliate code lock status');
    }
  };

  const handleClearAffiliates = async () => {
    try {
      await clientApi(`/admin/users/affiliates/${userId}/clear`, { method: 'POST' });
      toast.success('Affiliate data cleared successfully');
      fetchAffiliateData();
    } catch (error) {
      toast.error('Failed to clear affiliate data');
    }
  };

  const handleRemoveCode = async () => {
    try {
      await clientApi(`/admin/users/affiliates/${userId}/removeCode`, { method: 'POST' });
      toast.success('Affiliate code removed successfully');
      fetchAffiliateData();
    } catch (error) {
      toast.error('Failed to remove affiliate code');
    }
  };

  const handleSetCode = async () => {
    if (!newCode.trim()) {
      toast.error('Please enter a valid code');
      return;
    }
    try {
      await clientApi(`/admin/users/affiliates/${userId}/setCode`, {
        method: 'POST',
        body: JSON.stringify({ code: newCode.trim() })
      });
      toast.success('Affiliate code set successfully');
      setNewCode('');
      setIsCodeDialogOpen(false);
      fetchAffiliateData();
    } catch (error: any) {
      if (error.message.includes('CODE_ALREADY_EXISTS')) {
        toast.error('This affiliate code already exists');
      } else {
        toast.error('Failed to set affiliate code');
      }
    }
  };

  const handleSetEarnings = async () => {
    const earnings = parseFloat(newEarnings);
    if (isNaN(earnings) || earnings < 0) {
      toast.error('Please enter a valid earnings amount');
      return;
    }
    try {
      await clientApi(`/admin/users/affiliates/${userId}/earnings`, {
        method: 'POST',
        body: JSON.stringify({ earnings })
      });
      toast.success('Affiliate earnings updated successfully');
      setNewEarnings('');
      setIsEarningsDialogOpen(false);
      fetchAffiliateData();
    } catch (error) {
      toast.error('Failed to update affiliate earnings');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <div>
            <p className="text-lg font-semibold">Loading affiliate data</p>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Affiliate Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage affiliate settings and track performance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAffiliateData} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(affiliateData?.affiliatedUsersCount || 0)}</div>
            <p className="text-xs text-muted-foreground">Users referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(affiliateData?.pendingAffiliateEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">Available to claim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(affiliateData?.affiliatedUsersWageredCount || 0)}</div>
            <p className="text-xs text-muted-foreground">By referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(affiliateData?.affiliatedUsersDepositedCount || 0)}</div>
            <p className="text-xs text-muted-foreground">From referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Code Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Affiliate Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Code */}
            <div className="space-y-2">
              <Label>Current Code</Label>
              {affiliateData?.affiliateCode ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{affiliateData.affiliateCode}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(affiliateData.affiliateCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No code assigned</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={affiliateData?.affiliateCodeLock ? "destructive" : "default"}>
                  {affiliateData?.affiliateCodeLock ? (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3 mr-1" />
                      Active
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {affiliateData?.affiliateCode ? 'Change Code' : 'Set Code'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Affiliate Code</DialogTitle>
                  <DialogDescription>
                    Enter a unique affiliate code (2-20 characters, letters and numbers only).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Affiliate Code</Label>
                    <Input
                      id="code"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Enter affiliate code"
                      maxLength={20}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCodeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSetCode}>Set Code</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {affiliateData?.affiliateCode && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLockToggle}
                >
                  {affiliateData?.affiliateCodeLock ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Affiliate Code</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this user&apos;s affiliate code? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveCode}>Remove Code</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Earnings Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Earnings Management</CardTitle>
            <Dialog open={isEarningsDialogOpen} onOpenChange={setIsEarningsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Adjust Earnings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adjust Affiliate Earnings</DialogTitle>
                  <DialogDescription>
                    Set the pending affiliate earnings for this user.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="earnings">Earnings Amount ($)</Label>
                    <Input
                      id="earnings"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEarnings}
                      onChange={(e) => setNewEarnings(e.target.value)}
                      placeholder="Enter earnings amount"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEarningsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSetEarnings}>Update Earnings</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(affiliateData?.pendingAffiliateEarnings || 0)}</p>
              <p className="text-sm text-muted-foreground">Pending Earnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(affiliateData?.affiliatedUsersDepositedCount || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(affiliateData?.affiliatedUsersWithdrawedCount || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Clear All Affiliate Data</AlertTitle>
            <AlertDescription className="mt-2">
              This will permanently remove all affiliate relationships and earnings data for this user.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Affiliate Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear all affiliate data for this user? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAffiliates}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
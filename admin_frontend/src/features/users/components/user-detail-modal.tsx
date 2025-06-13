'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from './user-listing';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { 
  Loader2, 
  User as UserIcon, 
  Shield, 
  DollarSign, 
  Award,
  Ban,
  Lock,
  MessageSquareOff,
  TrendingDown,
  Crown,
  Save,
  X,
  Calendar,
  Hash,
  Mail,
  AtSign,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Gift,
  Coins,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

// Simple VisuallyHidden component for accessibility
const VisuallyHidden = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      position: 'absolute',
      border: 0,
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      wordWrap: 'normal',
    }}
    {...props}
  >
    {children}
  </span>
);

type UserDetail = User & {
  banned?: boolean;
  tipBan?: boolean;
  leaderboardBan?: boolean;
  rainBan?: boolean;
  accountLock?: boolean;
  sponsorLock?: boolean;
  maxPerTip?: number | null;
  maxTipPerUser?: number | null;
  tipAllowance?: number | null;
  rainTipAllowance?: number | null;
  cryptoAllowance?: number | null;
  mutedUntil?: string | null;
  discordId?: string;
};

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserDetailModal({ open, onOpenChange, userId }: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [originalUser, setOriginalUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const userData = await clientApi<UserDetail>(`/admin/users/${userId}`, { method: 'GET' });
      setUser(userData);
      setOriginalUser(userData);
    } catch (error) {
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !originalUser) return;
    
    // Calculate what fields have changed
    const changes: Partial<UserDetail> = {};
    
    if (user.balance !== originalUser.balance) changes.balance = user.balance;
    if (user.xp !== originalUser.xp) changes.xp = user.xp;
    if (user.banned !== originalUser.banned) changes.banned = user.banned;
    if (user.tipBan !== originalUser.tipBan) changes.tipBan = user.tipBan;
    if (user.rainBan !== originalUser.rainBan) changes.rainBan = user.rainBan;
    if (user.leaderboardBan !== originalUser.leaderboardBan) changes.leaderboardBan = user.leaderboardBan;
    if (user.accountLock !== originalUser.accountLock) changes.accountLock = user.accountLock;
    if (user.sponsorLock !== originalUser.sponsorLock) changes.sponsorLock = user.sponsorLock;
    if (user.maxPerTip !== originalUser.maxPerTip) changes.maxPerTip = user.maxPerTip;
    if (user.maxTipPerUser !== originalUser.maxTipPerUser) changes.maxTipPerUser = user.maxTipPerUser;
    if (user.tipAllowance !== originalUser.tipAllowance) changes.tipAllowance = user.tipAllowance;
    if (user.rainTipAllowance !== originalUser.rainTipAllowance) changes.rainTipAllowance = user.rainTipAllowance;
    if (user.cryptoAllowance !== originalUser.cryptoAllowance) changes.cryptoAllowance = user.cryptoAllowance;

    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }
    
    setSaving(true);
    try {
      await clientApi(`/admin/users/${userId}`, {
        method: 'POST',
        jsonBody: changes
      });
      
      setOriginalUser({ ...user });
      toast.success(`Updated ${Object.keys(changes).length} field(s) successfully`);
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!user || !originalUser) return false;
    return JSON.stringify(user) !== JSON.stringify(originalUser);
  };

  const resetChanges = () => {
    if (originalUser) {
      setUser({ ...originalUser });
    }
  };

  // Fetch user details when drawer opens
  useEffect(() => {
    if (open && !user && !loading) {
      fetchUserDetails();
    }
  }, [open, user, loading]);

  // Reset user when drawer closes
  useEffect(() => {
    if (!open) {
      setUser(null);
      setOriginalUser(null);
    }
  }, [open]);

  const getRoleConfig = (role: string | null) => {
    const configs = {
      'OWNER': { color: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white', icon: Crown },
      'ADMIN': { color: 'bg-gradient-to-r from-red-500 to-orange-500', text: 'text-white', icon: Shield },
      'DEV': { color: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-white', icon: UserIcon },
      'MOD': { color: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white', icon: Shield },
      'BOT': { color: 'bg-gradient-to-r from-yellow-500 to-orange-500', text: 'text-white', icon: Zap },
      'USER': { color: 'bg-gradient-to-r from-gray-400 to-gray-500', text: 'text-white', icon: UserIcon }
    };
    return configs[(role || 'USER') as keyof typeof configs] || configs.USER;
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

  const getStatusIcon = (banned?: boolean, accountLock?: boolean) => {
    if (banned) return <XCircle className="h-4 w-4 text-red-500" />;
    if (accountLock) return <Lock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[96vh]">
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DrawerTitle>
            {loading ? 'Loading user details' : user ? `User Details: ${user.username}` : 'User Details'}
          </DrawerTitle>
          <DrawerDescription>
            {loading ? 'Please wait while user details are loading' : 'Manage user permissions, restrictions, and account settings'}
          </DrawerDescription>
        </VisuallyHidden>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <p className="text-lg font-semibold">Loading user details</p>
                <p className="text-sm text-muted-foreground">Please wait...</p>
              </div>
            </div>
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <DrawerHeader className="border-b bg-gradient-to-r from-background to-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className={`${getRoleConfig(user.role).color} text-xl font-bold ${getRoleConfig(user.role).text}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold">{user.username}</h2>
                      {getStatusIcon(user.banned, user.accountLock)}
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Badge variant="secondary" className={`${getRoleConfig(user.role).color} ${getRoleConfig(user.role).text} border-0 text-xs`}>
                        {React.createElement(getRoleConfig(user.role).icon, { className: "mr-1 h-3 w-3" })}
                        {user.role || 'USER'}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-xs">
                        <Hash className="mr-1 h-3 w-3" />
                        {user.id}
                      </Badge>
                      {user.createdAt && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage user permissions, restrictions, and account settings
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasChanges() && (
                    <Button variant="outline" size="sm" onClick={resetChanges}>
                      <X className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={saving || !hasChanges()}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </DrawerHeader>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <div className="border-b px-6 py-2">
                  <TabsList className="grid w-full grid-cols-4 max-w-md">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                    <TabsTrigger value="limits">Limits</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 px-6 py-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Account Stats */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(user.balance)}
                          </div>
                          <p className="text-xs text-muted-foreground">Current balance</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Experience</CardTitle>
                          <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-600">
                            {formatNumber(user.xp)}
                          </div>
                          <p className="text-xs text-muted-foreground">Total XP earned</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                          {getStatusIcon(user.banned, user.accountLock)}
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {user.banned ? (
                              <span className="text-red-600">Banned</span>
                            ) : user.accountLock ? (
                              <span className="text-yellow-600">Locked</span>
                            ) : (
                              <span className="text-green-600">Active</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Current status</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Account Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserIcon className="h-5 w-5" />
                          Account Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                            <div className="font-mono bg-muted px-3 py-2 rounded-md text-sm">
                              <AtSign className="inline mr-1 h-3 w-3" />
                              {user.username}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                            <div className="font-mono bg-muted px-3 py-2 rounded-md text-sm">
                              <Hash className="inline mr-1 h-3 w-3" />
                              {user.id}
                            </div>
                          </div>

                          {user.discordId && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Discord ID</Label>
                              <div className="font-mono bg-muted px-3 py-2 rounded-md text-sm">
                                {user.discordId}
                              </div>
                            </div>
                          )}

                          {user.createdAt && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                              <div className="bg-muted px-3 py-2 rounded-md text-sm">
                                <Calendar className="inline mr-1 h-3 w-3" />
                                {format(new Date(user.createdAt), 'PPP')}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Financial Tab */}
                  <TabsContent value="financial" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Balance Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="balance">Account Balance</Label>
                            <Input
                              id="balance"
                              type="number"
                              step="0.01"
                              value={user?.balance || 0}
                              onChange={(e) => setUser(prev => ({ ...prev!, balance: parseFloat(e.target.value) || 0 }))}
                              className="font-mono"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Experience Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="xp">Total XP</Label>
                            <Input
                              id="xp"
                              type="number"
                              value={user?.xp || 0}
                              onChange={(e) => setUser(prev => ({ ...prev!, xp: parseInt(e.target.value) || 0 }))}
                              className="font-mono"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Allowances */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Coins className="h-5 w-5" />
                          Financial Allowances
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipAllowance">Tip Allowance</Label>
                            <Input
                              id="tipAllowance"
                              type="number"
                              step="0.01"
                              value={user?.tipAllowance || ''}
                              onChange={(e) => setUser(prev => ({ ...prev!, tipAllowance: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="No limit"
                              className="font-mono"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rainTipAllowance">Rain Tip Allowance</Label>
                            <Input
                              id="rainTipAllowance"
                              type="number"
                              step="0.01"
                              value={user?.rainTipAllowance || ''}
                              onChange={(e) => setUser(prev => ({ ...prev!, rainTipAllowance: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="No limit"
                              className="font-mono"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cryptoAllowance">Crypto Allowance</Label>
                            <Input
                              id="cryptoAllowance"
                              type="number"
                              step="0.01"
                              value={user?.cryptoAllowance || ''}
                              onChange={(e) => setUser(prev => ({ ...prev!, cryptoAllowance: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="No limit"
                              className="font-mono"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Restrictions Tab */}
                  <TabsContent value="restrictions" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Ban className="h-5 w-5" />
                          Account Restrictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Account Banned</Label>
                              <p className="text-sm text-muted-foreground">
                                User is completely banned from the platform
                              </p>
                            </div>
                            <Switch
                              checked={user?.banned || false}
                              onCheckedChange={(checked) => setUser(prev => ({ ...prev!, banned: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Account Locked</Label>
                              <p className="text-sm text-muted-foreground">
                                User cannot access their account
                              </p>
                            </div>
                            <Switch
                              checked={user?.accountLock || false}
                              onCheckedChange={(checked) => setUser(prev => ({ ...prev!, accountLock: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Tip Ban</Label>
                              <p className="text-sm text-muted-foreground">
                                User cannot send or receive tips
                              </p>
                            </div>
                            <Switch
                              checked={user?.tipBan || false}
                              onCheckedChange={(checked) => setUser(prev => ({ ...prev!, tipBan: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Rain Ban</Label>
                              <p className="text-sm text-muted-foreground">
                                User cannot participate in rain events
                              </p>
                            </div>
                            <Switch
                              checked={user?.rainBan || false}
                              onCheckedChange={(checked) => setUser(prev => ({ ...prev!, rainBan: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Leaderboard Ban</Label>
                              <p className="text-sm text-muted-foreground">
                                User is hidden from leaderboards
                              </p>
                            </div>
                            <Switch
                              checked={user?.leaderboardBan || false}
                              onCheckedChange={(checked) => setUser(prev => ({ ...prev!, leaderboardBan: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Sponsor Lock</Label>
                              <p className="text-sm text-muted-foreground">
                                User cannot access sponsor features
                              </p>
                            </div>
                            <Switch
                              checked={user?.sponsorLock || false}
                              onCheckedChange={(checked) => setUser(prev => ({ ...prev!, sponsorLock: checked }))}
                            />
                          </div>
                        </div>

                        {user?.mutedUntil && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <MessageSquareOff className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-900 dark:text-yellow-100">User is muted</span>
                            </div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                              Muted until: {format(new Date(user.mutedUntil), 'PPP p')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Limits Tab */}
                  <TabsContent value="limits" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Transaction Limits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="maxPerTip">Max Per Tip</Label>
                            <Input
                              id="maxPerTip"
                              type="number"
                              step="0.01"
                              value={user?.maxPerTip || ''}
                              onChange={(e) => setUser(prev => ({ ...prev!, maxPerTip: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="No limit"
                              className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">Maximum amount per single tip</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maxTipPerUser">Max Tip Per User</Label>
                            <Input
                              id="maxTipPerUser"
                              type="number"
                              step="0.01"
                              value={user?.maxTipPerUser || ''}
                              onChange={(e) => setUser(prev => ({ ...prev!, maxTipPerUser: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="No limit"
                              className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">Maximum amount to tip per user</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
              <div>
                <p className="text-lg font-semibold">User not found</p>
                <p className="text-sm text-muted-foreground">The requested user could not be loaded</p>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
} 
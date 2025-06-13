'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Loader2, 
  User as UserIcon, 
  Shield, 
  Crown,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Calendar,
  Hash,
  Mail,
  Globe,
  MoreVertical,
  Ban,
  Unlock,
  UserX,
  DollarSign,
  Settings,
  MessageSquare,
  Copy,
  ExternalLink,
  AlertCircle,
  Clock,
  TrendingUp,
  Coins
} from 'lucide-react';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/page-container';

// Import sub-components
import { UserOverviewSection } from './user-details/user-overview-section';
import { UserTransactionsSection } from './user-details/user-transactions-section';
import { UserBetsSection } from './user-details/user-bets-section';
import { UserCryptoSection } from './user-details/user-crypto-section';
import { UserSecuritySection } from './user-details/user-security-section';
import { UserAffiliateSection } from './user-details/user-affiliate-section';
import { UserActivitySection } from './user-details/user-activity-section';
import { UserAnalyticsSection } from './user-details/user-analytics-section';
import { UserDetailModal } from './user-detail-modal';

interface UserDetailsPageContentProps {
  userId: string;
  defaultTab?: string;
}

export function UserDetailsPageContent({ userId, defaultTab }: UserDetailsPageContentProps) {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const data = await clientApi(`/admin/users/${userId}/details`, { method: 'GET' });
      setUserDetails(data);
    } catch (error) {
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserDetails = async () => {
    try {
      const data = await clientApi(`/admin/users/${userId}/details`, { method: 'GET' });
      setUserDetails(data);
    } catch (error) {
      toast.error('Failed to refresh user details');
    }
  };

  const handleContactUser = async () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setActionLoading(true);
    try {
      await clientApi(`/admin/users/${userId}/contact`, {
        method: 'POST',
        body: JSON.stringify({ message: contactMessage })
      });
      toast.success('Message sent to user successfully');
      setContactMessage('');
      setContactDialogOpen(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setActionLoading(false);
    }
  };



  const handleToggleBan = async () => {
    setActionLoading(true);
    try {
      const action = userDetails.user.banned ? 'unban' : 'ban';
      await clientApi(`/admin/users/${userId}/${action}`, { method: 'POST' });
      toast.success(`User ${action}ned successfully`);
      fetchUserDetails(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${userDetails.user.banned ? 'unban' : 'ban'} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAccountLock = async () => {
    setActionLoading(true);
    try {
      const action = userDetails.user.accountLock ? 'unlock' : 'lock';
      await clientApi(`/admin/users/${userId}/account-${action}`, { method: 'POST' });
      toast.success(`Account ${action}ed successfully`);
      fetchUserDetails(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${userDetails.user.accountLock ? 'unlock' : 'lock'} account`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustBalance = async (type: 'add' | 'remove') => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    setActionLoading(true);
    try {
      await clientApi(`/admin/users/${userId}/balance`, {
        method: 'POST',
        body: JSON.stringify({ 
          amount: Number(balanceAmount),
          type: type
        })
      });
      toast.success(`Balance ${type === 'add' ? 'added' : 'removed'} successfully`);
      setBalanceAmount('');
      fetchUserDetails(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${type} balance`);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

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

  const getStatusIcon = (user: any) => {
    if (user?.banned) return <XCircle className="h-5 w-5 text-red-500" />;
    if (user?.accountLock) return <Lock className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = (user: any) => {
    if (user?.banned) return { text: 'Banned', variant: 'destructive' as const };
    if (user?.accountLock) return { text: 'Account Locked', variant: 'secondary' as const };
    return { text: 'Active', variant: 'default' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <p className="text-lg font-semibold">Loading user details</p>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetails?.user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
          <div>
            <p className="text-lg font-semibold">User not found</p>
            <p className="text-sm text-muted-foreground">The requested user could not be loaded</p>
          </div>
        </div>
      </div>
    );
  }

  const { user } = userDetails;
  const roleConfig = getRoleConfig(user.role);
  const statusConfig = getStatusText(user);

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        {/* Enhanced Header */}
        <div className="space-y-4">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center space-x-2 hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Users</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Comprehensive user information and controls</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(user.id, 'User ID')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </Button>
              
                             {/* Clean Contact User Dialog */}
               <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                 <DialogTrigger asChild>
                   <Button variant="outline" size="sm">
                     <MessageSquare className="h-4 w-4 mr-2" />
                     Contact User
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[500px]">
                   <DialogHeader>
                     <DialogTitle>Send Message to {user.username}</DialogTitle>
                     <DialogDescription>
                       Send a direct notification to this user.
                     </DialogDescription>
                   </DialogHeader>
                   
                   <div className="space-y-4 py-4">
                     <div className="space-y-2">
                       <Label htmlFor="message">Message</Label>
                       <Textarea
                         id="message"
                         placeholder="Type your message here..."
                         value={contactMessage}
                         onChange={(e) => setContactMessage(e.target.value)}
                         className="min-h-[100px] resize-none"
                         maxLength={500}
                       />
                       <div className="text-xs text-muted-foreground text-right">
                         {contactMessage.length}/500
                       </div>
                     </div>
                   </div>
                   
                   <DialogFooter>
                     <Button 
                       variant="outline"
                       onClick={() => {
                         setContactDialogOpen(false);
                         setContactMessage('');
                       }}
                     >
                       Cancel
                     </Button>
                     <Button 
                       onClick={handleContactUser}
                       disabled={actionLoading || !contactMessage.trim()}
                     >
                       {actionLoading ? (
                         <>
                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                           Sending...
                         </>
                       ) : (
                         <>
                           <MessageSquare className="h-4 w-4 mr-2" />
                           Send Message
                         </>
                       )}
                     </Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>

              {/* Manage Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Account
                    <MoreVertical className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   
                   {/* Edit User - Opens detailed modal */}
                   <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                     <Settings className="h-4 w-4 mr-2" />
                     Edit User
                   </DropdownMenuItem>
                   
                   <DropdownMenuSeparator />
                   
                   {/* Balance Adjustment */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Adjust Balance
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Adjust User Balance</DialogTitle>
                        <DialogDescription>
                                                     Add or remove funds from {user.username}&apos;s account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={balanceAmount}
                            onChange={(e) => setBalanceAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleAdjustBalance('remove')}
                          disabled={actionLoading || !balanceAmount}
                        >
                          {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Remove Funds
                        </Button>
                        <Button 
                          onClick={() => handleAdjustBalance('add')}
                          disabled={actionLoading || !balanceAmount}
                        >
                          {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Add Funds
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenuSeparator />
                  
                  {/* Account Lock/Unlock */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        {user.accountLock ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock Account
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Account
                          </>
                        )}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {user.accountLock ? 'Unlock' : 'Lock'} Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                                                     Are you sure you want to {user.accountLock ? 'unlock' : 'lock'} {user.username}&apos;s account?
                           {!user.accountLock && ' This will prevent them from accessing their account.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleAccountLock}>
                          {user.accountLock ? 'Unlock' : 'Lock'} Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Ban/Unban User */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        {user.banned ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unban User
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-2 text-red-500" />
                            Ban User
                          </>
                        )}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {user.banned ? 'Unban' : 'Ban'} User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to {user.banned ? 'unban' : 'ban'} {user.username}?
                          {!user.banned && ' This is a serious action that will permanently restrict their access.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleToggleBan}
                          className={!user.banned ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          {user.banned ? 'Unban' : 'Ban'} User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* User Profile Header Card */}
          <Card className="border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.username} />
                      ) : (
                        <AvatarFallback className={`${roleConfig.color} text-2xl font-bold ${roleConfig.text}`}>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIcon(user)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-3xl font-bold tracking-tight">{user.username}</h2>
                      <Badge variant={statusConfig.variant} className="text-xs">
                        {statusConfig.text}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-wrap">
                      <Badge variant="secondary" className={`${roleConfig.color} ${roleConfig.text} border-0 font-medium`}>
                        {React.createElement(roleConfig.icon, { className: "mr-1.5 h-3.5 w-3.5" })}
                        {user.role || 'USER'}
                      </Badge>
                      
                      <Badge variant="outline" className="font-mono text-xs">
                        <Hash className="mr-1 h-3 w-3" />
                        {user.id.slice(0, 8)}...
                      </Badge>
                      
                      {user.balance !== undefined && (
                        <Badge variant="outline" className="text-xs font-semibold">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(user.balance)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {user.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      {user.country && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{user.country}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                                 {/* Enhanced Quick Stats */}
                 <div className="hidden lg:flex flex-col items-end space-y-3">
                   {user.lastLogin && (
                     <div className="text-sm text-muted-foreground flex items-center gap-1">
                       <Clock className="h-3.5 w-3.5" />
                       Last seen {format(new Date(user.lastLogin), 'MMM dd, HH:mm')}
                     </div>
                   )}
                   
                   {/* Account Activity Indicators */}
                   <div className="flex flex-col items-end space-y-2">
                     {userDetails.totalTransactions > 0 && (
                       <Badge variant="outline" className="text-xs">
                         <TrendingUp className="h-3 w-3 mr-1" />
                         {userDetails.totalTransactions} transactions
                       </Badge>
                     )}

                     
                     {/* Show account health indicator */}
                     {!user.banned && !user.accountLock && (
                       <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                         <CheckCircle className="h-3 w-3 mr-1" />
                         Account Healthy
                       </Badge>
                     )}
                     
                   
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={defaultTab || "overview"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="bets">Betting</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <UserOverviewSection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <UserTransactionsSection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="bets" className="space-y-4">
            <UserBetsSection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <UserAnalyticsSection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4">
            <UserCryptoSection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <UserSecuritySection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="affiliate" className="space-y-4">
            <UserAffiliateSection userDetails={userDetails} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <UserActivitySection userDetails={userDetails} />
          </TabsContent>
        </Tabs>

        {/* User Detail Modal for comprehensive editing */}
        <UserDetailModal
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            // Refresh data when modal closes after potential changes
            if (!open) {
              refreshUserDetails();
            }
          }}
          userId={userId}
        />
      </div>
    </PageContainer>
  );
} 
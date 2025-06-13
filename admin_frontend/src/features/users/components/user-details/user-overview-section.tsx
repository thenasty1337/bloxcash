'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Award, 
  Users,
  Gamepad2,
  Wallet,
  Calendar,
  MapPin,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Coins,
  Activity,
  BarChart3,
  Settings
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface UserOverviewSectionProps {
  userDetails: any;
}

export function UserOverviewSection({ userDetails }: UserOverviewSectionProps) {
  const { user, statistics } = userDetails;

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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate casino-specific metrics

  const getRealNetFlow = () => {
    // Use real transaction stats if available, otherwise fall back to all transactions
    const realDeposited = statistics?.real?.realDeposited || 0;
    const realWithdrawn = statistics?.real?.realWithdrawn || 0;
    return realDeposited - realWithdrawn;
  };

  const getLifetimeValue = () => {
    const netFlow = getRealNetFlow();
    const houseWinnings = (statistics?.totalWagered || 0) - (statistics?.totalWinnings || 0);
    return netFlow + houseWinnings;
  };

  const hasRealTransactions = () => {
    return (statistics?.real?.realDepositCount || 0) > 0 || (statistics?.real?.realWithdrawCount || 0) > 0;
  };

  const hasGamblingActivity = () => {
    return (statistics?.totalBets || 0) > 0;
  };

  const getAccountAge = () => {
    if (!user.createdAt) return 'Unknown';
    return formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });
  };

  const getLastActivity = () => {
    if (!user.lastLogout) return 'Never logged out';
    return formatDistanceToNow(new Date(user.lastLogout), { addSuffix: true });
  };

  const getRiskLevel = () => {
    const netFlow = getRealNetFlow();
    const totalWagered = statistics?.totalWagered || 0;
    
    if (netFlow < -10000 || totalWagered > 100000) return { level: 'High', color: 'destructive' };
    if (netFlow < -5000 || totalWagered > 50000) return { level: 'Medium', color: 'secondary' };
    return { level: 'Low', color: 'default' };
  };

  const getPlayerTier = () => {
    const totalWagered = statistics?.totalWagered || 0;
    if (totalWagered >= 100000) return { tier: 'VIP', color: 'bg-purple-100 text-purple-800', icon: Star };
    if (totalWagered >= 50000) return { tier: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: Award };
    if (totalWagered >= 10000) return { tier: 'Silver', color: 'bg-gray-100 text-gray-800', icon: Target };
    return { tier: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: Users };
  };

  const playerTier = getPlayerTier();
  const riskLevel = getRiskLevel();
  const TierIcon = playerTier.icon;

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(user.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {hasRealTransactions() ? 'Lifetime Value' : 'House Profit'}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              hasRealTransactions() 
                ? (getLifetimeValue() >= 0 ? 'text-green-600' : 'text-red-600')
                : 'text-foreground'
            }`}>
              {hasRealTransactions() 
                ? formatCurrency(getLifetimeValue())
                : formatCurrency((statistics?.totalWagered || 0) - (statistics?.totalWinnings || 0))
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {hasRealTransactions() ? 'Net + House edge' : 'From gambling only'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics?.totalWagered || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All-time volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Player Tier</CardTitle>
            <TierIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={playerTier.color}>
                <TierIcon className="h-3 w-3 mr-1" />
                {playerTier.tier}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Based on wagering</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Real Transactions Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4" />
                <h4 className="font-semibold">Real Transactions</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                   <p className="text-sm font-medium text-muted-foreground">Deposits</p>
                   <p className="text-lg font-bold text-green-600">
                     {formatCurrency(statistics?.real?.realDeposited || 0)}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {formatNumber(statistics?.real?.realDepositCount || 0)} transactions
                   </p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-medium text-muted-foreground">Withdrawals</p>
                   <p className="text-lg font-bold text-red-600">
                     {formatCurrency(statistics?.real?.realWithdrawn || 0)}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {formatNumber(statistics?.real?.realWithdrawCount || 0)} transactions
                   </p>
                 </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Net Flow</p>
                  <p className={`text-xl font-bold ${getRealNetFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(getRealNetFlow())}
                  </p>
                  <p className="text-xs text-muted-foreground">Real deposits - withdrawals</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">House Profit</p>
                  <p className="text-xl font-bold">
                    {formatCurrency((statistics?.totalWagered || 0) - (statistics?.totalWinnings || 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">From gambling</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Gaming Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasGamblingActivity() ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Bets</p>
                    <p className="text-xl font-bold">{formatNumber(statistics?.totalBets || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Wagered</p>
                    <p className="text-xl font-bold">{formatCurrency(statistics?.totalWagered || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Average Bet</p>
                    <p className="text-xl font-bold">
                      {formatCurrency((statistics?.totalBets > 0) ? (statistics?.totalWagered || 0) / statistics.totalBets : 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Largest Bet</p>
                    <p className="text-xl font-bold">{formatCurrency(statistics?.maxBetAmount || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Winnings</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(statistics?.totalWinnings || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Net Profit/Loss</p>
                    <p className={`text-xl font-bold ${
                      ((statistics?.totalWinnings || 0) - (statistics?.totalWagered || 0)) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency((statistics?.totalWinnings || 0) - (statistics?.totalWagered || 0))}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>RTP (Return to Player)</span>
                      <span className="font-medium">
                        {statistics?.totalWagered > 0 
                          ? formatPercentage((statistics?.totalWinnings || 0) / statistics.totalWagered * 100)
                          : '0.00%'
                        }
                      </span>
                    </div>
                    <Progress 
                      value={statistics?.totalWagered > 0 
                        ? Math.min(100, (statistics?.totalWinnings || 0) / statistics.totalWagered * 100)
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>
              
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">No Gaming Activity</p>
                <p className="text-sm text-muted-foreground">This user hasn&apos;t placed any bets yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Information & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Username</span>
              <span className="font-mono font-semibold">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Role</span>
              <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'MOD' ? 'secondary' : 'outline'}>
                {user.role || 'USER'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">XP Level</span>
              <span className="font-bold">{formatNumber(user.xp)}</span>
            </div>
            {user.email && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <span className="flex items-center gap-1 text-xs">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
              </div>
            )}
            {user.robloxId && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Roblox ID</span>
                <span className="font-mono">{user.robloxId}</span>
              </div>
            )}
            {user.discordId && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Discord</span>
                <span className="font-mono">{user.discordId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Account Status</span>
              <Badge variant={user.banned ? "destructive" : user.accountLock ? "secondary" : "default"}>
                {user.banned ? (
                  <><XCircle className="h-3 w-3 mr-1" />Banned</>
                ) : user.accountLock ? (
                  <><AlertTriangle className="h-3 w-3 mr-1" />Locked</>
                ) : (
                  <><CheckCircle className="h-3 w-3 mr-1" />Active</>
                )}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
              <Badge variant={riskLevel.color as any}>
                {riskLevel.level}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Verified</span>
              <Badge variant={user.verified ? "default" : "secondary"}>
                {user.verified ? (
                  <><CheckCircle className="h-3 w-3 mr-1" />Verified</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" />Unverified</>
                )}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Privacy</span>
              <Badge variant={user.anon ? "secondary" : "outline"}>
                {user.anon ? (
                  <><EyeOff className="h-3 w-3 mr-1" />Anonymous</>
                ) : (
                  <><Eye className="h-3 w-3 mr-1" />Public</>
                )}
              </Badge>
            </div>

            {/* Restriction Badges */}
            <div className="space-y-2">
              {user.tipBan && (
                <Badge variant="destructive" className="w-full justify-center">
                  <XCircle className="h-3 w-3 mr-1" />Tip Banned
                </Badge>
              )}
              {user.rainBan && (
                <Badge variant="destructive" className="w-full justify-center">
                  <XCircle className="h-3 w-3 mr-1" />Rain Banned
                </Badge>
              )}
              {user.leaderboardBan && (
                <Badge variant="destructive" className="w-full justify-center">
                  <XCircle className="h-3 w-3 mr-1" />Leaderboard Banned
                </Badge>
              )}
              {user.sponsorLock && (
                <Badge variant="secondary" className="w-full justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />Sponsor Locked
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Account Age</span>
              <span className="text-sm">{getAccountAge()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created</span>
              <span className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">Last Activity</span>
              <span className="text-sm">{getLastActivity()}</span>
            </div>

            {user.lastLogout && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Logout</span>
                <span className="flex items-center gap-1 text-xs">
                  <Timer className="h-3 w-3" />
                  {format(new Date(user.lastLogout), 'MMM dd, HH:mm')}
                </span>
              </div>
            )}

            {user.country && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Country</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.country}
                </span>
              </div>
            )}

            {user.ip && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last IP</span>
                <span className="font-mono text-xs">{user.ip}</span>
              </div>
            )}

            {user.mutedUntil && new Date(user.mutedUntil) > new Date() && (
              <div className="pt-2 border-t">
                <Badge variant="destructive" className="w-full justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Muted until {format(new Date(user.mutedUntil), 'MMM dd, HH:mm')}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
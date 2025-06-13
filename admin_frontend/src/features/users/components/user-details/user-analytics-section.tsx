'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Award,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Dice1,
  Gamepad2,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { clientApi } from '@/lib/client-api';

interface UserAnalyticsSectionProps {
  userDetails: any;
}

interface GameAnalytics {
  gameStats: any[];
  slotStats: any[];
  favoriteGames: any[];
  recentActivity: any[];
}

export function UserAnalyticsSection({ userDetails }: UserAnalyticsSectionProps) {
  const [gameAnalytics, setGameAnalytics] = useState<GameAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch game analytics
  const fetchGameAnalytics = async () => {
    if (!userDetails.user?.id) return;
    
    setLoading(true);
    try {
      const data = await clientApi<GameAnalytics>(`/admin/users/${userDetails.user.id}/game-analytics`);
      console.log('Game analytics data:', data);
      setGameAnalytics(data);
    } catch (error) {
      console.error('Error fetching game analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics on mount
  useEffect(() => {
    if (userDetails.user?.id) {
      fetchGameAnalytics();
    }
  }, [userDetails.user?.id]);

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

  const getGameIcon = (game: string) => {
    switch (game?.toLowerCase()) {
      case 'dice':
        return <Dice1 className="h-4 w-4" />;
      case 'slot':
        return <Zap className="h-4 w-4" />;
      case 'crash':
        return <TrendingUp className="h-4 w-4" />;
      case 'roulette':
        return <Target className="h-4 w-4" />;
      case 'battle':
        return <Award className="h-4 w-4" />;
      default:
        return <Gamepad2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (!gameAnalytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">Unable to load game analytics for this user.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-semibold tracking-tight">Game Analytics</h3>
        <p className="text-muted-foreground mt-1">
          Comprehensive analysis of gaming behavior and performance
        </p>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Types</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameAnalytics.gameStats.length}</div>
            <p className="text-xs text-muted-foreground">Different games played</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slot Machines</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameAnalytics.slotStats.length}</div>
            <p className="text-xs text-muted-foreground">Unique slots played</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(gameAnalytics.gameStats.reduce((sum, game) => sum + game.bet_count, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Across all games</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {gameAnalytics.gameStats.reduce((sum, game) => sum + game.net_profit, 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              gameAnalytics.gameStats.reduce((sum, game) => sum + game.net_profit, 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(gameAnalytics.gameStats.reduce((sum, game) => sum + game.net_profit, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Most Played Games
            <Badge variant="secondary" className="ml-auto">
              Top {Math.min(6, gameAnalytics.favoriteGames.length)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {gameAnalytics.favoriteGames.slice(0, 6).map((game: any, index: number) => (
              <div key={`${game.game}-${game.display_name}-${index}`} className="p-4 rounded-lg border bg-muted/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-muted rounded-md">
                    {getGameIcon(game.game)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm truncate">{game.display_name}</h5>
                    <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Plays</p>
                    <p className="font-semibold">{formatNumber(game.play_count)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Wagered</p>
                    <p className="font-semibold">{formatCurrency(game.total_wagered)}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last played {format(new Date(game.last_played), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slot Statistics */}
      {gameAnalytics.slotStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Slot Machine Performance
              <Badge variant="secondary" className="ml-auto">
                {gameAnalytics.slotStats.length} machines
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameAnalytics.slotStats.map((slot: any, index: number) => (
                <div key={`${slot.game_name}-${index}`} className="p-4 rounded-lg border bg-muted/20">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Game Info */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      {slot.image_url && (
                        <img 
                          src={slot.image_url} 
                          alt={slot.game_name}
                          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h5 className="font-semibold text-sm truncate">{slot.game_name}</h5>
                        <p className="text-xs text-muted-foreground">{slot.provider_name}</p>
                        <Badge 
                          variant={slot.net_profit > 0 ? "default" : "outline"} 
                          className="mt-1 text-xs"
                        >
                          {slot.net_profit > 0 ? "Profitable" : "Loss"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Main Stats */}
                    <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Spins</p>
                        <p className="font-semibold">{formatNumber(slot.spins)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Wagered</p>
                        <p className="font-semibold">{formatCurrency(slot.total_wagered)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net Profit</p>
                        <p className={`font-semibold ${
                          slot.net_profit > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {slot.net_profit > 0 ? '+' : ''}{formatCurrency(slot.net_profit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                        <p className="font-semibold">{slot.win_rate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    {/* Additional Stats */}
                    <div className="lg:col-span-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Biggest Win</p>
                        <p className="font-semibold text-green-600 text-sm">{formatCurrency(slot.biggest_win)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Bet</p>
                        <p className="font-semibold text-sm">{formatCurrency(slot.avg_bet)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Grid - Performance & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Game Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Game Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {gameAnalytics.gameStats.map((game: any, index: number) => (
                  <div key={`${game.game}-${game.display_name}-${index}`} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        {getGameIcon(game.game)}
                      </div>
                      <div>
                        <h5 className="font-medium text-sm">{game.display_name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(game.bet_count)} bets • {((game.wins / game.bet_count) * 100).toFixed(1)}% win rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(game.total_wagered)}</p>
                      <p className={`text-xs font-medium ${
                        game.net_profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {game.net_profit > 0 ? '+' : ''}{formatCurrency(game.net_profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {gameAnalytics.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
                <Badge variant="secondary" className="ml-auto">
                  Last 30 days
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {gameAnalytics.recentActivity.map((activity: any, index: number) => (
                    <div key={`${activity.date}-${activity.game}-${index}`} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          {getGameIcon(activity.game)}
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{activity.display_name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.date), 'MMM dd, yyyy')} • {activity.bets} bets
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(activity.wagered)}</p>
                        <p className={`text-xs font-medium ${
                          activity.profit > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.profit > 0 ? '+' : ''}{formatCurrency(activity.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
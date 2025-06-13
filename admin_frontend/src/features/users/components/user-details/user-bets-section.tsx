'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Gamepad2, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  Award,
  Dice1,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { clientApi } from '@/lib/client-api';

interface UserBetsSectionProps {
  userDetails: any;
}

interface PaginatedBetsResponse {
  page: number;
  pages: number;
  total: number;
  data: any[];
}



export function UserBetsSection({ userDetails }: UserBetsSectionProps) {
  const { bets, statistics } = userDetails;
  const [paginatedBets, setPaginatedBets] = useState<PaginatedBetsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);


  // Fetch paginated bets
  const fetchPaginatedBets = async (page: number) => {
    if (!userDetails.user?.id) return;
    
    setLoading(true);
    try {
      const data = await clientApi<PaginatedBetsResponse>(`/admin/users/${userDetails.user.id}/bets?page=${page}`);
      setPaginatedBets(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching paginated bets:', error);
    } finally {
      setLoading(false);
    }
  };



  // Load first page on mount
  useEffect(() => {
    if (userDetails.user?.id) {
      fetchPaginatedBets(1);
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

  const getBetStatusIcon = (completed: boolean, won?: boolean) => {
    if (!completed) return <Clock className="h-4 w-4 text-yellow-500" />;
    return won ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getBetStatusBadge = (completed: boolean, won?: boolean) => {
    if (!completed) return <Badge variant="secondary">Pending</Badge>;
    return won ? (
      <Badge variant="default">Won</Badge>
    ) : (
      <Badge variant="outline">Lost</Badge>
    );
  };

  const getGameIcon = (game: string) => {
    // You could expand this to have specific icons for different games
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

  const getGameDisplayName = (bet: any) => {
    if (bet.game === 'slot' && bet.game_name) {
      return bet.game_name;
    }
    return bet.game || 'Unknown';
  };

  // Calculate additional stats
  const recentBets = bets?.slice(0, 10) || [];
  
  // Use overall statistics for win rate calculation (not just recent bets)
  // We'll get the actual win/loss counts from the game analytics API
  const [overallStats, setOverallStats] = useState<{
    totalWins: number;
    totalLosses: number;
    biggestWin: number;
  } | null>(null);

  // Calculate win rate - use overall stats if available, otherwise fallback to recent bets
  let winningBets, losingBets, biggestWin;
  
  if (overallStats) {
    // Use overall statistics from game analytics
    winningBets = overallStats.totalWins;
    losingBets = overallStats.totalLosses;
    biggestWin = overallStats.biggestWin;
  } else {
    // Fallback to calculating from recent bets until analytics load
    const betsWithProfit = bets?.map((bet: any) => ({
      ...bet,
      profit: (bet.winnings || 0) - bet.amount
    })) || [];
    
    winningBets = betsWithProfit.filter((bet: any) => bet.profit > 0).length;
    losingBets = betsWithProfit.filter((bet: any) => bet.profit < 0).length;
    biggestWin = betsWithProfit.reduce((max: number, bet: any) => 
      bet.profit > max ? bet.profit : max, 0);
  }
  
  const totalCompletedBets = winningBets + losingBets;
  const winRatePercent = totalCompletedBets > 0 ? (winningBets / totalCompletedBets * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Betting Activity</h3>
        <p className="text-sm text-muted-foreground">
          Track gambling performance and betting history
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(statistics?.totalBets || 0)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics?.totalWagered || 0)}</div>
            <p className="text-xs text-muted-foreground">Lifetime wagered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {(statistics?.totalProfit || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (statistics?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(statistics?.totalProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total profit/loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Bet</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics?.avgBetAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">Per bet</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="h-5 w-5" />
              Win Rate
              {overallStats && <Badge variant="outline" className="text-xs">Overall</Badge>}
              {!overallStats && <Badge variant="secondary" className="text-xs">Recent</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-semibold">{winRatePercent.toFixed(1)}%</span>
              </div>
              <Progress value={winRatePercent} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">{winningBets}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{losingBets}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5" />
              Best Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Biggest Win</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(biggestWin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Largest Bet</p>
              <p className="text-lg font-semibold">{formatCurrency(statistics?.maxBetAmount || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Recent Activity</p>
              <p className="text-lg font-semibold">{recentBets.length} recent bets</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statistics?.totalBets > 0 ? "default" : "secondary"}>
                {statistics?.totalBets > 0 ? "Active Player" : "No Activity"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Bets
              <Badge variant="secondary" className="ml-auto">
                Last {recentBets.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBets.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {recentBets.map((bet: any) => (
                    <div key={bet.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getGameIcon(bet.game)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getGameDisplayName(bet)}
                            </Badge>
                            {getBetStatusBadge(bet.completed, ((bet.winnings || 0) - bet.amount) > 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(bet.createdAt), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold">
                          {formatCurrency(bet.amount)}
                        </p>
                        <p className={`text-xs font-medium ${
                          ((bet.winnings || 0) - bet.amount) > 0 ? 'text-green-600' : ((bet.winnings || 0) - bet.amount) < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {((bet.winnings || 0) - bet.amount) !== 0 && (((bet.winnings || 0) - bet.amount) > 0 ? '+' : '')}{formatCurrency((bet.winnings || 0) - bet.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <Gamepad2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent bets</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Game Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bets && bets.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.entries(
                    bets.reduce((acc: any, bet: any) => {
                      const game = getGameDisplayName(bet);
                      if (!acc[game]) {
                        acc[game] = { count: 0, wagered: 0, profit: 0 };
                      }
                      acc[game].count++;
                      acc[game].wagered += bet.amount;
                      acc[game].profit += (bet.winnings || 0) - bet.amount;
                      return acc;
                    }, {})
                  ).map(([game, stats]: [string, any], index: number) => (
                    <div key={`${game}-${index}`} className="p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getGameIcon(game)}
                          <span className="font-medium">{game}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stats.count} bets
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Wagered</p>
                          <p className="font-mono font-semibold">{formatCurrency(stats.wagered)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit</p>
                          <p className={`font-mono font-semibold ${
                            stats.profit > 0 ? 'text-green-600' : stats.profit < 0 ? 'text-red-600' : 'text-muted-foreground'
                          }`}>
                            {stats.profit > 0 ? '+' : ''}{formatCurrency(stats.profit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No game data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      {/* Detailed Table for All Bets */}
      {(bets && bets.length > 0) && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Betting History</CardTitle>
                <Badge variant="secondary">
                  {paginatedBets?.total || bets?.length || 0} total bets
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Scrollable Table */}
                <ScrollArea className="h-[600px] rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Multiplier</TableHead>
                        <TableHead>Profit/Loss</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Loading bets...</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        (paginatedBets?.data || bets || []).map((bet: any) => (
                          <TableRow key={bet.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {getGameDisplayName(bet)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">
                                {formatCurrency(bet.amount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">
                                {bet.winnings && bet.amount ? `${(bet.winnings / bet.amount).toFixed(2)}x` : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`font-mono text-sm font-semibold ${
                                ((bet.winnings || 0) - bet.amount) > 0 ? 'text-green-600' : ((bet.winnings || 0) - bet.amount) < 0 ? 'text-red-600' : 'text-muted-foreground'
                              }`}>
                                {((bet.winnings || 0) - bet.amount) !== 0 && (((bet.winnings || 0) - bet.amount) > 0 ? '+' : '')}{formatCurrency((bet.winnings || 0) - bet.amount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getBetStatusIcon(bet.completed, ((bet.winnings || 0) - bet.amount) > 0)}
                                {getBetStatusBadge(bet.completed, ((bet.winnings || 0) - bet.amount) > 0)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(bet.createdAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Pagination Controls */}
                {paginatedBets && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing page {paginatedBets.page} of {paginatedBets.pages} 
                      ({paginatedBets.data.length} of {paginatedBets.total} bets)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPaginatedBets(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {/* Show page numbers */}
                        {Array.from({ length: Math.min(5, paginatedBets.pages) }, (_, i) => {
                          let pageNum;
                          if (paginatedBets.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= paginatedBets.pages - 2) {
                            pageNum = paginatedBets.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => fetchPaginatedBets(pageNum)}
                              disabled={loading}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPaginatedBets(currentPage + 1)}
                        disabled={currentPage >= paginatedBets.pages || loading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 
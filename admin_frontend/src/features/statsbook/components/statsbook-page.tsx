'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  CreditCard,
  Gift,
  Bitcoin,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StatsbookEntry {
  date: string;
  npc: number;
  giftCardDeposits: number;
  cryptoDeposits: number;
  cryptoWithdraws: number;
  creditCardDeposits: number;
  surveysRevenue: number;
  netProfit: number;
}

interface StatsbookResponse {
  page: number;
  pages: number;
  total: number;
  data: StatsbookEntry[];
}

export function StatsbookPageContent() {
  const [statsbook, setStatsbook] = useState<Record<number, StatsbookEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);

  const fetchStatsbook = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await clientApi<StatsbookResponse>(`/admin/statsbook?page=${page}`);
      
      // Update the specific page data
      setStatsbook(prev => ({
        ...prev,
        [page]: response.data
      }));
      
      setCurrentPage(response.page);
      setTotalPages(response.pages);
      setLoadedPages(prev => [...prev, page]);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to fetch statsbook data');
      }
      console.error('Error fetching statsbook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (!loadedPages.includes(page)) {
      fetchStatsbook(page);
    } else {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getAmountColor = (amount: number) => {
    if (amount === 0) return 'text-muted-foreground';
    if (amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getCurrentPageData = (): StatsbookEntry[] => {
    return statsbook[currentPage] || [];
  };

  // Calculate summary stats from current page
  const currentPageData = getCurrentPageData();
  const summaryStats = currentPageData.reduce(
    (acc, entry) => ({
      totalNPC: acc.totalNPC + entry.npc,
      totalGiftCards: acc.totalGiftCards + entry.giftCardDeposits,
      totalCrypto: acc.totalCrypto + (entry.cryptoDeposits - entry.cryptoWithdraws),
      totalCC: acc.totalCC + entry.creditCardDeposits,
      totalSurveys: acc.totalSurveys + entry.surveysRevenue,
      totalNet: acc.totalNet + entry.netProfit,
    }),
    {
      totalNPC: 0,
      totalGiftCards: 0,
      totalCrypto: 0,
      totalCC: 0,
      totalSurveys: 0,
      totalNet: 0,
    }
  );

  useEffect(() => {
    fetchStatsbook(1);
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statsbook</h1>
            <p className="text-muted-foreground">Daily financial statistics and revenue tracking</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">NPC Total</p>
                  <p className="text-lg font-bold">{summaryStats.totalNPC}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Giftcards</p>
                  <p className="text-lg font-bold">{formatCurrency(summaryStats.totalGiftCards)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                  <Bitcoin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Crypto Net</p>
                  <p className="text-lg font-bold">{formatCurrency(summaryStats.totalCrypto)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Credit Cards</p>
                  <p className="text-lg font-bold">{formatCurrency(summaryStats.totalCC)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Surveys</p>
                  <p className="text-lg font-bold">{formatCurrency(summaryStats.totalSurveys)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  summaryStats.totalNet >= 0 ? "bg-green-100" : "bg-red-100"
                )}>
                  {summaryStats.totalNet >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">Net Profit</p>
                  <p className={cn(
                    "text-lg font-bold",
                    getAmountColor(summaryStats.totalNet)
                  )}>
                    {formatCurrency(summaryStats.totalNet)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statsbook Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Daily Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading statsbook data...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="text-center">NPC</TableHead>
                      <TableHead className="text-right">Giftcards</TableHead>
                      <TableHead className="text-right">Crypto</TableHead>
                      <TableHead className="text-right">Credit Cards</TableHead>
                      <TableHead className="text-right">Surveys</TableHead>
                      <TableHead className="text-right">Net Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No data available for this page
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentPageData.map((entry, index) => (
                        <TableRow key={`${entry.date}-${index}`}>
                          <TableCell className="font-medium">
                            <Badge variant="outline">{entry.date}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">{entry.npc}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn("font-medium", getAmountColor(entry.giftCardDeposits))}>
                              {formatCurrency(entry.giftCardDeposits)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end space-y-1">
                              <span className="text-green-600 font-medium text-sm">
                                +{formatCurrency(entry.cryptoDeposits)}
                              </span>
                              <span className="text-red-600 font-medium text-sm">
                                -{formatCurrency(entry.cryptoWithdraws)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn("font-medium", getAmountColor(entry.creditCardDeposits))}>
                              {formatCurrency(entry.creditCardDeposits)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn("font-medium", getAmountColor(entry.surveysRevenue))}>
                              {formatCurrency(entry.surveysRevenue)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {entry.netProfit >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={cn("font-bold", getAmountColor(entry.netProfit))}>
                                {formatCurrency(entry.netProfit)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
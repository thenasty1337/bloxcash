'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Wallet,
  Building2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { clientApi } from '@/lib/client-api';

interface UserTransactionsSectionProps {
  userDetails: any;
}

interface TransactionData {
  page: number;
  pages: number;
  total: number;
  data: any[];
  statistics: {
    real: any;
    admin: any;
    all: any;
    methodBreakdown: any[];
  };
}

export function UserTransactionsSection({ userDetails }: UserTransactionsSectionProps) {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await clientApi(`/admin/users/${userDetails.user.id}/transactions?page=${page}`);
      setTransactionData(response as TransactionData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, userDetails.user.id]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === 'in' ? (
      <ArrowDownLeft className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-500" />
    );
  };

  const getTransactionTypeBadge = (type: string) => {
    return type === 'in' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        Deposit
      </Badge>
    ) : (
      <Badge variant="default" className="bg-red-100 text-red-800 border-red-200">
        Withdrawal
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      'crypto': 'bg-orange-100 text-orange-800 border-orange-200',
      'card': 'bg-blue-100 text-blue-800 border-blue-200',
      'admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'affiliate': 'bg-green-100 text-green-800 border-green-200',
      'bonus': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'tip': 'bg-pink-100 text-pink-800 border-pink-200',
      'rakeback': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'promo': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'rain': 'bg-teal-100 text-teal-800 border-teal-200',
      'giftcard': 'bg-rose-100 text-rose-800 border-rose-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const colorClass = methodColors[method] || methodColors.default;

    return (
      <Badge variant="outline" className={colorClass}>
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  const isAdminTransaction = (method: string) => method === 'admin';

  if (loading && !transactionData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-semibold text-muted-foreground">Failed to load transactions</p>
      </div>
    );
  }

  const { statistics } = transactionData;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="real">Real Transactions</TabsTrigger>
          <TabsTrigger value="admin">Admin Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real Transaction Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Real Deposits & Withdrawals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real Deposited</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(statistics.real?.realDeposited || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(statistics.real?.realDepositCount || 0)} deposits
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real Withdrawn</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(statistics.real?.realWithdrawn || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(statistics.real?.realWithdrawCount || 0)} withdrawals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real Net Flow</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (statistics.real?.realDeposited || 0) - (statistics.real?.realWithdrawn || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency((statistics.real?.realDeposited || 0) - (statistics.real?.realWithdrawn || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Deposits - Withdrawals</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber((statistics.real?.realDepositCount || 0) + (statistics.real?.realWithdrawCount || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Excluding admin</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Admin Transaction Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Admin Transactions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Added</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(statistics.admin?.adminDeposited || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(statistics.admin?.adminDepositCount || 0)} additions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Removed</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(statistics.admin?.adminWithdrawn || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(statistics.admin?.adminWithdrawCount || 0)} removals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Net</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (statistics.admin?.adminDeposited || 0) - (statistics.admin?.adminWithdrawn || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency((statistics.admin?.adminDeposited || 0) - (statistics.admin?.adminWithdrawn || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Admin net change</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber((statistics.admin?.adminDepositCount || 0) + (statistics.admin?.adminWithdrawCount || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Total admin actions</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Method Breakdown */}
          {statistics.methodBreakdown && statistics.methodBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transaction Methods (Real Only)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statistics.methodBreakdown.map((method: any, index: number) => (
                    <div key={`${method.method}-${method.type}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getMethodBadge(method.method)}
                        {getTransactionTypeBadge(method.type)}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(method.total_amount)}</div>
                        <div className="text-xs text-muted-foreground">{method.count} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="real" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Real Transactions
                <Badge variant="secondary" className="ml-auto">
                  {transactionData.data.filter(t => !isAdminTransaction(t.method)).length} of {transactionData.total}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Method ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionData.data
                      .filter(transaction => !isAdminTransaction(transaction.method))
                      .map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionTypeIcon(transaction.type)}
                              {getTransactionTypeBadge(transaction.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-mono font-semibold ${
                              transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'in' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getMethodBadge(transaction.method)}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">
                              {transaction.methodId || transaction.methodDisplay || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Admin Transactions
                <Badge variant="secondary" className="ml-auto">
                  {transactionData.data.filter(t => isAdminTransaction(t.method)).length} of {transactionData.total}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Method ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionData.data
                      .filter(transaction => isAdminTransaction(transaction.method))
                      .map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionTypeIcon(transaction.type)}
                              {getTransactionTypeBadge(transaction.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-mono font-semibold ${
                              transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'in' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getMethodBadge(transaction.method)}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">
                              {transaction.methodId || transaction.methodDisplay || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {transactionData.pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {transactionData.page} of {transactionData.pages} ({formatNumber(transactionData.total)} total transactions)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, transactionData.pages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(transactionData.pages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === transactionData.pages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
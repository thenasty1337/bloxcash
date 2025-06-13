'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Receipt, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  user_id: string;
  game_id?: string;
  round_id?: string;
  call_id?: string;
  action: 'balance' | 'debit' | 'credit';
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

interface TransactionsTabProps {
  transactions: Transaction[];
  loading: boolean;
}

export function TransactionsTab({ transactions, loading }: TransactionsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate statistics
  const stats = useMemo(() => {
    const debits = transactions.filter(t => t.action === 'debit');
    const credits = transactions.filter(t => t.action === 'credit');
    
    const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalCredits - totalDebits;
    
    return {
      totalTransactions: transactions.length,
      totalDebits: totalDebits / 100, // Convert cents to dollars
      totalCredits: totalCredits / 100,
      netAmount: netAmount / 100,
      debitCount: debits.length,
      creditCount: credits.length
    };
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.game_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.round_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.call_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || transaction.action === actionFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        const txDate = new Date(transaction.created_at);
        matchesDateRange = matchesDateRange && txDate >= fromDate;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        const txDate = new Date(transaction.created_at);
        matchesDateRange = matchesDateRange && txDate <= toDate;
      }
      
      return matchesSearch && matchesAction && matchesDateRange;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Transaction];
      let bValue: any = b[sortField as keyof Transaction];

      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (['amount', 'balance_before', 'balance_after'].includes(sortField)) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, actionFilter, dateRange, sortField, sortOrder]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `$${(amount / 100).toFixed(2)} ${currency}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  // Get action badge
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'debit':
        return (
          <Badge className="bg-red-100 text-red-800">
            <ArrowDownCircle className="h-3 w-3 mr-1" />
            Bet
          </Badge>
        );
      case 'credit':
        return (
          <Badge className="bg-green-100 text-green-800">
            <ArrowUpCircle className="h-3 w-3 mr-1" />
            Win
          </Badge>
        );
      case 'balance':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <RotateCcw className="h-3 w-3 mr-1" />
            Balance
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {action}
          </Badge>
        );
    }
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Receipt className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Transactions</h2>
          <Badge variant="secondary" className="ml-2">
            {transactions.length.toLocaleString()} total
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <Receipt className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-lg font-bold">{stats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bets ({stats.debitCount})</p>
                <p className="text-lg font-bold text-red-600">${stats.totalDebits.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Wins ({stats.creditCount})</p>
                <p className="text-lg font-bold text-green-600">${stats.totalCredits.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 ${stats.netAmount >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
                <DollarSign className={`h-4 w-4 ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stats.netAmount >= 0 ? 'Player Profit' : 'House Edge'}
                </p>
                <p className={`text-lg font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(stats.netAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="User ID, Game ID, Round ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="debit">Bets</SelectItem>
                  <SelectItem value="credit">Wins</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('user_id')}
                    >
                      User ID
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('game_id')}
                    >
                      Game ID
                    </TableHead>
                    <TableHead>Round ID</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('action')}
                    >
                      Type
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('balance_before')}
                    >
                      Balance Before
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('balance_after')}
                    >
                      Balance After
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Timestamp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.game_id ? `${transaction.game_id.substring(0, 10)}...` : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.round_id ? `${transaction.round_id.substring(0, 8)}...` : '-'}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(transaction.action)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(transaction.balance_before, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(transaction.balance_after, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
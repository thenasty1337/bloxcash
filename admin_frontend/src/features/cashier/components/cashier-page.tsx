'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Search, 
  Wallet,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Gift,
  Bitcoin,
  Coins
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CryptoTransaction {
  id: number;
  userId: number;
  username: string;
  role: string;
  xp: number;
  status: string;
  robuxAmount: number;
  fiatAmount: number;
  currency: string;
  chain: string;
  address: string;
  createdAt: string;
}

interface CryptoTransactionsResponse {
  page: number;
  pages: number;
  total: number;
  data: CryptoTransaction[];
}

interface GiftCardResponse {
  success: boolean;
  codes: string[];
  amount: number;
}

export function CashierPageContent() {
  const [activeTab, setActiveTab] = useState('crypto');
  const [cryptoTransactions, setCryptoTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Gift Card Generation
  const [giftCardAmount, setGiftCardAmount] = useState('3');
  const [giftCardQuantity, setGiftCardQuantity] = useState('1');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  const fetchCryptoTransactions = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('sortBy', 'robuxAmount');
      params.append('sortOrder', 'DESC');
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await clientApi<CryptoTransactionsResponse>(`/admin/cashier/crypto?${params.toString()}`);
      setCryptoTransactions(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to fetch crypto transactions');
      }
      console.error('Error fetching crypto transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCryptoTransactions(1, searchTerm);
  };

  const handleApproveCrypto = async (transaction: CryptoTransaction) => {
    setActionLoading(true);
    try {
      await clientApi(`/admin/cashier/crypto/accept/${transaction.id}`, {
        method: 'POST'
      });
      
      toast.success(`Successfully approved crypto transaction for ${transaction.username}`);
      
      // Remove the approved transaction from the list
      setCryptoTransactions(prev => prev.filter(tx => tx.id !== transaction.id));
    } catch (error: any) {
      toast.error('Failed to approve crypto transaction');
      console.error('Error approving crypto transaction:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDenyCrypto = async (transaction: CryptoTransaction) => {
    setActionLoading(true);
    try {
      await clientApi(`/admin/cashier/crypto/deny/${transaction.id}`, {
        method: 'POST'
      });
      
      toast.success(`Successfully denied crypto transaction for ${transaction.username}`);
      
      // Remove the denied transaction from the list
      setCryptoTransactions(prev => prev.filter(tx => tx.id !== transaction.id));
    } catch (error: any) {
      toast.error('Failed to deny crypto transaction');
      console.error('Error denying crypto transaction:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateGiftCards = async () => {
    const quantity = parseInt(giftCardQuantity);
    const amount = parseInt(giftCardAmount);

    if (quantity < 1 || quantity > 100) {
      toast.error('Quantity must be between 1 and 100');
      return;
    }

    if (amount < 1 || amount > 1000) {
      toast.error('Amount must be between $1 and $1000');
      return;
    }

    setActionLoading(true);
    try {
      const response = await clientApi<GiftCardResponse>('/admin/cashier/createGiftCards', {
        method: 'POST',
        body: JSON.stringify({
          quantity: quantity,
          amount: amount
        })
      });

      if (response.success && response.codes) {
        // Export the gift cards as a text file
        const blob = new Blob([response.codes.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `gift-cards-${amount}-${Date.now()}.txt`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        toast.success(`Successfully generated ${quantity} gift cards worth $${amount} each`);
        setGenerateDialogOpen(false);
      }
    } catch (error: any) {
      if (error.message?.includes('INVALID_QUANTITY')) {
        toast.error('Invalid quantity specified');
      } else if (error.message?.includes('INVALID_AMOUNT')) {
        toast.error('Invalid amount specified');
      } else {
        toast.error('Failed to generate gift cards');
      }
      console.error('Error generating gift cards:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCryptoTransactions(page, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  const getRoleConfig = (role: string) => {
    const configs: Record<string, { color: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      'OWNER': { color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', variant: 'default' },
      'ADMIN': { color: 'bg-gradient-to-r from-red-500 to-orange-500 text-white', variant: 'default' },
      'DEV': { color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', variant: 'default' },
      'MOD': { color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', variant: 'default' },
      'BOT': { color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white', variant: 'default' },
      'USER': { color: '', variant: 'secondary' as const }
    };
    return configs[role] || configs.USER;
  };

  useEffect(() => {
    if (activeTab === 'crypto') {
      fetchCryptoTransactions();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cashier Management</h1>
            <p className="text-muted-foreground">Manage transactions and generate gift cards</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Gift className="h-4 w-4 mr-2" />
                  Generate Gift Cards
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Generate Gift Cards</DialogTitle>
                  <DialogDescription>
                    Create new gift cards for distribution. Cards will be downloaded as a text file.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount per Card</Label>
                    <Select value={giftCardAmount} onValueChange={setGiftCardAmount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">$3</SelectItem>
                        <SelectItem value="5">$5</SelectItem>
                        <SelectItem value="10">$10</SelectItem>
                        <SelectItem value="25">$25</SelectItem>
                        <SelectItem value="50">$50</SelectItem>
                        <SelectItem value="100">$100</SelectItem>
                        <SelectItem value="250">$250</SelectItem>
                        <SelectItem value="500">$500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Cards</Label>
                    <Select value={giftCardQuantity} onValueChange={setGiftCardQuantity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setGenerateDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateGiftCards}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate & Download
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                  <Bitcoin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Crypto</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(cryptoTransactions.reduce((sum, tx) => sum + tx.fiatAmount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gift Cards</p>
                  <p className="text-2xl font-bold">Management</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto">Crypto Withdrawals</TabsTrigger>
          <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Crypto Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Crypto Withdrawals</CardTitle>
                {totalPages > 1 && (
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({totalCount} total)
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading transactions...</span>
                </div>
              ) : cryptoTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Bitcoin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">No pending transactions</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'All crypto withdrawals have been processed'}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cryptoTransactions.map((transaction) => {
                        const roleConfig = getRoleConfig(transaction.role);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {transaction.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{transaction.username}</div>
                                  <Badge variant={roleConfig.variant} className={roleConfig.color}>
                                    {transaction.role}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded">
                                  <Bitcoin className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-semibold">{transaction.currency}</div>
                                  <div className="text-xs text-muted-foreground">{transaction.chain}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-semibold flex items-center">
                                  <Coins className="h-4 w-4 mr-1" />
                                  {formatNumber(transaction.robuxAmount)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(transaction.fiatAmount)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-xs max-w-[150px] truncate">
                                {transaction.address}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(transaction.createdAt), 'HH:mm')}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      disabled={actionLoading}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Approve Withdrawal</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to approve this crypto withdrawal for {transaction.username}?
                                        This will process the transaction and cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleApproveCrypto(transaction)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Approve
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={actionLoading}
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      Deny
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Deny Withdrawal</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to deny this crypto withdrawal for {transaction.username}?
                                        This will refund the amount to their account.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDenyCrypto(transaction)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Deny
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
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
                        disabled={currentPage === totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="giftcards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Gift Card Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gift Card Generator</h3>
                <p className="text-muted-foreground mb-6">
                  Use the &ldquo;Generate Gift Cards&rdquo; button in the header to create new gift cards.
                  Cards will be automatically downloaded as a text file.
                </p>
                <Button onClick={() => setGenerateDialogOpen(true)}>
                  <Gift className="h-4 w-4 mr-2" />
                  Generate Gift Cards
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
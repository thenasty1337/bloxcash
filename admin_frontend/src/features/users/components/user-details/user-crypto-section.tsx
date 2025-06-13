'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Wallet, 
  Bitcoin,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  TrendingDown,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface UserCryptoSectionProps {
  userDetails: any;
}

export function UserCryptoSection({ userDetails }: UserCryptoSectionProps) {
  const { cryptoWallets, cryptoDeposits, cryptoWithdraws } = userDetails;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatCrypto = (amount: number, currency: string) => {
    return `${amount.toFixed(8)} ${currency.toUpperCase()}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Calculate totals
  const totalDeposits = cryptoDeposits?.reduce((sum: number, d: any) => sum + (d.fiatAmount || 0), 0) || 0;
  const totalWithdraws = cryptoWithdraws?.reduce((sum: number, w: any) => sum + (w.fiatAmount || 0), 0) || 0;
  const completedDeposits = cryptoDeposits?.filter((d: any) => d.status === 'completed').length || 0;
  const completedWithdraws = cryptoWithdraws?.filter((w: any) => w.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Cryptocurrency Activity</h3>
        <p className="text-sm text-muted-foreground">
          Manage crypto wallets, deposits, and withdrawals
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(cryptoWallets?.length || 0)}</div>
            <p className="text-xs text-muted-foreground">Active wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeposits)}</div>
            <p className="text-xs text-muted-foreground">{completedDeposits} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWithdraws)}</div>
            <p className="text-xs text-muted-foreground">{completedWithdraws} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeposits - totalWithdraws)}</div>
            <p className="text-xs text-muted-foreground">Deposits - Withdrawals</p>
          </CardContent>
        </Card>
      </div>

      {/* Crypto Wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Crypto Wallets
            <Badge variant="secondary" className="ml-auto">
              {cryptoWallets?.length || 0} wallets
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cryptoWallets && cryptoWallets.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {cryptoWallets.map((wallet: any) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Bitcoin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{wallet.currency.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {format(new Date(wallet.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground">Wallet Address</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No crypto wallets</p>
              <p className="text-sm text-muted-foreground">This user hasn&apos;t created any crypto wallets yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crypto Deposits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5" />
              Deposits
              <Badge variant="secondary" className="ml-auto">
                {cryptoDeposits?.length || 0} transactions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cryptoDeposits && cryptoDeposits.length > 0 ? (
              <div className="space-y-3">
                {cryptoDeposits.slice(0, 5).map((deposit: any) => (
                  <div key={deposit.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded">
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {deposit.currency.toUpperCase()}
                          </Badge>
                          {getStatusBadge(deposit.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(deposit.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold">
                        {formatCrypto(deposit.cryptoAmount, deposit.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(deposit.fiatAmount)}
                      </p>
                    </div>
                  </div>
                ))}
                {cryptoDeposits.length > 5 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">
                      +{cryptoDeposits.length - 5} more deposits
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <ArrowDownLeft className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No deposits found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crypto Withdrawals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Withdrawals
              <Badge variant="secondary" className="ml-auto">
                {cryptoWithdraws?.length || 0} transactions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cryptoWithdraws && cryptoWithdraws.length > 0 ? (
              <div className="space-y-3">
                {cryptoWithdraws.slice(0, 5).map((withdraw: any) => (
                  <div key={withdraw.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-red-100 dark:bg-red-900/20 rounded">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {withdraw.currency.toUpperCase()}
                          </Badge>
                          {getStatusBadge(withdraw.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(withdraw.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold">
                        {formatCrypto(withdraw.cryptoAmount, withdraw.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(withdraw.fiatAmount)}
                      </p>
                    </div>
                  </div>
                ))}
                {cryptoWithdraws.length > 5 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">
                      +{cryptoWithdraws.length - 5} more withdrawals
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <ArrowUpRight className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No withdrawals found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Transaction Tables */}
      {(cryptoDeposits?.length > 5 || cryptoWithdraws?.length > 5) && (
        <>
          <Separator />
          
          {cryptoDeposits && cryptoDeposits.length > 5 && (
            <Card>
              <CardHeader>
                <CardTitle>All Crypto Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Currency</TableHead>
                        <TableHead>Crypto Amount</TableHead>
                        <TableHead>USD Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Transaction Hash</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cryptoDeposits.map((deposit: any) => (
                        <TableRow key={deposit.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {deposit.currency.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {formatCrypto(deposit.cryptoAmount, deposit.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono font-semibold">
                              {formatCurrency(deposit.fiatAmount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(deposit.status)}
                              {getStatusBadge(deposit.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {deposit.txId ? `${deposit.txId.slice(0, 8)}...${deposit.txId.slice(-8)}` : 'N/A'}
                              </span>
                              {deposit.txId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(deposit.txId)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(deposit.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {cryptoWithdraws && cryptoWithdraws.length > 5 && (
            <Card>
              <CardHeader>
                <CardTitle>All Crypto Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Currency</TableHead>
                        <TableHead>Crypto Amount</TableHead>
                        <TableHead>USD Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>To Address</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cryptoWithdraws.map((withdraw: any) => (
                        <TableRow key={withdraw.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {withdraw.currency.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {formatCrypto(withdraw.cryptoAmount, withdraw.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono font-semibold">
                              {formatCurrency(withdraw.fiatAmount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(withdraw.status)}
                              {getStatusBadge(withdraw.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {withdraw.address ? `${withdraw.address.slice(0, 8)}...${withdraw.address.slice(-8)}` : 'N/A'}
                              </span>
                              {withdraw.address && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(withdraw.address)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(withdraw.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 
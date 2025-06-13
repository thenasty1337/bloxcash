'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2,
  CloudRain,
  Search,
  Plus,
  Minus,
  Users,
  Coins,
  DollarSign,
  User
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RainUser {
  id: number;
  username: string;
  avatar?: string;
  xp: number;
  amount: number;
}

interface RainResponse {
  success: boolean;
  data: RainUser[];
}

export function RainPageContent() {
  const [users, setUsers] = useState<RainUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [addingToRain, setAddingToRain] = useState(false);
  const [subtractingFromRain, setSubtractingFromRain] = useState(false);

  const fetchRainUsers = async (search: string = '') => {
    setLoading(true);
    try {
      const url = search ? `/admin/rain?search=${encodeURIComponent(search)}` : '/admin/rain';
      const response = await clientApi<RainResponse>(url);
      setUsers(response.data || []);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to fetch rain data');
      }
      console.error('Error fetching rain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRainUsers(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addToRain = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setAddingToRain(true);
    try {
      await clientApi('/admin/rain/add', {
        method: 'POST',
        body: JSON.stringify({ amount }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast.success(`Successfully added ${amount.toLocaleString()} to the rain`);
      setAmount(0);
      fetchRainUsers(searchTerm); // Refresh data
    } catch (error) {
      toast.error('Failed to add to rain');
    } finally {
      setAddingToRain(false);
    }
  };

  const subtractFromRain = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubtractingFromRain(true);
    try {
      await clientApi('/admin/rain/substract', {
        method: 'POST',
        body: JSON.stringify({ amount }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast.success(`Successfully removed ${amount.toLocaleString()} from the rain`);
      setAmount(0);
      fetchRainUsers(searchTerm); // Refresh data
    } catch (error) {
      toast.error('Failed to subtract from rain');
    } finally {
      setSubtractingFromRain(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getUserInitials = (username: string) => {
    return username?.slice(0, 2).toUpperCase() || 'AN';
  };

  const totalRainAmount = users.reduce((sum, user) => sum + (user.amount || 0), 0);

  useEffect(() => {
    fetchRainUsers();
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rain Administration</h1>
            <p className="text-muted-foreground">Manage rain pool and participant tracking</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rain Pool</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRainAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <CloudRain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average per User</p>
                  <p className="text-2xl font-bold">
                    {users.length > 0 ? formatCurrency(totalRainAmount / users.length) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rain Participants Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5" />
                <span>Rain Participants</span>
                <Badge variant="outline" className="ml-auto">
                  {users.length} users
                </Badge>
              </CardTitle>
              <div className="flex items-center space-x-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading rain data...</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                            No users found in rain pool
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  {user.avatar ? (
                                    <AvatarImage src={user.avatar} alt={user.username} />
                                  ) : (
                                    <AvatarFallback>
                                      {getUserInitials(user.username)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {user.username || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    XP: {user.xp?.toLocaleString() || 0}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">
                                  {formatCurrency(user.amount || 0)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rain Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Rain Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount..."
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={addToRain}
                  disabled={addingToRain || !amount || amount <= 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {addingToRain ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Rain
                    </>
                  )}
                </Button>

                <Button
                  onClick={subtractFromRain}
                  disabled={subtractingFromRain || !amount || amount <= 0}
                  variant="destructive"
                  className="w-full"
                >
                  {subtractingFromRain ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Subtracting...
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4 mr-2" />
                      Subtract from Rain
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[100, 500, 1000, 5000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount)}
                      className="text-xs"
                    >
                      {quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Pool Info */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pool Total:</span>
                  <span className="font-medium">{formatCurrency(totalRainAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="font-medium">{users.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
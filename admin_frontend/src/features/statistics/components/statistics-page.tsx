'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Users, 
  Loader2,
  TrendingUp,
  Eye,
  Coins,
  UserCheck,
  Link as LinkIcon,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { clientApi } from '@/lib/client-api';
import { toast } from 'sonner';

interface AffiliateUser {
  id: number;
  username: string;
  avatar?: string;
  xp: number;
  affiliateCode: string;
  affiliatedUsersWageredCount: number;
  affiliatedUsersCount: number;
  role?: string;
}

interface AffiliateUsersResponse {
  page: number;
  pages: number;
  total: number;
  data: AffiliateUser[];
}



export function StatisticsPageContent() {
  const router = useRouter();
  const [affiliateUsers, setAffiliateUsers] = useState<AffiliateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAffiliateUsers = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await clientApi<AffiliateUsersResponse>(`/admin/users/affiliates?${params.toString()}`);
      // Filter out users without affiliate codes
      const filteredUsers = response.data.filter(user => user.affiliateCode && user.affiliateCode.trim() !== '');
      setAffiliateUsers(filteredUsers);
      setCurrentPage(response.page);
      setTotalPages(response.pages);
      setTotalCount(filteredUsers.length);
    } catch (error: any) {
      if (error.message?.includes('2FA_REQUIRED')) {
        toast.error('2FA verification required');
      } else {
        toast.error('Failed to fetch affiliate users');
      }
      console.error('Error fetching affiliate users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAffiliateUsers(1, searchTerm);
  };

  const handleViewUser = (user: AffiliateUser) => {
    // Navigate to user detail page with affiliate tab
    router.push(`/dashboard/users/${user.id}?tab=affiliate`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAffiliateUsers(page, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getRoleConfig = (role: string = 'USER') => {
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
    fetchAffiliateUsers();
  }, []);

  // Calculate totals for overview
  const totalWagered = affiliateUsers.reduce((sum, user) => sum + user.affiliatedUsersWageredCount, 0);
  const totalAffiliatedUsers = affiliateUsers.reduce((sum, user) => sum + user.affiliatedUsersCount, 0);
  const averageWagerPerUser = totalAffiliatedUsers > 0 ? totalWagered / totalAffiliatedUsers : 0;

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Affiliate Statistics</h1>
            <p className="text-muted-foreground">Monitor affiliate performance and user engagement</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Affiliates</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Referred</p>
                  <p className="text-2xl font-bold">{formatNumber(totalAffiliatedUsers)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                  <Coins className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Wagered</p>
                  <p className="text-2xl font-bold">{formatNumber(totalWagered)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Per User</p>
                  <p className="text-2xl font-bold">{formatNumber(averageWagerPerUser)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Affiliates
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

      {/* Affiliate Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Affiliate Performance
            </CardTitle>
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
              <span className="ml-2">Loading affiliate data...</span>
            </div>
          ) : affiliateUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No affiliate users found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No users have affiliate activity yet'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Affiliate Code</TableHead>
                    <TableHead>Total Wagered</TableHead>
                    <TableHead>Referred Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              {user.role && (
                                <Badge variant={roleConfig.variant} className={roleConfig.color}>
                                  {user.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                              {user.affiliateCode}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Coins className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold">
                              {formatNumber(user.affiliatedUsersWageredCount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-green-600">
                              {user.affiliatedUsersCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
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


    </div>
  );
} 
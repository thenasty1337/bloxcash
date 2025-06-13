'use client';

import { useState, useEffect } from 'react';
import { UserTable } from './user-tables';
import { User, UsersResponse } from './user-listing';
import { clientApi } from '@/lib/client-api';
import { useSearchParams } from 'next/navigation';

interface UsersDataFetcherProps {
  roleFilter?: string;
  searchTerm?: string;
}

// Transform API response to match our User type
const transformUser = (apiUser: any): User => {
  return {
    ...apiUser,
    banned: Boolean(apiUser.banned),
    accountLock: Boolean(apiUser.accountLock),
    tipBan: Boolean(apiUser.tipBan),
    rainBan: Boolean(apiUser.rainBan),
    leaderboardBan: Boolean(apiUser.leaderboardBan),
    sponsorLock: Boolean(apiUser.sponsorLock),
  };
};

export default function UsersDataFetcher({ roleFilter, searchTerm }: UsersDataFetcherProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const page = searchParams.get('page') || '1';
        const sortBy = searchParams.get('sortBy') || 'balance';
        const sortOrder = searchParams.get('sortOrder') || 'DESC';

        const query = new URLSearchParams({ 
          page,
          sortBy,
          sortOrder
        });
        
        if (searchTerm && searchTerm.trim()) query.set('search', searchTerm.trim());
        if (roleFilter) query.set('role', roleFilter);

        console.log('🔍 Fetching users with query:', query.toString());

        const res = await clientApi<UsersResponse>(
          `/admin/users?${query.toString()}`,
          { method: 'GET' }
        );

        console.log('📦 Raw API response:', res);

        if (res && res.data) {
          const validUsers = Array.isArray(res.data) ? res.data.map(transformUser) : [];
          const validTotal = typeof res.total === 'number' ? res.total : 0;
          
          console.log('✅ Users processed successfully:', {
            count: validUsers.length,
            total: validTotal,
            users: validUsers
          });
          
          setUsers(validUsers);
          setTotalItems(validTotal);
        } else {
          console.log('⚠️ No data received from API or invalid structure:', res);
          setUsers([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('💥 Failed to fetch users:', error);
        setUsers([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search term
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [roleFilter, searchTerm, searchParams]);

  // Add debugging for render
  console.log('🎨 UsersDataFetcher render state:', {
    loading,
    usersCount: users.length,
    totalItems
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering UserTable with:', { users, totalItems });
  return <UserTable data={users} totalItems={totalItems} />;
} 
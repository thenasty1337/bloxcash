import { searchParamsCache } from '@/lib/searchparams';
import { api } from '@/lib/api';
import { UserTable } from './user-tables';

export type User = {
  id: string;
  username: string;
  role: string | null;
  balance: number;
  xp: number;
  banned?: boolean;
  accountLock?: boolean;
  tipBan?: boolean;
  rainBan?: boolean;
  leaderboardBan?: boolean;
  sponsorLock?: boolean;
  createdAt?: string;
};

export type UsersResponse = {
  page: number;
  pages: number;
  total: number;
  data: User[];
};

interface UserListingPageProps {
  roleFilter?: string;
  searchTerm?: string;
}

export default async function UserListingPage({ roleFilter, searchTerm }: UserListingPageProps = {}) {
  const page = searchParamsCache.get('page') ?? 1;
  const perPage = searchParamsCache.get('perPage') ?? 10;
  const search = searchTerm || searchParamsCache.get('search');
  const sortBy = searchParamsCache.get('sortBy') ?? 'balance';
  const sortOrder = searchParamsCache.get('sortOrder') ?? 'DESC';

  const query = new URLSearchParams({ 
    page: String(page), 
    sortBy: String(sortBy),
    sortOrder: String(sortOrder)
  });
  if (search) query.set('search', search as string);
  if (roleFilter) query.set('role', roleFilter);

  try {
    const res = await api<UsersResponse>(
      `/admin/users?${query.toString()}`,
      { method: 'GET' }
    );

    if (!res) {
      return <UserTable data={[]} totalItems={0} />;
    }

    const { data: users, total } = res;

    // Ensure users is an array and total is a number
    const validUsers = Array.isArray(users) ? users : [];
    const validTotal = typeof total === 'number' ? total : 0;

    return <UserTable data={validUsers} totalItems={validTotal} />;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return <UserTable data={[]} totalItems={0} />;
  }
} 
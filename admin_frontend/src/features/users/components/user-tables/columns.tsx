'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { User } from '../user-listing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to get role badge styling
const getRoleBadge = (role: string | null) => {
  if (!role) {
    return <Badge variant="secondary" className="text-xs">USER (default)</Badge>;
  }
  
  const roleConfig = {
    'OWNER': { variant: 'destructive' as const, className: 'bg-purple-600 hover:bg-purple-700' },
    'ADMIN': { variant: 'destructive' as const, className: 'bg-red-600 hover:bg-red-700' },
    'MOD': { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' },
    'DEV': { variant: 'secondary' as const, className: 'bg-blue-600 hover:bg-blue-700' },
    'BOT': { variant: 'outline' as const, className: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
    'USER': { variant: 'secondary' as const, className: '' }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;
  
  return (
    <Badge variant={config.variant} className={`text-xs ${config.className}`}>
      {role}
    </Badge>
  );
};

// Helper function to get status badges
const getStatusBadges = (user: User) => {
  const statuses = [];
  
  if (user.banned) statuses.push(<Badge key="banned" variant="destructive" className="text-xs">Banned</Badge>);
  if (user.accountLock) statuses.push(<Badge key="locked" variant="secondary" className="text-xs">Locked</Badge>);
  if (user.tipBan) statuses.push(<Badge key="tipban" variant="outline" className="text-xs">Tip Ban</Badge>);
  if (user.rainBan) statuses.push(<Badge key="rainban" variant="outline" className="text-xs">Rain Ban</Badge>);
  if (user.sponsorLock) statuses.push(<Badge key="sponsor" variant="outline" className="text-xs">Sponsor Lock</Badge>);
  
  if (statuses.length === 0) {
    return <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">Active</Badge>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {statuses.slice(0, 2)}
      {statuses.length > 2 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="text-xs">+{statuses.length - 2}</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1">
                {statuses.slice(2)}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// Sortable column header component
const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      {children}
      <div className="ml-2 h-4 w-4">
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </div>
    </Button>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-mono text-xs text-gray-500">
        #{row.getValue('id')}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => <SortableHeader column={column}>Username</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('username')}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <SortableHeader column={column}>Role</SortableHeader>,
    cell: ({ row }) => getRoleBadge(row.getValue('role')),
    enableSorting: true,
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => <SortableHeader column={column}>Balance</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-mono text-right">
        {formatCurrency(row.getValue('balance'))}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'xp',
    header: ({ column }) => <SortableHeader column={column}>XP</SortableHeader>,
    cell: ({ row }) => (
      <div className="font-mono text-right">
        {new Intl.NumberFormat('en-US').format(row.getValue('xp'))}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadges(row.original),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <SortableHeader column={column}>Created</SortableHeader>,
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!date) return <span className="text-gray-400">-</span>;
      
      try {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(date as string), 'MMM dd, yyyy')}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {format(new Date(date as string), 'PPP p')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } catch {
        return <span className="text-gray-400">-</span>;
      }
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
  }
]; 
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter,
  Users, 
  Crown, 
  Shield, 
  Wrench, 
  Bot,
  UserCheck
} from 'lucide-react';
import UsersDataFetcher from './users-data-fetcher';

interface UserRole {
  key: string;
  label: string;
  icon: any;
  color: string;
  description: string;
  filter?: string;
}

const userRoles: UserRole[] = [
  { 
    key: 'all', 
    label: 'All Users', 
    icon: Users, 
    color: 'bg-blue-500', 
    description: 'All platform users',
    filter: undefined 
  },
  { 
    key: 'users', 
    label: 'Regular Users', 
    icon: UserCheck, 
    color: 'bg-gray-500', 
    description: 'Standard platform users',
    filter: 'NULL' 
  },
  { 
    key: 'owner', 
    label: 'Owners', 
    icon: Crown, 
    color: 'bg-purple-500', 
    description: 'Platform owners',
    filter: 'OWNER' 
  },
  { 
    key: 'admin', 
    label: 'Administrators', 
    icon: Shield, 
    color: 'bg-red-500', 
    description: 'System administrators',
    filter: 'ADMIN' 
  },
  { 
    key: 'support', 
    label: 'Support Staff', 
    icon: Wrench, 
    color: 'bg-green-500', 
    description: 'Support and moderation staff',
    filter: 'MOD' 
  },
  { 
    key: 'bots', 
    label: 'Bots', 
    icon: Bot, 
    color: 'bg-yellow-500', 
    description: 'Automated bot accounts',
    filter: 'BOT' 
  }
];

export function UsersClientWrapper() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activeRole = userRoles.find(role => role.key === activeTab);

  return (
    <>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {userRoles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Card 
              key={role.key} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === role.key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveTab(role.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`${role.color} p-2 rounded-full`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {role.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {activeRole && <activeRole.icon className="h-5 w-5" />}
              {activeRole?.label || 'Users'}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Showing {activeRole?.label.toLowerCase() || 'all users'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Active Users</DropdownMenuItem>
                <DropdownMenuItem>Banned Users</DropdownMenuItem>
                <DropdownMenuItem>Locked Accounts</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Recently Created</DropdownMenuItem>
                <DropdownMenuItem>High Balance</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <UsersDataFetcher roleFilter={activeRole?.filter} searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </>
  );
} 
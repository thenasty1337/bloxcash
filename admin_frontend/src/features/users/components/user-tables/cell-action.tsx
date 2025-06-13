'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../user-listing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserDetailModal } from '../user-detail-modal';
import { MoreHorizontal, Eye, Edit, Ban, Unlock, Shield, Crown } from 'lucide-react';

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    router.push(`/dashboard/users/${data.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {data.banned ? (
            <DropdownMenuItem className="text-green-600">
              <Unlock className="mr-2 h-4 w-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="text-red-600">
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          )}
          {data.role !== 'ADMIN' && data.role !== 'OWNER' && (
            <>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Crown className="mr-2 h-4 w-4" />
                Make Owner
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDetailModal 
        userId={data.id}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}; 
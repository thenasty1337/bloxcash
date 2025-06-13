import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    imageUrl?: string; // Clerk shape
    fullName?: string | null; // Clerk shape
    emailAddresses?: Array<{ emailAddress: string }>; // Clerk shape
    // Internal backend shape
    avatar?: string;
    username?: string;
    email?: string;
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={user?.imageUrl || user?.avatar || ''} alt={user?.fullName || user?.username || ''} />
        <AvatarFallback className='rounded-lg'>
          { (user?.fullName ?? user?.username ?? 'CN').slice(0,2).toUpperCase() }
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.fullName || user?.username || ''}</span>
          <span className='truncate text-xs'>
            {user?.emailAddresses?.[0]?.emailAddress || user?.email || ''}
          </span>
        </div>
      )}
    </div>
  );
}

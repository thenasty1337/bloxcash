import { UserDetailsPageContent } from '@/features/users/components/user-details-page';

interface UserDetailsPageProps {
  params: {
    id: string;
  };
  searchParams: {
    tab?: string;
  };
}

export default function UserDetailsPage({ params, searchParams }: UserDetailsPageProps) {
  return <UserDetailsPageContent userId={params.id} defaultTab={searchParams.tab} />;
} 
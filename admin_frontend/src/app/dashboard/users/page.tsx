import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { UsersPageContent } from '@/features/users/components/users-page-content';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Users'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <div>
          <Heading title='User Management' description='Manage platform users and their permissions' />
        </div>
        <Separator />
        <Suspense
          fallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={2} />}
        >
          <UsersPageContent />
        </Suspense>
      </div>
    </PageContainer>
  );
} 
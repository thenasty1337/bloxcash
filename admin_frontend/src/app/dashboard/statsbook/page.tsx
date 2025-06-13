'use client';

import React from 'react';
import { StatsbookPageContent } from '@/features/statsbook/components/statsbook-page';
import PageContainer from '@/components/layout/page-container';

export default function StatsbookPage() {
  return (
    <PageContainer scrollable>
      <StatsbookPageContent />
    </PageContainer>
  );
} 
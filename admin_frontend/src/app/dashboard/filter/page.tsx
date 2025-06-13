'use client';

import React from 'react';
import { FilterPageContent } from '@/features/filter/components/filter-page';
import PageContainer from '@/components/layout/page-container';

export default function FilterPage() {
  return (
    <PageContainer scrollable>
      <FilterPageContent />
    </PageContainer>
  );
} 
'use client';

import React from 'react';
import { StatisticsPageContent } from '@/features/statistics/components/statistics-page';
import PageContainer from '@/components/layout/page-container';

export default function StatisticsPage() {
  return (
    <PageContainer scrollable>
      <StatisticsPageContent />
    </PageContainer>
  );
} 
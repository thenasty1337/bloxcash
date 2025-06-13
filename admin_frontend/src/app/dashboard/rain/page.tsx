'use client';

import React from 'react';
import { RainPageContent } from '@/features/rain/components/rain-page';
import PageContainer from '@/components/layout/page-container';

export default function RainPage() {
  return (
    <PageContainer scrollable>
      <RainPageContent />
    </PageContainer>
  );
} 
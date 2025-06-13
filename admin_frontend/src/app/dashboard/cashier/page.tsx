'use client';

import React from 'react';
import { CashierPageContent } from '@/features/cashier/components/cashier-page';
import PageContainer from '@/components/layout/page-container';

export default function CashierPage() {
  return (
    <PageContainer scrollable>
      <CashierPageContent />
    </PageContainer>
  );
} 
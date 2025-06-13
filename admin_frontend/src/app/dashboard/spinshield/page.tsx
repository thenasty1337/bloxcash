import React from 'react';
import { SpinShieldPageContent } from '@/features/spinshield/components/spinshield-page';
import PageContainer from '@/components/layout/page-container';

export default function SpinShieldPage() {
  return (
    <PageContainer scrollable>
      <SpinShieldPageContent />
    </PageContainer>
  );
} 
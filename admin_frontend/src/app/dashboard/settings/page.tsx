'use client';

import React from 'react';
import { SettingsPageContent } from '@/features/settings/components/settings-page';
import PageContainer from '@/components/layout/page-container';

export default function SettingsPage() {
  return (
    <PageContainer scrollable>
      <SettingsPageContent />
    </PageContainer>
  );
} 
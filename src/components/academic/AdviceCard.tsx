import React from 'react';

import { AppCard, AppText } from '../ui';

type AdviceTone = 'info' | 'warning' | 'success' | 'danger';

type AdviceCardProps = {
  title: string;
  description: string;
  tone?: AdviceTone;
};

export function AdviceCard({ title, description, tone = 'info' }: AdviceCardProps) {
  return (
    <AppCard title={title}>
      <AppText tone={tone}>{description}</AppText>
    </AppCard>
  );
}

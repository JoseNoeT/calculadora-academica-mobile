import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { AppCard, AppText } from '../ui';
import { StatusBadge } from './StatusBadge';

type AcademicSummaryCardProps = {
  title: string;
  subtitle?: string;
  value: string;
  description?: string;
  status?: 'pendiente' | 'aprobado' | 'alcanzable' | 'en riesgo' | 'no alcanzable' | 'reprobado';
};

export function AcademicSummaryCard({
  title,
  subtitle,
  value,
  description,
  status,
}: AcademicSummaryCardProps) {
  return (
    <AppCard title={title} subtitle={subtitle}>
      <View style={styles.content}>
        <AppText variant="title">{value}</AppText>
        {description ? (
          <AppText tone="secondary" variant="caption">
            {description}
          </AppText>
        ) : null}
        {status ? <StatusBadge status={status} /> : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
});

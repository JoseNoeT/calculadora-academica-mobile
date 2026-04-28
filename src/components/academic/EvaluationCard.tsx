import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { AppCard, AppText } from '../ui';
import { StatusBadge } from './StatusBadge';

type EvaluationCardProps = {
  title: string;
  subtitle?: string;
  grade?: string;
  weight?: string;
  isPending?: boolean;
  status?: 'pendiente' | 'aprobado' | 'alcanzable' | 'en riesgo' | 'no alcanzable' | 'reprobado';
};

export function EvaluationCard({
  title,
  subtitle,
  grade,
  weight,
  isPending = false,
  status,
}: EvaluationCardProps) {
  return (
    <AppCard title={title} subtitle={subtitle}>
      <View style={styles.row}>
        <View style={styles.block}>
          <AppText variant="caption" tone="secondary">
            Nota
          </AppText>
          <AppText variant="subtitle">{isPending ? '-' : grade ?? '-'}</AppText>
        </View>
        <View style={styles.block}>
          <AppText variant="caption" tone="secondary">
            Peso
          </AppText>
          <AppText variant="subtitle">{weight ?? '-'}</AppText>
        </View>
      </View>
      {status ? <StatusBadge status={status} /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  block: {
    flex: 1,
    gap: spacing.xs,
  },
});

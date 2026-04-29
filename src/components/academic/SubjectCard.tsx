import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { AppCard, AppProgressBar, AppText } from '../ui';
import { StatusBadge } from './StatusBadge';

type SubjectCardProps = {
  title: string;
  subtitle?: string;
  grade?: string;
  progress?: number;
  status?: 'pendiente' | 'aprobado' | 'alcanzable' | 'en riesgo' | 'no alcanzable' | 'reprobado';
};

export function SubjectCard({ title, subtitle, grade, progress = 0, status }: SubjectCardProps) {
  return (
    <AppCard title={title} subtitle={subtitle}>
      <View style={styles.content}>
        {grade ? (
          <View style={styles.row}>
            <AppText variant="caption" tone="secondary">
              Nota acumulada
            </AppText>
            <AppText variant="subtitle">{grade}</AppText>
          </View>
        ) : null}
        <AppProgressBar progress={progress} label="Avance" />
        {status ? <StatusBadge status={status} /> : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { AppCard, AppText } from '../ui';

type RequiredGradeCardProps = {
  title: string;
  requiredGrade: string;
  grade?: string;
  description?: string;
};

export function RequiredGradeCard({
  title,
  requiredGrade,
  grade,
  description,
}: RequiredGradeCardProps) {
  return (
    <AppCard title={title}>
      <View style={styles.row}>
        <View style={styles.block}>
          <AppText variant="caption" tone="secondary">
            Nota requerida
          </AppText>
          <AppText variant="title">{requiredGrade}</AppText>
        </View>
        {grade ? (
          <View style={styles.block}>
            <AppText variant="caption" tone="secondary">
              Nota actual
            </AppText>
            <AppText variant="subtitle">{grade}</AppText>
          </View>
        ) : null}
      </View>
      {description ? (
        <AppText variant="caption" tone="secondary">
          {description}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  block: {
    flex: 1,
    gap: spacing.xs,
  },
});

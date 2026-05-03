import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { strings } from "@/src/constants/strings";
import {
    academicStatusLabels,
    type AcademicStatus,
} from "@/src/domain/entities";
import { spacing, useAppTheme } from "@/src/theme";
import { AppBadge, AppCard, AppText } from "../ui";

type AcademicSummaryPanelProps = {
  title?: string;
  subtitle?: string;
  accumulatedPoints: number;
  currentWeightedAverage: number | null;
  completedWeight: number;
  pendingWeight: number;
  requiredGrade: number | null;
  finalProjectedGrade: number | null;
  status: AcademicStatus;
  advice: string;
  requiredGradeLabel?: string;
  finalProjectedGradeLabel?: string;
  minimumGrade?: number;
  style?: StyleProp<ViewStyle>;
  footer?: ReactNode;
};

function statusToTone(
  status: AcademicStatus,
): "success" | "warning" | "danger" | "info" | "pending" {
  if (status === "approved" || status === "favorable") {
    return "success";
  }

  if (
    status === "atRisk" ||
    status === "notAchievable" ||
    status === "failed"
  ) {
    return "danger";
  }

  if (status === "pending") {
    return "pending";
  }

  return "info";
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatGrade(value: number | null | undefined): string {
  if (typeof value !== "number") {
    return strings.academicSummary.pending;
  }

  return value.toFixed(2);
}

export function AcademicSummaryPanel({
  title = strings.academicSummary.title,
  subtitle = strings.academicSummary.subtitle,
  accumulatedPoints,
  currentWeightedAverage,
  completedWeight,
  pendingWeight,
  requiredGrade,
  finalProjectedGrade,
  status,
  advice,
  requiredGradeLabel,
  finalProjectedGradeLabel,
  minimumGrade,
  style,
  footer,
}: AcademicSummaryPanelProps) {
  const { theme } = useAppTheme();

  const normalizedCompleted = Math.max(0, Math.min(100, completedWeight));
  const normalizedPending = Math.max(0, Math.min(100, pendingWeight));
  const statusTone = statusToTone(status);

  return (
    <AppCard title={title} subtitle={subtitle} variant="elevated" style={style}>
      <View
        style={[
          styles.statusStrip,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor:
              statusTone === "success"
                ? theme.success
                : statusTone === "danger"
                  ? theme.danger
                  : statusTone === "warning"
                    ? theme.warning
                    : statusTone === "pending"
                      ? theme.pending
                      : theme.info,
          },
        ]}
      >
        <AppText variant="caption" tone="secondary">
          {strings.academicSummary.statusLabel}
        </AppText>
        <AppBadge label={academicStatusLabels[status]} tone={statusTone} />
        {typeof minimumGrade === "number" ? (
          <View style={styles.minimumGradeRow}>
            <AppText variant="caption" tone="secondary">
              Nota mínima
            </AppText>
            <AppText variant="caption">
              {minimumGrade.toFixed(1)}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.metricGrid}>
        <View style={[styles.metricCard, { borderColor: theme.info }]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.accumulatedPoints}
          </AppText>
          <AppText variant="h3">{accumulatedPoints.toFixed(2)}</AppText>
        </View>

        <View style={[styles.metricCard, { borderColor: theme.primary }]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.currentWeightedAverage}
          </AppText>
          <AppText variant="h3">{formatGrade(currentWeightedAverage)}</AppText>
        </View>

        <View style={[styles.metricCard, { borderColor: theme.success }]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.completedWeight}
          </AppText>
          <AppText variant="h3" tone="success">
            {formatPercent(completedWeight)}
          </AppText>
        </View>

        <View style={[styles.metricCard, { borderColor: theme.warning }]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.pendingWeight}
          </AppText>
          <AppText variant="h3" tone="warning">
            {formatPercent(pendingWeight)}
          </AppText>
        </View>

        <View style={[styles.metricCard, { borderColor: theme.warning }]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.requiredGrade}
          </AppText>
          <AppText variant="h3" tone="warning">
            {requiredGradeLabel ?? formatGrade(requiredGrade)}
          </AppText>
        </View>

        <View style={[styles.metricCard, { borderColor: theme.secondary }]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.finalProjectedGrade}
          </AppText>
          <AppText variant="h3">
            {finalProjectedGradeLabel ?? formatGrade(finalProjectedGrade)}
          </AppText>
        </View>
      </View>

      <View style={styles.progressGroup}>
        <View style={styles.progressHeader}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.completedProgress}
          </AppText>
          <AppText variant="caption">{formatPercent(completedWeight)}</AppText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${normalizedCompleted}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>

        <View style={[styles.progressHeader, styles.pendingHeader]}>
          <AppText variant="caption" tone="secondary">
            {strings.academicSummary.pendingProgress}
          </AppText>
          <AppText variant="caption">{formatPercent(pendingWeight)}</AppText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${normalizedPending}%`,
                backgroundColor: theme.warning,
              },
            ]}
          />
        </View>
      </View>

      <View
        style={[
          styles.adviceBox,
          {
            backgroundColor: theme.surface,
            borderColor:
              statusTone === "success"
                ? theme.success
                : statusTone === "danger"
                  ? theme.danger
                  : statusTone === "warning"
                    ? theme.warning
                    : statusTone === "pending"
                      ? theme.pending
                      : theme.info,
          },
        ]}
      >
        <AppText
          variant="h3"
          tone={statusTone === "pending" ? "info" : statusTone}
        >
          {strings.academicSummary.contextualAdvice}
        </AppText>
        <AppText variant="body" tone="secondary">
          {advice}
        </AppText>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  statusStrip: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricCard: {
    width: "48%",
    minHeight: 102,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  progressGroup: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pendingHeader: {
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  adviceBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.xs,
  },
  footer: {
    marginTop: spacing.xs,
  },
  minimumGradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

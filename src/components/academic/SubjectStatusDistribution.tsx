import type { AcademicStatus } from "@/src/domain/entities";
import type { SubjectListItem } from "@/src/features/subjects/types/subject.types";
import { spacing, useAppTheme } from "@/src/theme";
import { StyleSheet, View } from "react-native";

import { strings } from "@/src/constants/strings";
import { AppText } from "../ui";

type SubjectStatusDistributionProps = {
  subjects: SubjectListItem[];
  subjectStatuses: Record<string, AcademicStatus>;
};

type LegendItem = {
  id: string;
  label: string;
  tone: "positive" | "risk" | "negative" | "pending";
};

const LEGEND_ITEMS: LegendItem[] = [
  { id: "positive", label: strings.subjectsTab.legendPositive, tone: "positive" },
  { id: "risk", label: strings.subjectsTab.legendRisk, tone: "risk" },
  { id: "negative", label: strings.subjectsTab.legendNegative, tone: "negative" },
  { id: "pending", label: strings.subjectsTab.legendPending, tone: "pending" },
];

function resolveStatusColor(status: AcademicStatus | undefined, colors: {
  positive: string;
  risk: string;
  negative: string;
  pending: string;
}): string {
  if (status === "approved" || status === "favorable" || status === "achievable") {
    return colors.positive;
  }

  if (status === "atRisk") {
    return colors.risk;
  }

  if (status === "failed" || status === "notAchievable") {
    return colors.negative;
  }

  return colors.pending;
}

export function SubjectStatusDistribution({
  subjects,
  subjectStatuses,
}: SubjectStatusDistributionProps) {
  const { theme } = useAppTheme();
  const colors = {
    positive: theme.success,
    risk: theme.warning,
    negative: theme.danger,
    pending: theme.pending,
  };

  if (subjects.length === 0) {
    return (
      <AppText variant="caption" tone="secondary">
        {strings.subjectsTab.noSubjectsTitle}
      </AppText>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" tone="secondary">
        {strings.subjectsTab.distributionHelp}
      </AppText>

      <View style={styles.grid}>
        {subjects.map((subject) => {
          const status = subjectStatuses[subject.id];
          const color = resolveStatusColor(status, colors);

          return (
            <View
              key={subject.id}
              style={[
                styles.block,
                {
                  backgroundColor: color,
                  borderColor: theme.border,
                },
              ]}
              accessibilityLabel={`${subject.name}: ${status ?? "pending"}`}
            />
          );
        })}
      </View>

      <View style={styles.legend}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: resolveStatusColor(
                    item.tone === "positive"
                      ? "approved"
                      : item.tone === "risk"
                        ? "atRisk"
                        : item.tone === "negative"
                          ? "failed"
                          : "pending",
                    colors,
                  ),
                },
              ]}
            />
            <AppText variant="caption" tone="secondary">
              {item.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  block: {
    width: 22,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
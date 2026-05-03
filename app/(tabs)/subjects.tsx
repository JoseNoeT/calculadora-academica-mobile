import { useFocusEffect } from "@react-navigation/native";
import { type Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
    AnimatedProgressBar,
    AnimatedStatCard,
} from "@/src/components/charts";
import { SubjectStatusDistribution } from "@/src/components/academic";
import { AppHeader } from "@/src/components/layout/AppHeader";
import {
    AppBadge,
    AppButton,
    AppCard,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { strings } from "@/src/constants/strings";
import type { AcademicStatus } from "@/src/domain/entities";
import { getSubjects } from "@/src/features/subjects/services/subjectService";
import type { SubjectListItem } from "@/src/features/subjects/types/subject.types";
import { buildSubjectDashboardMetrics } from "@/src/features/subjects/utils/dashboardMetrics";
import { spacing, useAppTheme } from "@/src/theme";

export default function SubjectsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const createSubjectRoute: Href = "/subjects/create" as Href;
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [heroMetrics, setHeroMetrics] = useState({
    totalSubjects: 0,
    subjectsWithEvaluations: 0,
    subjectsAtRisk: 0,
    overallProgress: 0,
    perSubjectEvaluationCounts: {} as Record<string, number>,
    perSubjectStatuses: {} as Record<string, AcademicStatus>,
  });

  const loadSubjects = useCallback(async () => {
    const items = await getSubjects();
    setSubjects(items);
    const metrics = await buildSubjectDashboardMetrics(items);
    setHeroMetrics(metrics);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSubjects();
    }, [loadSubjects]),
  );

  return (
    <AppScreen scrollable stickyHeader={<AppHeader />}>
      <View style={styles.container}>
        <AppCard variant="elevated" showTopAccent>
          <AppText variant="sectionTitle" tone="accent">
            {strings.subjectsTab.globalStatusTitle}
          </AppText>
          <AnimatedProgressBar
            value={heroMetrics.overallProgress}
            label={strings.subjectsTab.overallProgress}
            duration={900}
            height={8}
          />
          <View style={styles.heroStatsRow}>
            <AnimatedStatCard
              label={strings.subjectsTab.total}
              value={`${heroMetrics.totalSubjects}`}
              tone="info"
            />
            <AnimatedStatCard
              label={strings.subjectsTab.withEvaluations}
              value={`${heroMetrics.subjectsWithEvaluations}`}
              delay={80}
            />
            <AnimatedStatCard
              label={strings.subjectsTab.atRisk}
              value={`${heroMetrics.subjectsAtRisk}`}
              tone={heroMetrics.subjectsAtRisk > 0 ? "warning" : "success"}
              delay={160}
            />
          </View>
          <SubjectStatusDistribution
            subjects={subjects}
            subjectStatuses={heroMetrics.perSubjectStatuses}
          />
          {heroMetrics.totalSubjects === 0 ? (
            <AppText variant="caption" tone="secondary">
              {strings.subjectsTab.startByAdding}
            </AppText>
          ) : null}
        </AppCard>

        {subjects.length === 0 ? (
          <AppCard title={strings.subjectsTab.noSubjectsTitle} variant="glass">
            <AppText variant="bodySecondary">
              {strings.subjectsTab.noSubjectsDescription}
            </AppText>
            <AppButton
              label={strings.subjectsTab.add}
              style={styles.primaryAction}
              onPress={() => router.push(createSubjectRoute)}
            />
          </AppCard>
        ) : (
          <View style={styles.subjectsList}>
            <AppCard
              title={strings.subjectsTab.yourSubjectsTitle}
              subtitle={strings.subjectsTab.yourSubjectsSubtitle}
              variant="accent"
              accentTone="cool"
            >
              <AppButton
                label={strings.subjectsTab.add}
                variant="outline"
                style={styles.primaryAction}
                onPress={() => router.push(createSubjectRoute)}
              />
            </AppCard>

            {subjects.map((subject) => (
              <Pressable
                key={subject.id}
                onPress={() => router.push(`/subjects/${subject.id}` as Href)}
                style={styles.subjectCardPressable}
              >
                <AppCard
                  variant="elevated"
                  animateOnMount
                  style={{ borderLeftColor: subject.color, borderLeftWidth: 4 }}
                >
                  <View style={styles.subjectHeader}>
                    <AppText
                      variant="h3"
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {subject.name}
                    </AppText>
                    <View
                      style={[
                        styles.subjectColorDot,
                        {
                          backgroundColor: subject.color,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                  </View>
                  <AppText variant="bodySecondary">
                    {strings.subjectsTab.minimumGradePrefix}{" "}
                    {subject.minimumGrade.toFixed(1)}
                  </AppText>
                  {(heroMetrics.perSubjectEvaluationCounts[subject.id] ?? 0) === 0 ? (
                    <AppBadge
                      label={strings.subjectsTab.noEvaluations}
                      tone="pending"
                    />
                  ) : (
                    <AppBadge
                      label={
                        heroMetrics.perSubjectEvaluationCounts[subject.id] === 1
                          ? "1 evaluación"
                          : `${heroMetrics.perSubjectEvaluationCounts[subject.id]} evaluaciones`
                      }
                      tone="info"
                    />
                  )}
                </AppCard>
              </Pressable>
            ))}
          </View>
        )}

        <AppCard
          title={strings.subjectsTab.perSubjectChecklistTitle}
          variant="glass"
        >
          <View style={styles.educationalList}>
            <AppText variant="bodySecondary">
              {strings.subjectsTab.checklistCurrentAverage}
            </AppText>
            <AppText variant="bodySecondary">
              {strings.subjectsTab.checklistAccumulatedPoints}
            </AppText>
            <AppText variant="bodySecondary">
              {strings.subjectsTab.checklistWeightProgress}
            </AppText>
            <AppText variant="bodySecondary">
              {strings.subjectsTab.checklistRequiredGrade}
            </AppText>
            <AppText variant="bodySecondary">
              {strings.subjectsTab.checklistAcademicStatus}
            </AppText>
            <AppText variant="bodySecondary">
              {strings.subjectsTab.checklistMostImportantPending}
            </AppText>
          </View>
        </AppCard>

        <AppCard
          title={strings.subjectsTab.nextImprovementTitle}
          variant="accent"
          accentTone="warm"
        >
          <AppText variant="bodySecondary">
            {strings.subjectsTab.nextImprovementDescription}
          </AppText>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  educationalList: {
    gap: spacing.sm,
  },
  subjectsList: {
    gap: spacing.md,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectCardPressable: {
    borderRadius: 16,
  },
  subjectColorDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  primaryAction: {
    marginTop: spacing.md,
    minHeight: 48,
  },
});

import { useFocusEffect } from "@react-navigation/native";
import { useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AnimatedStatCard, MiniTrendChart } from "@/src/components/charts";
import { HomeHero } from "@/src/components/home/HomeHero";
import { AppHeader } from "@/src/components/layout/AppHeader";
import {
    AppBadge,
    AppButton,
    AppCard,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { strings } from "@/src/constants/strings";
import {
    academicStatusLabels,
    type AcademicStatus,
} from "@/src/domain/entities";
import {
    getHomeAlerts,
    getHomeInsights,
    getNextActions,
    getPendingEvaluations,
    getRiskSubjects,
    type HomeSummary,
} from "@/src/features/home/utils/homeInsights";
import { getSubjects } from "@/src/features/subjects/services/subjectService";
import {
    buildSubjectDashboardMetrics,
    type SubjectDashboardMetrics,
} from "@/src/features/subjects/utils/dashboardMetrics";
import { spacing } from "@/src/theme";

function getStatusTone(
  status: AcademicStatus,
): "info" | "success" | "warning" | "danger" | "pending" {
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

  if (status === "achievable") {
    return "info";
  }

  return "pending";
}

export default function HomeScreen() {
  const router = useRouter();
  const quickCalculatorRoute: Href = "/calculator/quick" as Href;
  const subjectsRoute: Href = "/subjects" as Href;
  const simulatorRoute: Href = "/simulator" as Href;
  const settingsRoute: Href = "/settings" as Href;
  const createSubjectRoute: Href = "/subjects/create" as Href;
  const [heroMetrics, setHeroMetrics] = useState<SubjectDashboardMetrics>({
    totalSubjects: 0,
    subjectsWithEvaluations: 0,
    subjectsAtRisk: 0,
    pendingEvaluations: 0,
    pendingEvaluationItems: [],
    overallProgress: 0,
    overallCurrentAverage: null as number | null,
    overallStatus: "pending" as AcademicStatus,
    overallAdvice: "",
    trendDirection: "flat" as "up" | "down" | "flat",
    trendPoints: [8, 14, 22, 16, 28, 34],
    perSubjectEvaluationCounts: {} as Record<string, number>,
    perSubjectStatuses: {} as Record<string, AcademicStatus>,
    alerts: [
      {
        id: "default-info",
        tone: "info",
        message: strings.home.defaultInfoMessage,
      },
    ],
    featuredSubjects: [],
  });

  const loadHeroMetrics = useCallback(async () => {
    const subjects = await getSubjects();
    const metrics = await buildSubjectDashboardMetrics(subjects);
    setHeroMetrics(metrics);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHeroMetrics();
    }, [loadHeroMetrics]),
  );

  const trendIcon =
    heroMetrics.trendDirection === "up"
      ? "↑"
      : heroMetrics.trendDirection === "down"
        ? "↓"
        : "→";

  const trendText =
    heroMetrics.trendDirection === "up"
      ? strings.home.trendUp
      : heroMetrics.trendDirection === "down"
        ? strings.home.trendDown
        : strings.home.trendStable;

  const trendTone =
    heroMetrics.trendDirection === "up"
      ? "success"
      : heroMetrics.trendDirection === "down"
        ? "warning"
        : "secondary";
  const hasSubjects = heroMetrics.totalSubjects > 0;
  const hasRealTrendData =
    hasSubjects &&
    heroMetrics.overallCurrentAverage !== null &&
    heroMetrics.trendPoints.length > 0;

  const riskSubjects = getRiskSubjects(heroMetrics.featuredSubjects);
  const pendingEvaluationItems = getPendingEvaluations(
    heroMetrics.pendingEvaluationItems,
  );
  const homeSummary: HomeSummary = {
    totalSubjects: heroMetrics.totalSubjects,
    subjectsAtRisk: riskSubjects.length,
    pendingEvaluations: pendingEvaluationItems.length,
    overallStatus: heroMetrics.overallStatus,
    overallCurrentAverage: heroMetrics.overallCurrentAverage,
    trendDirection: heroMetrics.trendDirection,
    riskSubjects,
  };

  const homeAlerts = getHomeAlerts(homeSummary);
  const homeInsights = getHomeInsights(homeSummary);
  const nextActions = getNextActions(homeSummary);
  const alertsAccentTone = homeAlerts.some((alert) => alert.tone === "danger")
    ? "warm"
    : "cool";

  const handleActionPress = (
    routeKey: "subjects-create" | "subjects" | "simulator" | "calculator",
  ) => {
    if (routeKey === "subjects-create") {
      router.push(createSubjectRoute);
      return;
    }

    if (routeKey === "subjects") {
      router.push(subjectsRoute);
      return;
    }

    if (routeKey === "simulator") {
      router.push(simulatorRoute);
      return;
    }

    router.push(quickCalculatorRoute);
  };

  return (
    <AppScreen scrollable stickyHeader={<AppHeader />}>
      <View style={styles.container}>
        {!hasSubjects ? (
          <AppCard variant="glass" showTopAccent>
            <View style={styles.welcomeContainer}>
              <AppText variant="h2">Bienvenido a tu panel academico</AppText>
              <AppText variant="bodySecondary">
                Organiza tus ramos, registra evaluaciones y simula tus notas
                para saber como vas avanzando durante el semestre.
              </AppText>
              <AppText variant="caption" tone="secondary">
                Comienza creando tu primer ramo.
              </AppText>
              <AppButton
                label="Crear primer ramo"
                onPress={() => router.push(createSubjectRoute)}
                style={styles.welcomeButton}
              />
            </View>
          </AppCard>
        ) : null}

        <HomeHero
          onPressCalculateNow={() => router.push(quickCalculatorRoute)}
          onPressCreateSubject={() => router.push(createSubjectRoute)}
          onPressSubjects={() => router.push(subjectsRoute)}
          onPressSimulator={() => router.push(simulatorRoute)}
          onPressSettings={() => router.push(settingsRoute)}
          totalSubjects={heroMetrics.totalSubjects}
          subjectsWithEvaluations={heroMetrics.subjectsWithEvaluations}
          subjectsAtRisk={heroMetrics.subjectsAtRisk}
          statusLabel={academicStatusLabels[heroMetrics.overallStatus]}
          statusTone={getStatusTone(heroMetrics.overallStatus)}
          overallProgress={heroMetrics.overallProgress}
          trendPoints={heroMetrics.trendPoints}
          hasTrendData={hasRealTrendData}
        />

        <AppCard
          title={strings.home.currentSituationTitle}
          variant="elevated"
          showTopAccent
        >
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <AnimatedStatCard
                label="Promedio"
                value={
                  heroMetrics.overallCurrentAverage != null
                    ? heroMetrics.overallCurrentAverage.toFixed(2)
                    : strings.home.noGrades
                }
                tone="info"
              />
              <AnimatedStatCard
                label="Ramos"
                value={`${heroMetrics.totalSubjects}`}
                delay={60}
              />
            </View>
            <View style={styles.statsRow}>
              <AnimatedStatCard
                label="En riesgo"
                value={`${heroMetrics.subjectsAtRisk}`}
                tone={heroMetrics.subjectsAtRisk > 0 ? "warning" : "success"}
                delay={120}
              />
              <AnimatedStatCard
                label="Evaluaciones"
                value={`${heroMetrics.pendingEvaluations}`}
                tone={heroMetrics.pendingEvaluations > 0 ? "info" : "success"}
                delay={180}
              />
            </View>
          </View>
        </AppCard>

        <AppCard
          title={strings.home.alertsTitle}
          variant="accent"
          accentTone={alertsAccentTone}
        >
          <View style={styles.alertsList}>
            {homeAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <AppBadge
                  label={
                    alert.tone === "danger"
                      ? strings.home.critical
                      : alert.tone === "warning"
                        ? strings.home.attention
                        : alert.tone === "success"
                          ? strings.home.positive
                          : strings.home.info
                  }
                  tone={alert.tone}
                />
                <AppText
                  variant="bodySecondary"
                  style={styles.alertText}
                >
                  {alert.icon} {alert.message}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>

        <AppCard
          title={strings.home.insightsTitle}
          variant="glass"
          showTopAccent
        >
          <View style={styles.alertsList}>
            {homeInsights.map((insight) => (
              <View key={insight.id} style={styles.alertItem}>
                <AppBadge
                  label={
                    insight.tone === "danger"
                      ? strings.home.risk
                      : insight.tone === "warning"
                        ? strings.home.attention
                        : insight.tone === "success"
                          ? strings.home.positive
                          : strings.home.info
                  }
                  tone={insight.tone}
                />
                <AppText
                  variant="bodySecondary"
                  style={styles.alertText}
                >
                  {insight.icon} {insight.text}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>

        <AppCard title={strings.home.nextActionsTitle} variant="elevated">
          <View style={styles.actionsList}>
            {nextActions.map((action, index) => (
              <View key={action.id} style={styles.actionItem}>
                <AppText
                  variant="h3"
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {action.title}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {action.description}
                </AppText>
                <AppButton
                  label={action.title}
                  variant={
                    index === 0 ? "primary" : index === 1 ? "outline" : "ghost"
                  }
                  onPress={() => handleActionPress(action.routeKey)}
                />
              </View>
            ))}
          </View>
        </AppCard>

        <AppCard
          title={strings.home.trendTitle}
          variant="accent"
          accentTone="cool"
        >
          {!hasSubjects ? (
            <View style={styles.trendStateContainer}>
              <AppText variant="h3">{strings.home.noTrendTitle}</AppText>
              <AppText variant="bodySecondary" tone="secondary">
                {strings.home.noTrendDescription}
              </AppText>
              <AppButton
                label={strings.subjectsTab.add}
                onPress={() => router.push(createSubjectRoute)}
              />
            </View>
          ) : !hasRealTrendData ? (
            <View style={styles.trendStateContainer}>
              <AppText variant="h3">{strings.home.insufficientDataTitle}</AppText>
              <AppText variant="bodySecondary" tone="secondary">
                {strings.home.insufficientDataDescription}
              </AppText>
            </View>
          ) : (
            <>
              <View style={styles.trendHeader}>
                <AppText
                  variant="h1Compact"
                  tone={trendTone === "secondary" ? "primary" : trendTone}
                >
                  {trendIcon}
                </AppText>
                <View style={styles.trendCopy}>
                  <AppText variant="h3">{trendText}</AppText>
                  <AppText variant="caption" tone="secondary">
                    {strings.home.trendDescription}
                  </AppText>
                </View>
              </View>
              <MiniTrendChart points={heroMetrics.trendPoints} height={56} />
            </>
          )}
        </AppCard>

        <AppCard
          title={strings.home.featuredSubjectsTitle}
          subtitle={strings.home.featuredSubjectsSubtitle}
          variant="elevated"
        >
          {heroMetrics.featuredSubjects.length === 0 ? (
            <AppText variant="bodySecondary">
              {strings.home.emptyFeaturedSubjects}
            </AppText>
          ) : (
            <View style={styles.featuredList}>
              {heroMetrics.featuredSubjects.map((subject) => (
                <Pressable
                  key={subject.id}
                  onPress={() => router.push(`/subjects/${subject.id}` as Href)}
                  style={styles.featuredPressable}
                >
                  <View style={styles.featuredRow}>
                    <View
                      style={[
                        styles.subjectColorDot,
                        { backgroundColor: subject.color },
                      ]}
                    />
                    <View style={styles.featuredMain}>
                      <AppText
                        variant="h3"
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                      >
                        {subject.name}
                      </AppText>
                      <AppText variant="caption" tone="secondary">
                        {strings.home.averagePrefix}{" "}
                        {subject.currentAverage != null
                          ? subject.currentAverage.toFixed(2)
                          : strings.home.noGrades}{" "}
                        · {strings.home.pendingPrefix}{" "}
                        {subject.pendingEvaluations}
                      </AppText>
                    </View>
                    <AppBadge
                      label={academicStatusLabels[subject.status]}
                      tone={getStatusTone(subject.status)}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  welcomeContainer: {
    gap: spacing.sm,
  },
  welcomeButton: {
    marginTop: spacing.xs,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    gap: spacing.xs,
  },
  alertText: {
    paddingLeft: 2,
  },
  actionsList: {
    gap: spacing.md,
  },
  actionItem: {
    gap: spacing.sm,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  trendCopy: {
    flex: 1,
    gap: 2,
  },
  trendStateContainer: {
    gap: spacing.sm,
  },
  featuredList: {
    gap: spacing.md,
  },
  featuredPressable: {
    borderRadius: 12,
  },
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featuredMain: {
    flex: 1,
    gap: 2,
  },
  subjectColorDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
});

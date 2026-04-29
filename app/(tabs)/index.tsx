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
    alerts: [
      {
        id: "default-info",
        tone: "info",
        message: "Comienza creando tu primer ramo para activar el dashboard.",
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
      ? "Tendencia al alza"
      : heroMetrics.trendDirection === "down"
        ? "Tendencia a la baja"
        : "Tendencia estable";

  const trendTone =
    heroMetrics.trendDirection === "up"
      ? "success"
      : heroMetrics.trendDirection === "down"
        ? "warning"
        : "secondary";

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
    <AppScreen scrollable>
      <View style={styles.container}>
        <AppHeader />

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
        />

        <AppCard title="Tu situación actual" variant="elevated" showTopAccent>
          <View style={styles.statsGrid}>
            <AnimatedStatCard
              label="Promedio actual"
              value={
                heroMetrics.overallCurrentAverage != null
                  ? heroMetrics.overallCurrentAverage.toFixed(2)
                  : "Sin notas"
              }
              tone="info"
            />
            <AnimatedStatCard
              label="Cantidad de ramos"
              value={`${heroMetrics.totalSubjects}`}
              delay={60}
            />
            <AnimatedStatCard
              label="Ramos en riesgo"
              value={`${heroMetrics.subjectsAtRisk}`}
              tone={heroMetrics.subjectsAtRisk > 0 ? "warning" : "success"}
              delay={120}
            />
            <AnimatedStatCard
              label="Evaluaciones pendientes"
              value={`${heroMetrics.pendingEvaluations}`}
              tone={heroMetrics.pendingEvaluations > 0 ? "info" : "success"}
              delay={180}
            />
          </View>
        </AppCard>

        <AppCard
          title="Alertas académicas"
          variant="accent"
          accentTone={alertsAccentTone}
        >
          <View style={styles.alertsList}>
            {homeAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <AppBadge
                  label={
                    alert.tone === "danger"
                      ? "Crítica"
                      : alert.tone === "warning"
                        ? "Atención"
                        : alert.tone === "success"
                          ? "Positivo"
                          : "Info"
                  }
                  tone={alert.tone}
                />
                <AppText
                  variant="body"
                  tone="secondary"
                  style={styles.alertText}
                >
                  {alert.icon} {alert.message}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>

        <AppCard title="Insights" variant="glass" showTopAccent>
          <View style={styles.alertsList}>
            {homeInsights.map((insight) => (
              <View key={insight.id} style={styles.alertItem}>
                <AppBadge
                  label={
                    insight.tone === "danger"
                      ? "Riesgo"
                      : insight.tone === "warning"
                        ? "Atención"
                        : insight.tone === "success"
                          ? "Positivo"
                          : "Info"
                  }
                  tone={insight.tone}
                />
                <AppText
                  variant="body"
                  tone="secondary"
                  style={styles.alertText}
                >
                  {insight.icon} {insight.text}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>

        <AppCard title="Próximas acciones" variant="elevated">
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

        <AppCard title="Tendencia" variant="accent" accentTone="cool">
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
                Basada en el progreso rendido de tus ramos activos.
              </AppText>
            </View>
          </View>
          <MiniTrendChart points={heroMetrics.trendPoints} height={56} />
        </AppCard>

        <AppCard
          title="Tus ramos"
          subtitle="Destacados por prioridad académica"
          variant="elevated"
        >
          {heroMetrics.featuredSubjects.length === 0 ? (
            <AppText variant="body" tone="secondary">
              Aún no hay ramos para destacar. Crea tu primer ramo y comienza a
              construir tu panel.
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
                        Promedio:{" "}
                        {subject.currentAverage != null
                          ? subject.currentAverage.toFixed(2)
                          : "Sin notas"}{" "}
                        · Pendientes: {subject.pendingEvaluations}
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
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    gap: spacing.sm,
  },
  actionItem: {
    gap: spacing.xs,
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
  featuredList: {
    gap: spacing.sm,
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

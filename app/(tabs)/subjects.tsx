import { useFocusEffect } from "@react-navigation/native";
import { type Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
    AnimatedProgressBar,
    AnimatedStatCard,
    MiniTrendChart,
} from "@/src/components/charts";
import { AppHeader } from "@/src/components/layout/AppHeader";
import {
    AppBadge,
    AppButton,
    AppCard,
    AppScreen,
    AppText,
} from "@/src/components/ui";
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
    trendPoints: [8, 14, 22, 16, 28, 34],
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
    <AppScreen scrollable>
      <View style={styles.container}>
        <AppHeader />

        <AppCard variant="elevated" showTopAccent>
          <AppText variant="h3" style={{ color: theme.primary }}>
            Estado global de tus ramos
          </AppText>
          <AnimatedProgressBar
            value={heroMetrics.overallProgress}
            label="Progreso general rendido"
            duration={900}
            height={8}
          />
          <View style={styles.heroStatsRow}>
            <AnimatedStatCard
              label="Total"
              value={`${heroMetrics.totalSubjects}`}
              tone="info"
            />
            <AnimatedStatCard
              label="Con evaluaciones"
              value={`${heroMetrics.subjectsWithEvaluations}`}
              delay={80}
            />
            <AnimatedStatCard
              label="En riesgo"
              value={`${heroMetrics.subjectsAtRisk}`}
              tone={heroMetrics.subjectsAtRisk > 0 ? "warning" : "success"}
              delay={160}
            />
          </View>
          <MiniTrendChart points={heroMetrics.trendPoints} />
          {heroMetrics.totalSubjects === 0 ? (
            <AppText variant="caption" tone="secondary">
              Comienza agregando tu primer ramo para activar tu panel visual.
            </AppText>
          ) : null}
        </AppCard>

        {subjects.length === 0 ? (
          <AppCard title="Aún no tienes ramos registrados." variant="glass">
            <AppText variant="body" tone="secondary">
              Crea tu primer ramo para guardar evaluaciones, ponderaciones,
              notas pendientes y calcular tu estado académico durante el
              semestre.
            </AppText>
            <AppButton
              label="Agregar"
              style={styles.primaryAction}
              onPress={() => router.push(createSubjectRoute)}
            />
          </AppCard>
        ) : (
          <View style={styles.subjectsList}>
            <AppCard
              title="Tus ramos"
              subtitle="Guardados localmente en este dispositivo"
              variant="accent"
              accentTone="cool"
            >
              <AppButton
                label="Agregar"
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
                <AppCard variant="elevated" animateOnMount>
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
                  <AppText variant="body" tone="secondary">
                    Nota mínima: {subject.minimumGrade.toFixed(1)}
                  </AppText>
                  <AppBadge label="Sin evaluaciones" tone="pending" />
                </AppCard>
              </Pressable>
            ))}
          </View>
        )}

        <AppCard title="¿Qué podrás revisar por ramo?" variant="glass">
          <View style={styles.educationalList}>
            <AppText variant="body">Promedio ponderado actual</AppText>
            <AppText variant="body">Puntos acumulados</AppText>
            <AppText variant="body">Ponderación rendida y pendiente</AppText>
            <AppText variant="body">Nota necesaria para aprobar</AppText>
            <AppText variant="body">Estado académico automático</AppText>
            <AppText variant="body">
              Evaluación pendiente más importante
            </AppText>
          </View>
        </AppCard>

        <AppCard title="Siguiente mejora" variant="accent" accentTone="warm">
          <AppText variant="body" tone="secondary">
            Pronto podrás crear ramos, agregar evaluaciones y guardar tu avance
            localmente en el dispositivo.
          </AppText>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
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

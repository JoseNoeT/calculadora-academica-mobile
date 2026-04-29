import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

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
import { calculateAcademicSummary } from "@/src/features/calculator/utils/academicCalculator";
import {
    deleteEvaluation,
    getEvaluations,
} from "@/src/features/subjects/services/evaluationService";
import {
    deleteSubject,
    getSubjects,
} from "@/src/features/subjects/services/subjectService";
import type { EvaluationListItem } from "@/src/features/subjects/types/evaluation.types";
import type { SubjectListItem } from "@/src/features/subjects/types/subject.types";
import { spacing, useAppTheme } from "@/src/theme";
import type { AppTheme } from "@/src/theme/themes/theme.types";

function getStatusColor(theme: AppTheme, status: AcademicStatus): string {
  switch (status) {
    case "pending":
      return theme.academic.pending;
    case "approved":
    case "favorable":
      return theme.academic.approved;
    case "achievable":
      return theme.academic.achievable;
    case "atRisk":
      return theme.academic.atRisk;
    case "notAchievable":
      return theme.academic.notAchievable;
    case "failed":
      return theme.academic.failed;
    default:
      return theme.textSecondary;
  }
}

export default function SubjectDetailScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const [subject, setSubject] = useState<SubjectListItem | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);

  const loadData = useCallback(async () => {
    const [subjects, evals] = await Promise.all([
      getSubjects(),
      getEvaluations(params.id),
    ]);
    setSubject(subjects.find((s) => s.id === params.id) ?? null);
    setEvaluations(evals);
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const summary = useMemo(() => {
    if (!subject) {
      return null;
    }

    return calculateAcademicSummary({
      evaluations,
      passingGrade: subject.minimumGrade,
    });
  }, [subject, evaluations]);

  const summaryStatusColor = summary
    ? getStatusColor(theme, summary.status)
    : theme.textSecondary;

  const completedProgress = summary
    ? Math.max(0, Math.min(100, summary.completedWeight))
    : 0;

  const pendingProgress = summary
    ? Math.max(0, Math.min(100, summary.pendingWeight))
    : 0;

  const handleAddEvaluation = () => {
    router.push(`/subjects/${params.id}/create-evaluation` as never);
  };

  const handleEditSubject = () => {
    router.push(`/subjects/${params.id}/edit` as never);
  };

  const handleEditEvaluation = (evaluation: EvaluationListItem) => {
    router.push(
      `/subjects/${params.id}/evaluations/${evaluation.id}/edit` as never,
    );
  };

  const handleDeleteEvaluation = (evaluation: EvaluationListItem) => {
    Alert.alert(
      "Eliminar evaluación",
      `¿Eliminar "${evaluation.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteEvaluation(evaluation.id);
            void loadData();
          },
        },
      ],
    );
  };

  const handleDeleteSubject = () => {
    if (!subject || isDeletingSubject) {
      return;
    }

    Alert.alert(
      "¿Eliminar este ramo?",
      "También se eliminarán todas sus evaluaciones asociadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar ramo",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeletingSubject(true);
              await deleteSubject(subject.id);
              router.replace("/subjects" as never);
            } catch {
              setIsDeletingSubject(false);
              Alert.alert(
                "No se pudo eliminar",
                "Intenta nuevamente en unos segundos.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: subject?.name ?? "Detalle del ramo" }} />
      <View style={styles.container}>
        <AppHeader />

        {subject ? (
          <>
            <View style={styles.headerSection}>
              <AppBadge label="Detalle del ramo" tone="info" />
              <AppText variant="h1" align="center" numberOfLines={2}>
                {subject.name}
              </AppText>
              <AppText variant="body" tone="secondary" align="center">
                Controla tus evaluaciones y avance académico en este ramo.
              </AppText>
            </View>

            <AppCard title="Resumen del ramo" variant="elevated" showTopAccent>
              <View style={styles.rowBetween}>
                <AppText variant="label" tone="secondary">
                  Nota mínima
                </AppText>
                <AppText variant="h3">
                  {subject.minimumGrade.toFixed(1)}
                </AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="label" tone="secondary">
                  Color
                </AppText>
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: subject.color,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>
              <AppButton
                label="Editar ramo"
                variant="outline"
                style={styles.editSubjectButton}
                onPress={handleEditSubject}
              />
            </AppCard>

            {summary ? (
              <>
                <AppCard title="Resumen académico" variant="elevated">
                  <View
                    style={[
                      styles.mainStatusCard,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: summaryStatusColor,
                      },
                    ]}
                  >
                    <AppText variant="caption" tone="secondary">
                      Estado académico
                    </AppText>
                    <AppBadge
                      label={academicStatusLabels[summary.status]}
                      tone={
                        summary.status === "approved" ||
                        summary.status === "favorable"
                          ? "success"
                          : summary.status === "atRisk" ||
                              summary.status === "notAchievable" ||
                              summary.status === "failed"
                            ? "danger"
                            : summary.status === "pending"
                              ? "pending"
                              : "info"
                      }
                    />
                  </View>

                  <View style={styles.metricGrid}>
                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <AppText variant="caption" tone="secondary">
                        Promedio actual
                      </AppText>
                      <AppText variant="metric">
                        {summary.currentAverage != null
                          ? summary.currentAverage.toFixed(2)
                          : "Sin notas todavía"}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <AppText variant="caption" tone="secondary">
                        Nota necesaria
                      </AppText>
                      <AppText variant="metric">
                        {summary.requiredGrade != null
                          ? summary.requiredGrade.toFixed(2)
                          : summary.pendingWeight > 0
                            ? "Pendiente de cálculo"
                            : "Sin pendientes"}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <AppText variant="caption" tone="secondary">
                        Ponderación rendida
                      </AppText>
                      <AppText variant="h3">
                        {summary.completedWeight.toFixed(2)}%
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <AppText variant="caption" tone="secondary">
                        Ponderación pendiente
                      </AppText>
                      <AppText variant="h3">
                        {summary.pendingWeight.toFixed(2)}%
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <AppText variant="caption" tone="secondary">
                        Puntos acumulados
                      </AppText>
                      <AppText variant="h3">
                        {summary.accumulatedPoints.toFixed(2)}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.rowBetween}>
                      <AppText variant="caption" tone="secondary">
                        Progreso rendido
                      </AppText>
                      <AppText variant="caption">
                        {summary.completedWeight.toFixed(2)}%
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.progressTrack,
                        { backgroundColor: theme.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${completedProgress}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>

                    <View
                      style={[styles.rowBetween, styles.pendingProgressRow]}
                    >
                      <AppText variant="caption" tone="secondary">
                        Progreso pendiente
                      </AppText>
                      <AppText variant="caption">
                        {summary.pendingWeight.toFixed(2)}%
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.progressTrack,
                        { backgroundColor: theme.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pendingProgress}%`,
                            backgroundColor: theme.academic.atRisk,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </AppCard>

                <AppCard
                  title="Consejo académico"
                  variant="accent"
                  accentTone={
                    summary.status === "atRisk" ||
                    summary.status === "notAchievable" ||
                    summary.status === "failed"
                      ? "warm"
                      : "cool"
                  }
                >
                  <View
                    style={[
                      styles.adviceCard,
                      {
                        borderColor: summaryStatusColor,
                        backgroundColor: theme.surface,
                      },
                    ]}
                  >
                    <AppText variant="body" tone="secondary">
                      {summary.advice}
                    </AppText>
                  </View>
                </AppCard>
              </>
            ) : null}

            <AppCard
              title="Evaluaciones"
              subtitle={
                evaluations.length > 0
                  ? `${evaluations.length} registrada${evaluations.length > 1 ? "s" : ""}`
                  : undefined
              }
              variant="elevated"
            >
              {evaluations.length === 0 ? (
                <View style={styles.emptyStateCard}>
                  <AppText variant="body" tone="secondary">
                    Aún no tienes evaluaciones. Agrega la primera para calcular
                    tu avance.
                  </AppText>
                </View>
              ) : (
                <View style={styles.evaluationsList}>
                  {evaluations.map((evaluation) => (
                    <AppCard key={evaluation.id} variant="glass" animateOnMount>
                      <View style={styles.evaluationHeader}>
                        <AppText
                          variant="h3"
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          minimumFontScale={0.85}
                        >
                          {evaluation.name}
                        </AppText>
                        <View style={styles.evaluationBadge}>
                          {evaluation.isPending ? (
                            <AppBadge label="Pendiente" tone="pending" />
                          ) : (
                            <AppBadge
                              label={`Nota ${evaluation.grade?.toFixed(1) ?? "—"}`}
                              tone={
                                typeof evaluation.grade === "number" &&
                                evaluation.grade >= subject.minimumGrade
                                  ? "success"
                                  : "warning"
                              }
                            />
                          )}
                        </View>
                      </View>

                      <View style={styles.rowBetween}>
                        <AppText tone="secondary" variant="caption">
                          Ponderación
                        </AppText>
                        <AppText variant="caption">
                          {evaluation.weight.toFixed(2)}%
                        </AppText>
                      </View>

                      <View
                        style={[
                          styles.evaluationActions,
                          { borderTopColor: theme.border },
                        ]}
                      >
                        <AppButton
                          label="Editar"
                          variant="outline"
                          style={styles.evaluationActionButton}
                          onPress={() => handleEditEvaluation(evaluation)}
                        />
                        <AppButton
                          label="Eliminar"
                          variant="outline"
                          style={styles.evaluationDeleteButton}
                          onPress={() =>
                            void handleDeleteEvaluation(evaluation)
                          }
                        />
                      </View>
                    </AppCard>
                  ))}
                </View>
              )}

              <AppButton
                label="Agregar evaluación"
                variant="outline"
                style={styles.addButton}
                onPress={handleAddEvaluation}
              />
            </AppCard>

            <AppCard title="Zona de riesgo" variant="accent" accentTone="warm">
              <AppText variant="body" tone="secondary">
                Esta acción eliminará el ramo y todas sus evaluaciones en este
                dispositivo.
              </AppText>
              <AppButton
                label={
                  isDeletingSubject ? "Eliminando ramo..." : "Eliminar ramo"
                }
                variant="outline"
                style={styles.deleteSubjectButton}
                onPress={() => void handleDeleteSubject()}
              />
            </AppCard>
          </>
        ) : (
          <AppCard title="Ramo no encontrado">
            <AppText variant="body" tone="secondary">
              No se encontró el ramo. Intenta volver atrás.
            </AppText>
          </AppCard>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  headerSection: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 999,
  },
  mainStatusCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metricCard: {
    width: "48%",
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  progressSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  pendingProgressRow: {
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
  adviceCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  evaluationsList: {
    gap: spacing.sm,
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  evaluationBadge: {
    alignItems: "flex-end",
  },
  evaluationActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  evaluationActionButton: {
    flex: 1,
    minHeight: 50,
  },
  evaluationDeleteButton: {
    flex: 1,
    minHeight: 50,
    borderColor: "#D14343",
  },
  addButton: {
    marginTop: spacing.md,
    minHeight: 50,
  },
  deleteSubjectButton: {
    marginTop: spacing.sm,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#D14343",
  },
  editSubjectButton: {
    marginTop: spacing.sm,
    minHeight: 50,
  },
  emptyStateCard: {
    paddingVertical: spacing.sm,
  },
});

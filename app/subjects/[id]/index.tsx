import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";

import { AcademicSummaryPanel } from "@/src/components/academic";
import { AppScreenHeader } from "@/src/components/layout/AppScreenHeader";
import {
    AppBadge,
    AppButton,
    AppCard,
    AppScreen,
    AppText,
} from "@/src/components/ui";
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
    console.log("[DeleteEvaluation] Handler iniciado", evaluation.id);

    const performDelete = async () => {
      console.log("[DeleteEvaluation] Confirmado", evaluation.id);
      try {
        await deleteEvaluation(evaluation.id);
        console.log("[DeleteEvaluation] Eliminación ejecutada", evaluation.id);
        setEvaluations((current) =>
          current.filter((item) => item.id !== evaluation.id),
        );
        await loadData();
        console.log("[DeleteEvaluation] Datos recargados");
      } catch (error) {
        console.error("[DeleteEvaluation] Error:", error);
        setTimeout(() => {
          Alert.alert(
            "Error",
            "No se pudo eliminar la evaluación. Inténtalo nuevamente.",
          );
        }, 300);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `¿Eliminar "${evaluation.name}"? Esta acción no se puede deshacer.`,
      );
      if (confirmed) {
        void performDelete();
      }
    } else {
      Alert.alert(
        "Eliminar evaluación",
        `¿Eliminar "${evaluation.name}"? Esta acción no se puede deshacer.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              void performDelete();
            },
          },
        ],
      );
    }
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
    <AppScreen padded={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerZone}>
        <AppScreenHeader backLabel="Ramos" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
        {subject ? (
          <>
            <AppCard variant="elevated" showTopAccent>
              <View style={styles.heroIdentityRow}>
                <View
                  style={[
                    styles.heroColorDot,
                    { backgroundColor: subject.color, borderColor: theme.border },
                  ]}
                />
                <AppText
                  variant="h2"
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  style={styles.heroName}
                >
                  {subject.name}
                </AppText>
              </View>
              <View style={styles.heroActionsRow}>
                <AppBadge
                  label={`Nota mín. ${subject.minimumGrade.toFixed(1)}`}
                  tone="info"
                />
                <AppButton
                  label="Editar ramo"
                  variant="outline"
                  style={styles.heroEditButton}
                  onPress={handleEditSubject}
                />
              </View>
            </AppCard>

            {summary ? (
              <>
                <AcademicSummaryPanel
                  accumulatedPoints={summary.accumulatedPoints}
                  currentWeightedAverage={summary.currentAverage}
                  completedWeight={summary.completedWeight}
                  pendingWeight={summary.pendingWeight}
                  requiredGrade={summary.requiredGrade}
                  finalProjectedGrade={
                    summary.pendingWeight <= 0 ? summary.currentAverage : null
                  }
                  finalProjectedGradeLabel={
                    summary.pendingWeight <= 0
                      ? summary.currentAverage != null
                        ? summary.currentAverage.toFixed(2)
                        : "Sin notas"
                      : "Pendiente"
                  }
                  requiredGradeLabel={
                    summary.requiredGrade != null
                      ? summary.requiredGrade.toFixed(2)
                      : summary.pendingWeight > 0
                        ? "Pendiente de cálculo"
                        : "Sin pendientes"
                  }
                  status={summary.status}
                  advice={summary.advice}
                  minimumGrade={subject.minimumGrade}
                />
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
              {summary ? (
                <View style={styles.weightNoticeContainer}>
                  <AppText variant="caption" tone="secondary">
                    {(() => {
                      const totalAssigned =
                        summary.completedWeight + summary.pendingWeight;
                      const unassigned = 100 - totalAssigned;

                      if (totalAssigned < 100) {
                        return `Tus evaluaciones suman ${totalAssigned.toFixed(2)}%. Falta asignar ${unassigned.toFixed(2)}%.`;
                      }

                      if (totalAssigned === 100) {
                        return "Las ponderaciones completan 100%.";
                      }

                      return `Tus evaluaciones superan el 100% por ${(totalAssigned - 100).toFixed(2)}%.`;
                    })()}
                  </AppText>
                </View>
              ) : null}

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
                          onPress={() => {
                            console.log("[DeleteEvaluation] Botón presionado", evaluation.id);
                            handleDeleteEvaluation(evaluation);
                          }}
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
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerZone: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    gap: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroColorDot: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2,
    flexShrink: 0,
  },
  heroName: {
    flex: 1,
  },
  heroActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  heroEditButton: {
    minHeight: 40,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  weightNoticeContainer: {
    marginBottom: spacing.sm,
  },
  deleteSubjectButton: {
    marginTop: spacing.sm,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#D14343",
  },
  emptyStateCard: {
    paddingVertical: spacing.sm,
  },
});

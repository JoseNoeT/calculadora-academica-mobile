import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
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
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { academicStatusLabels } from "@/src/domain/entities";
import { MAX_GRADE, MIN_GRADE } from "@/src/domain/rules";
import {
    calculateAcademicSummary,
    type AcademicSummary,
} from "@/src/features/calculator/utils/academicCalculator";
import { getEvaluations } from "@/src/features/subjects/services/evaluationService";
import { getSubjects } from "@/src/features/subjects/services/subjectService";
import type { EvaluationListItem } from "@/src/features/subjects/types/evaluation.types";
import type { SubjectListItem } from "@/src/features/subjects/types/subject.types";
import { spacing, useAppTheme } from "@/src/theme";

export default function SimulatorScreen() {
  const { theme } = useAppTheme();
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);
  const [simulatedGradeInput, setSimulatedGradeInput] = useState("");
  const [simulatedGradeError, setSimulatedGradeError] = useState<
    string | undefined
  >(undefined);
  const [projectedSummary, setProjectedSummary] =
    useState<AcademicSummary | null>(null);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  );

  const pendingEvaluations = useMemo(
    () => evaluations.filter((evaluation) => evaluation.isPending),
    [evaluations],
  );

  const selectedPendingEvaluation = useMemo(
    () =>
      pendingEvaluations.find(
        (evaluation) => evaluation.id === selectedEvaluationId,
      ) ?? null,
    [pendingEvaluations, selectedEvaluationId],
  );

  const currentSummary = useMemo(() => {
    if (!selectedSubject) {
      return null;
    }

    return calculateAcademicSummary({
      evaluations,
      passingGrade: selectedSubject.minimumGrade,
    });
  }, [evaluations, selectedSubject]);

  const toGradePercent = (grade: number | null | undefined) => {
    if (typeof grade !== "number") {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, ((grade - MIN_GRADE) / (MAX_GRADE - MIN_GRADE)) * 100),
    );
  };

  const initialAveragePercent = toGradePercent(currentSummary?.currentAverage);
  const projectedAveragePercent = toGradePercent(
    projectedSummary?.currentAverage ?? currentSummary?.currentAverage,
  );

  const trendPoints = projectedSummary
    ? [
        Math.max(10, Math.round(initialAveragePercent * 0.6)),
        Math.round(initialAveragePercent),
        Math.round(projectedAveragePercent),
      ]
    : [12, 22, 18, 30, 26, 38];

  const loadSubjects = useCallback(async () => {
    const items = await getSubjects();
    setSubjects(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSubjects();
    }, [loadSubjects]),
  );

  const loadSubjectEvaluations = useCallback(async (subjectId: string) => {
    const items = await getEvaluations(subjectId);
    setEvaluations(items);
  }, []);

  const handleSelectSubject = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedEvaluationId(null);
    setSimulatedGradeInput("");
    setSimulatedGradeError(undefined);
    setProjectedSummary(null);
    await loadSubjectEvaluations(subjectId);
  };

  const handleSelectPendingEvaluation = (evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    setSimulatedGradeError(undefined);
    setProjectedSummary(null);
  };

  const handleSimulatedGradeChange = (value: string) => {
    setSimulatedGradeInput(value);
    setSimulatedGradeError(undefined);
    setProjectedSummary(null);
  };

  const handleCalculateProjection = () => {
    if (!selectedSubject || !selectedPendingEvaluation) {
      return;
    }

    const rawValue = simulatedGradeInput.replace(",", ".").trim();
    const parsedGrade = Number(rawValue);

    if (!rawValue) {
      setSimulatedGradeError("La nota simulada es obligatoria.");
      setProjectedSummary(null);
      return;
    }

    if (Number.isNaN(parsedGrade)) {
      setSimulatedGradeError("Ingresa una nota válida usando números.");
      setProjectedSummary(null);
      return;
    }

    if (parsedGrade < MIN_GRADE || parsedGrade > MAX_GRADE) {
      setSimulatedGradeError(
        `La nota debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`,
      );
      setProjectedSummary(null);
      return;
    }

    setSimulatedGradeError(undefined);

    const simulatedEvaluations = evaluations.map((evaluation) =>
      evaluation.id === selectedPendingEvaluation.id
        ? {
            ...evaluation,
            grade: parsedGrade,
            isPending: false,
          }
        : evaluation,
    );

    const summary = calculateAcademicSummary({
      evaluations: simulatedEvaluations,
      passingGrade: selectedSubject.minimumGrade,
    });

    setProjectedSummary(summary);
  };

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <AppHeader />

        <AppCard variant="elevated" showTopAccent>
          <AppText variant="h3" style={{ color: theme.primary }}>
            Escenario visual
          </AppText>

          <MiniTrendChart points={trendPoints} />

          <AnimatedProgressBar
            value={Math.round(initialAveragePercent)}
            label="Estado inicial"
            duration={780}
            height={8}
          />
          <AnimatedProgressBar
            value={Math.round(projectedAveragePercent)}
            label="Proyección simulada"
            duration={920}
            height={8}
          />

          <View style={styles.heroStatsRow}>
            <AnimatedStatCard
              label="Estado inicial"
              value={
                currentSummary
                  ? academicStatusLabels[currentSummary.status]
                  : "Sin base"
              }
              tone="info"
            />
            <AnimatedStatCard
              label="Proyección"
              value={
                projectedSummary
                  ? academicStatusLabels[projectedSummary.status]
                  : "Sin simulación"
              }
              tone={projectedSummary ? "success" : "secondary"}
              delay={110}
            />
          </View>

          {!projectedSummary ? (
            <AppText variant="caption" tone="secondary">
              Prueba una nota y mira cómo cambia tu escenario
            </AppText>
          ) : null}
        </AppCard>

        <AppCard title="Importante" variant="accent" accentTone="warm">
          <AppBadge label="No modifica tus datos" tone="warning" />
          <AppText variant="body" tone="secondary">
            Esta simulación no modifica tus notas reales.
          </AppText>
        </AppCard>

        <AppCard title="1. Selecciona un ramo" variant="elevated">
          {subjects.length === 0 ? (
            <AppText variant="body" tone="secondary">
              No hay ramos disponibles para simular.
            </AppText>
          ) : (
            <View style={styles.selectionList}>
              {subjects.map((subject) => {
                const isSelected = selectedSubjectId === subject.id;

                return (
                  <Pressable
                    key={subject.id}
                    style={[
                      styles.selectionCard,
                      {
                        borderColor: isSelected ? theme.primary : theme.border,
                        backgroundColor: isSelected
                          ? theme.surfaceElevated
                          : theme.surface,
                      },
                    ]}
                    onPress={() => void handleSelectSubject(subject.id)}
                  >
                    <AppText
                      variant="h3"
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {subject.name}
                    </AppText>
                    <AppText tone="secondary" variant="caption">
                      Nota mínima: {subject.minimumGrade.toFixed(1)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </AppCard>

        {selectedSubject ? (
          <AppCard
            title="2. Selecciona evaluación pendiente"
            variant="elevated"
          >
            {evaluations.length === 0 ? (
              <AppText variant="body" tone="secondary">
                Este ramo aún no tiene evaluaciones registradas.
              </AppText>
            ) : pendingEvaluations.length === 0 ? (
              <AppText variant="body" tone="secondary">
                Este ramo no tiene evaluaciones pendientes para simular.
              </AppText>
            ) : (
              <View style={styles.selectionList}>
                {pendingEvaluations.map((evaluation) => {
                  const isSelected = selectedEvaluationId === evaluation.id;

                  return (
                    <Pressable
                      key={evaluation.id}
                      style={[
                        styles.selectionCard,
                        {
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                          backgroundColor: isSelected
                            ? theme.surfaceElevated
                            : theme.surface,
                        },
                      ]}
                      onPress={() =>
                        handleSelectPendingEvaluation(evaluation.id)
                      }
                    >
                      <AppText
                        variant="h3"
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                      >
                        {evaluation.name}
                      </AppText>
                      <AppText tone="secondary" variant="caption">
                        Ponderación: {evaluation.weight.toFixed(2)}%
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </AppCard>
        ) : null}

        {selectedPendingEvaluation ? (
          <AppCard title="3. Nota simulada" variant="glass">
            <AppInput
              label="Ingresa la nota simulada"
              value={simulatedGradeInput}
              onChangeText={handleSimulatedGradeChange}
              keyboardType="decimal-pad"
              placeholder="Ej: 5.5"
              error={simulatedGradeError}
            />
            <AppButton
              label="Calcular"
              style={styles.calculateButton}
              onPress={handleCalculateProjection}
            />
          </AppCard>
        ) : null}

        {projectedSummary ? (
          <AppCard
            title="4. Resultado proyectado"
            variant="accent"
            accentTone="cool"
          >
            <View style={styles.resultList}>
              <View style={styles.rowBetween}>
                <AppText variant="body" tone="secondary">
                  Promedio proyectado
                </AppText>
                <AppText variant="metric">
                  {projectedSummary.currentAverage != null
                    ? projectedSummary.currentAverage.toFixed(2)
                    : "Sin notas válidas"}
                </AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="body" tone="secondary">
                  Estado proyectado
                </AppText>
                <AppBadge
                  label={academicStatusLabels[projectedSummary.status]}
                  tone={
                    projectedSummary.status === "approved" ||
                    projectedSummary.status === "favorable"
                      ? "success"
                      : projectedSummary.status === "atRisk" ||
                          projectedSummary.status === "notAchievable" ||
                          projectedSummary.status === "failed"
                        ? "danger"
                        : projectedSummary.status === "pending"
                          ? "pending"
                          : "info"
                  }
                />
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="body" tone="secondary">
                  Nota necesaria proyectada
                </AppText>
                <AppText variant="h3">
                  {projectedSummary.requiredGrade != null
                    ? projectedSummary.requiredGrade.toFixed(2)
                    : "Sin pendientes"}
                </AppText>
              </View>
            </View>
            <AppCard variant="glass" animateOnMount>
              <AppText variant="body" tone="secondary">
                {projectedSummary.advice}
              </AppText>
            </AppCard>
          </AppCard>
        ) : null}
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
    gap: spacing.sm,
  },
  selectionList: {
    gap: spacing.sm,
  },
  selectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  calculateButton: {
    marginTop: spacing.sm,
    minHeight: 52,
  },
  resultList: {
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
});

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
import { strings } from "@/src/constants/strings";
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
    : currentSummary
      ? [
          Math.max(8, Math.round(initialAveragePercent * 0.6)),
          Math.max(10, Math.round(initialAveragePercent * 0.8)),
          Math.round(initialAveragePercent),
        ]
      : [];

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
      setSimulatedGradeError(strings.simulator.simulatedGradeRequired);
      setProjectedSummary(null);
      return;
    }

    if (Number.isNaN(parsedGrade)) {
      setSimulatedGradeError(strings.simulator.simulatedGradeInvalid);
      setProjectedSummary(null);
      return;
    }

    if (parsedGrade < MIN_GRADE || parsedGrade > MAX_GRADE) {
      setSimulatedGradeError(
        strings.simulator.gradeRangeError(MIN_GRADE, MAX_GRADE),
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
    <AppScreen scrollable stickyHeader={<AppHeader />}>
      <View style={styles.container}>
        <AppCard variant="elevated" showTopAccent>
          <AppText variant="sectionTitle" tone="accent">
            {strings.simulator.heroTitle}
          </AppText>

          <MiniTrendChart points={trendPoints} />

          <AnimatedProgressBar
            value={Math.round(initialAveragePercent)}
            label={strings.simulator.initialState}
            duration={780}
            height={8}
          />
          <AnimatedProgressBar
            value={Math.round(projectedAveragePercent)}
            label={strings.simulator.simulatedProjection}
            duration={920}
            height={8}
          />

          <View style={styles.heroStatsRow}>
            <AnimatedStatCard
              label={strings.simulator.initialState}
              value={
                currentSummary
                  ? academicStatusLabels[currentSummary.status]
                  : strings.simulator.noBase
              }
              tone="info"
            />
            <AnimatedStatCard
              label={strings.simulator.projection}
              value={
                projectedSummary
                  ? academicStatusLabels[projectedSummary.status]
                  : strings.simulator.noSimulation
              }
              tone={projectedSummary ? "success" : "secondary"}
              delay={110}
            />
          </View>

          {!projectedSummary ? (
            <AppText variant="caption" tone="secondary">
              {strings.simulator.hint}
            </AppText>
          ) : null}
        </AppCard>

        <AppCard
          title={strings.simulator.importantTitle}
          variant="accent"
          accentTone="warm"
        >
          <AppBadge label={strings.simulator.noDataChanges} tone="warning" />
          <AppText variant="bodySecondary">
            {strings.simulator.noDataChangesDescription}
          </AppText>
        </AppCard>

        <AppCard
          title={strings.simulator.selectSubjectTitle}
          variant="elevated"
        >
          {subjects.length === 0 ? (
            <AppText variant="bodySecondary">
              {strings.simulator.noSubjects}
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
                      {strings.simulator.minimumGradePrefix}{" "}
                      {subject.minimumGrade.toFixed(1)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </AppCard>

        {selectedSubject ? (
          <AppCard
            title={strings.simulator.selectPendingEvaluationTitle}
            variant="elevated"
          >
            {evaluations.length === 0 ? (
              <AppText variant="bodySecondary">
                {strings.simulator.noEvaluations}
              </AppText>
            ) : pendingEvaluations.length === 0 ? (
              <AppText variant="bodySecondary">
                {strings.simulator.noPendingEvaluations}
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
                        {strings.simulator.weightPrefix}{" "}
                        {evaluation.weight.toFixed(2)}%
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </AppCard>
        ) : null}

        {selectedPendingEvaluation ? (
          <AppCard
            title={strings.simulator.simulatedGradeTitle}
            variant="glass"
          >
            <AppInput
              label={strings.simulator.simulatedGradeLabel}
              value={simulatedGradeInput}
              onChangeText={handleSimulatedGradeChange}
              keyboardType="decimal-pad"
              placeholder={strings.simulator.simulatedGradePlaceholder}
              error={simulatedGradeError}
            />
            <AppButton
              label={strings.simulator.calculate}
              style={styles.calculateButton}
              onPress={handleCalculateProjection}
            />
          </AppCard>
        ) : null}

        {projectedSummary ? (
          <AppCard
            title={strings.simulator.resultTitle}
            variant="accent"
            accentTone="cool"
          >
            <View style={styles.resultList}>
              <View style={styles.rowBetween}>
                <AppText variant="bodySecondary">
                  {strings.simulator.projectedAverage}
                </AppText>
                <AppText variant="metricValue">
                  {projectedSummary.currentAverage != null
                    ? projectedSummary.currentAverage.toFixed(2)
                    : strings.simulator.noValidGrades}
                </AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="bodySecondary">
                  {strings.simulator.projectedStatus}
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
                <AppText variant="bodySecondary">
                  {strings.simulator.projectedRequiredGrade}
                </AppText>
                <AppText variant="h3">
                  {projectedSummary.requiredGrade != null
                    ? projectedSummary.requiredGrade.toFixed(2)
                    : strings.simulator.noPending}
                </AppText>
              </View>
            </View>
            <AppCard variant="glass" animateOnMount>
              <AppText variant="bodySecondary">
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
    gap: spacing.lg,
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

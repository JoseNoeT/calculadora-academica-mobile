import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
    Animated,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { AcademicSummaryPanel } from "@/src/components/academic";
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
import type { Evaluation, Subject } from "@/src/domain/entities";
import { academicStatusLabels } from "@/src/domain/entities";
import {
    DEFAULT_PASSING_GRADE,
    MAX_GRADE,
    MIN_GRADE,
} from "@/src/domain/rules";
import { calculateQuickAcademicSummary } from "@/src/features/calculator/services/calculatorService";
import { parseAcademicNumber } from "@/src/domain/utils/parseAcademicNumber";
import { spacing, useAppTheme } from "@/src/theme";

type QuickEvaluationForm = {
  id: string;
  name: string;
  grade: string;
  weight: string;
};

const INITIAL_EVALUATIONS: QuickEvaluationForm[] = [
  {
    id: "evaluation-1",
    name: strings.quickCalculator.initialEvaluationName(1),
    grade: "",
    weight: "32",
  },
  {
    id: "evaluation-2",
    name: strings.quickCalculator.initialEvaluationName(2),
    grade: "",
    weight: "12",
  },
  {
    id: "evaluation-3",
    name: strings.quickCalculator.initialEvaluationName(3),
    grade: "",
    weight: "32",
  },
  {
    id: "evaluation-4",
    name: strings.quickCalculator.initialEvaluationName(4),
    grade: "",
    weight: "12",
  },
  {
    id: "evaluation-5",
    name: strings.quickCalculator.initialEvaluationName(5),
    grade: "",
    weight: "12",
  },
];

function createEvaluationPayload(
  subjectId: string,
  minimumGrade: number,
  form: QuickEvaluationForm,
): Evaluation {
  const parsedGrade = parseAcademicNumber(form.grade);
  const parsedWeight = parseAcademicNumber(form.weight);
  const now = new Date().toISOString();

  return {
    id: form.id,
    subjectId,
    name: form.name.trim() || strings.quickCalculator.defaultEvaluationName,
    grade: parsedGrade,
    weight: parsedWeight ?? 0,
    minimumGrade,
    isPending: parsedGrade === null,
    createdAt: now,
    updatedAt: now,
  };
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

function formatSummaryGrade(value: number | null | undefined): string {
  if (typeof value !== "number") {
    return strings.quickCalculator.pending;
  }

  return value.toFixed(2);
}

type EntryCardProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

function EntryCard({ children, delay = 0, style }: EntryCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.entryCard,
        style,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function QuickCalculatorScreen() {
  const { theme } = useAppTheme();
  const [minimumGradeInput, setMinimumGradeInput] = useState(
    DEFAULT_PASSING_GRADE.toFixed(1),
  );
  const [evaluations, setEvaluations] =
    useState<QuickEvaluationForm[]>(INITIAL_EVALUATIONS);

  const parsedMinimumGrade = parseAcademicNumber(minimumGradeInput);
  const isMinimumGradeValid =
    parsedMinimumGrade !== null &&
    parsedMinimumGrade >= MIN_GRADE &&
    parsedMinimumGrade <= MAX_GRADE;

  const subject: Subject = useMemo(() => {
    const now = new Date().toISOString();

    return {
      id: "quick-calculator-subject",
      name: strings.quickCalculator.quickSubjectName,
      passingGrade: isMinimumGradeValid
        ? parsedMinimumGrade
        : DEFAULT_PASSING_GRADE,
      accumulatedWeight: 0,
      createdAt: now,
      updatedAt: now,
    };
  }, [isMinimumGradeValid, parsedMinimumGrade]);

  const evaluationPayload = useMemo(
    () =>
      evaluations.map((evaluation) =>
        createEvaluationPayload(subject.id, subject.passingGrade, evaluation),
      ),
    [evaluations, subject.id, subject.passingGrade],
  );

  const summary = useMemo(
    () =>
      calculateQuickAcademicSummary({
        subject,
        evaluations: evaluationPayload,
      }),
    [subject, evaluationPayload],
  );

  const totalWeight = useMemo(
    () =>
      evaluationPayload.reduce(
        (total, evaluation) => total + evaluation.weight,
        0,
      ),
    [evaluationPayload],
  );

  const hasCompleteWeight = Math.abs(totalWeight - 100) < 0.0001;
  const weightWarning = !hasCompleteWeight;

  const displayRequiredGrade = hasCompleteWeight
    ? summary.requiredGrade == null
      ? strings.quickCalculator.statusNotAvailable
      : summary.requiredGrade.toFixed(2)
    : strings.quickCalculator.reviewWeights;

  const displayFinalProjectedGrade = hasCompleteWeight
    ? formatSummaryGrade(summary.finalGrade)
    : strings.quickCalculator.reviewWeights;

  const displayStatusLabel = hasCompleteWeight
    ? academicStatusLabels[summary.status]
    : strings.quickCalculator.pending;

  const displayAdvice = hasCompleteWeight
    ? (summary.advice ?? strings.quickCalculator.noAdvice)
    : strings.quickCalculator.completeWeightsAdvice;

  const completedProgress = Math.max(0, Math.min(100, summary.completedWeight));

  const statusTone =
    summary.status === "approved" || summary.status === "favorable"
      ? "success"
      : summary.status === "atRisk" ||
          summary.status === "notAchievable" ||
          summary.status === "failed"
        ? "danger"
        : summary.status === "pending"
          ? "pending"
          : "info";

  const glassSurface =
    theme.mode === "dark"
      ? "rgba(51, 65, 85, 0.44)"
      : "rgba(255, 255, 255, 0.78)";
  const glassBorder =
    theme.mode === "dark"
      ? "rgba(148, 163, 184, 0.26)"
      : "rgba(148, 163, 184, 0.34)";

  const updateEvaluation = (
    id: string,
    key: keyof QuickEvaluationForm,
    value: string,
  ) => {
    setEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === id ? { ...evaluation, [key]: value } : evaluation,
      ),
    );
  };

  const addEvaluation = () => {
    setEvaluations((current) => [
      ...current,
      {
        id: `evaluation-${Date.now()}`,
        name: strings.quickCalculator.evaluationPlaceholder(current.length + 1),
        grade: "",
        weight: "",
      },
    ]);
  };

  const removeEvaluation = (id: string) => {
    setEvaluations((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((evaluation) => evaluation.id !== id);
    });
  };

  const resetCalculator = () => {
    setMinimumGradeInput(DEFAULT_PASSING_GRADE.toFixed(1));
    setEvaluations(INITIAL_EVALUATIONS);
  };

  return (
    <AppScreen scrollable stickyHeader={<AppHeader />}>
      <View style={styles.container}>
        <EntryCard>
          <View style={styles.heroRoot}>
            <View style={styles.heroOrbs} pointerEvents="none">
              <View style={styles.heroOrbBlue} />
              <View style={styles.heroOrbCyan} />
              <View style={styles.heroOrbOrange} />
            </View>

            <View
              style={[
                styles.heroCard,
                { backgroundColor: glassSurface, borderColor: glassBorder },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(37,99,235,0.85)",
                  "rgba(6,182,212,0.52)",
                  "rgba(249,115,22,0.30)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heroGlowLine}
              />

              <View style={styles.heroHeader}>
                <AppText variant="cardTitle" style={styles.heroMainMessage}>
                  {strings.quickCalculator.heroTitle}
                </AppText>
                <AppText variant="bodySecondary">
                  {strings.quickCalculator.heroDescription}
                </AppText>
                <AppBadge label={displayStatusLabel} tone={statusTone} />
              </View>

              <View
                style={[
                  styles.heroGuideCard,
                  {
                    backgroundColor: glassSurface,
                    borderColor: glassBorder,
                  },
                ]}
              >
                <View style={styles.heroStepsRow}>
                  <View style={styles.heroStepPill}>
                    <AppText variant="caption" tone="secondary" align="center">
                      {strings.quickCalculator.stepDefineWeights}
                    </AppText>
                  </View>
                  <View style={styles.heroStepPill}>
                    <AppText variant="caption" tone="secondary" align="center">
                      {strings.quickCalculator.stepEnterGrades}
                    </AppText>
                  </View>
                  <View style={styles.heroStepPill}>
                    <AppText variant="caption" tone="secondary" align="center">
                      {strings.quickCalculator.stepReviewResult}
                    </AppText>
                  </View>
                </View>

                <View style={styles.heroReminderRow}>
                  <View
                    style={[
                      styles.heroReminderDot,
                      { backgroundColor: theme.warning },
                    ]}
                  />
                  <AppText
                    variant="caption"
                    tone="warning"
                    style={styles.heroReminderText}
                  >
                    {strings.quickCalculator.reminderPendingGrade}
                  </AppText>
                </View>
              </View>

              <AppButton
                label={strings.quickCalculator.addEvaluation}
                onPress={addEvaluation}
                style={styles.heroCta}
              />
            </View>
          </View>
        </EntryCard>

        <EntryCard delay={60}>
          <AppCard
            title={strings.quickCalculator.beforeStartTitle}
            style={[
              styles.glassCard,
              { backgroundColor: glassSurface, borderColor: glassBorder },
            ]}
          >
            <AppText variant="bodySecondary">
              {strings.quickCalculator.beforeStartDescription}
            </AppText>
          </AppCard>
        </EntryCard>

        <EntryCard delay={90}>
          <AppCard
            title={strings.quickCalculator.quickSettingsTitle}
            style={[styles.glassCard, { borderColor: glassBorder }]}
          >
            <AppInput
              label={strings.quickCalculator.minimumPassingGradeLabel}
              value={minimumGradeInput}
              onChangeText={setMinimumGradeInput}
              keyboardType="decimal-pad"
              placeholder="4.0"
              error={
                isMinimumGradeValid
                  ? undefined
                  : strings.quickCalculator.minimumPassingGradeError(
                      MIN_GRADE,
                      MAX_GRADE,
                    )
              }
            />
          </AppCard>
        </EntryCard>

        <EntryCard delay={120}>
          <AppCard
            title={strings.quickCalculator.evaluationsTitle}
            subtitle={strings.quickCalculator.temporaryEditSubtitle}
            style={[styles.glassCard, { borderColor: glassBorder }]}
          >
            <View style={styles.evaluationsList}>
              {evaluations.map((evaluation, index) => {
                const parsedGrade = parseAcademicNumber(evaluation.grade);
                const parsedWeight = parseAcademicNumber(evaluation.weight);
                const gradeError =
                  evaluation.grade.trim() &&
                  (parsedGrade === null ||
                    parsedGrade < MIN_GRADE ||
                    parsedGrade > MAX_GRADE)
                    ? strings.quickCalculator.gradeError(MIN_GRADE, MAX_GRADE)
                    : undefined;
                const weightError =
                  evaluation.weight.trim() &&
                  (parsedWeight === null ||
                    parsedWeight < 0 ||
                    parsedWeight > 100)
                    ? strings.quickCalculator.weightError
                    : undefined;

                return (
                  <EntryCard key={evaluation.id} delay={150 + index * 45}>
                    <View
                      style={[
                        styles.evaluationCard,
                        {
                          backgroundColor: glassSurface,
                          borderColor: glassBorder,
                        },
                      ]}
                    >
                      <View style={styles.evaluationHeader}>
                        <View style={styles.evaluationTag}>
                          <AppText variant="caption" tone="secondary">
                            {strings.quickCalculator.evaluationNumber(
                              index + 1,
                            )}
                          </AppText>
                        </View>
                        <AppButton
                          label={strings.common.delete}
                          variant="ghost"
                          onPress={() => removeEvaluation(evaluation.id)}
                        />
                      </View>

                      <AppInput
                        label={strings.quickCalculator.nameLabel}
                        value={evaluation.name}
                        onChangeText={(value) =>
                          updateEvaluation(evaluation.id, "name", value)
                        }
                        placeholder={strings.quickCalculator.evaluationPlaceholder(
                          index + 1,
                        )}
                      />

                      <View style={styles.inlineFields}>
                        <AppInput
                          label={strings.quickCalculator.gradeLabel}
                          value={evaluation.grade}
                          onChangeText={(value) =>
                            updateEvaluation(evaluation.id, "grade", value)
                          }
                          keyboardType="decimal-pad"
                          error={gradeError}
                          containerStyle={styles.inlineField}
                        />
                        <AppInput
                          label={strings.quickCalculator.weightLabel}
                          value={evaluation.weight}
                          onChangeText={(value) =>
                            updateEvaluation(evaluation.id, "weight", value)
                          }
                          placeholder="0"
                          keyboardType="decimal-pad"
                          error={weightError}
                          containerStyle={styles.inlineField}
                        />
                      </View>
                    </View>
                  </EntryCard>
                );
              })}
            </View>

            <View style={styles.evaluationActions}>
              <AppButton
                label={strings.quickCalculator.addEvaluationWithPrefix}
                variant="outline"
                style={styles.sectionAction}
                onPress={addEvaluation}
              />

              {weightWarning ? (
                <AppText tone="warning" style={styles.warningText}>
                  {strings.quickCalculator.totalWeightWarning(totalWeight)}
                </AppText>
              ) : (
                <AppText tone="success" style={styles.warningText}>
                  {strings.quickCalculator.totalWeightSuccess}
                </AppText>
              )}
            </View>
          </AppCard>
        </EntryCard>

        <EntryCard delay={170}>
          <AcademicSummaryPanel
            title={strings.quickCalculator.summaryTitle}
            subtitle={strings.quickCalculator.liveUpdateSubtitle}
            accumulatedPoints={summary.accumulatedPoints}
            currentWeightedAverage={summary.currentAverage}
            completedWeight={summary.completedWeight}
            pendingWeight={summary.pendingWeight}
            requiredGrade={summary.requiredGrade ?? null}
            finalProjectedGrade={summary.finalGrade}
            requiredGradeLabel={displayRequiredGrade}
            finalProjectedGradeLabel={displayFinalProjectedGrade}
            status={summary.status}
            advice={displayAdvice}
            minimumGrade={subject.passingGrade}
            footer={
              <>
                <View
                  style={[
                    styles.weightStatusCard,
                    {
                      backgroundColor: glassSurface,
                      borderColor: weightWarning
                        ? theme.warning
                        : theme.success,
                    },
                  ]}
                >
                  <AppText variant="bodyStrong">
                    {strings.quickCalculator.totalWeightTitle}
                  </AppText>
                  <AppText variant="h3">{formatPercent(totalWeight)}</AppText>
                  <AppText tone={weightWarning ? "warning" : "success"}>
                    {weightWarning
                      ? strings.quickCalculator.projectionAdjustPending
                      : strings.quickCalculator.projectionAdjustDone}
                  </AppText>
                </View>

                <View style={styles.actionsRow}>
                  <AppButton
                    label={strings.quickCalculator.clear}
                    variant="outline"
                    style={styles.actionButton}
                    onPress={resetCalculator}
                  />
                </View>
              </>
            }
            style={[styles.glassCard, { borderColor: glassBorder }]}
          />
        </EntryCard>

        <EntryCard delay={200}>
          <AppCard
            title={strings.quickCalculator.howItsCalculated}
            style={styles.glassCard}
          >
            <AppText variant="bodySecondary">
              {strings.quickCalculator.howItsCalculatedDescription}
            </AppText>
          </AppCard>
        </EntryCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  entryCard: {
    width: "100%",
  },
  glassCard: {
    borderRadius: 20,
  },
  heroRoot: {
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  heroOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOrbBlue: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 999,
    top: -58,
    left: -40,
    backgroundColor: "rgba(37,99,235,0.24)",
  },
  heroOrbCyan: {
    position: "absolute",
    width: 126,
    height: 126,
    borderRadius: 999,
    top: 54,
    right: -28,
    backgroundColor: "rgba(6,182,212,0.18)",
  },
  heroOrbOrange: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 999,
    bottom: -26,
    left: 78,
    backgroundColor: "rgba(249,115,22,0.16)",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  heroGlowLine: {
    height: 3,
    borderRadius: 999,
  },
  heroHeader: {
    gap: spacing.sm,
  },
  heroMainMessage: {
    paddingRight: spacing.sm,
  },
  heroGuideCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  heroStepsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  heroStepPill: {
    flexGrow: 1,
    minWidth: "48%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
    backgroundColor: "rgba(148,163,184,0.12)",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  heroReminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  heroReminderDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  heroReminderText: {
    flex: 1,
  },
  heroCta: {
    minHeight: 50,
  },
  evaluationsList: {
    gap: spacing.md,
  },
  evaluationCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  evaluationTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.16)",
  },
  inlineFields: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  evaluationActions: {
    gap: spacing.sm,
  },
  sectionAction: {
    minHeight: 48,
  },
  warningText: {
    marginTop: 2,
  },
  weightStatusCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    minWidth: 132,
    minHeight: 48,
  },
});

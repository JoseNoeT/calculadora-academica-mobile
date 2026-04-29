import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
    Animated,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { AnimatedProgressBar } from "@/src/components/charts";
import { AppHeader } from "@/src/components/layout/AppHeader";
import {
    AppBadge,
    AppButton,
    AppCard,
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import type { Evaluation, Subject } from "@/src/domain/entities";
import { academicStatusLabels } from "@/src/domain/entities";
import {
    DEFAULT_PASSING_GRADE,
    MAX_GRADE,
    MIN_GRADE,
} from "@/src/domain/rules";
import { calculateQuickAcademicSummary } from "@/src/features/calculator/services/calculatorService";
import { spacing, useAppTheme } from "@/src/theme";

type QuickEvaluationForm = {
  id: string;
  name: string;
  grade: string;
  weight: string;
};

const INITIAL_EVALUATIONS: QuickEvaluationForm[] = [
  { id: "evaluation-1", name: "Prueba n°1", grade: "", weight: "32" },
  { id: "evaluation-2", name: "Prueba n°2", grade: "", weight: "12" },
  { id: "evaluation-3", name: "Prueba n°3", grade: "", weight: "32" },
  { id: "evaluation-4", name: "Prueba n°4", grade: "", weight: "12" },
  { id: "evaluation-5", name: "Prueba n°5", grade: "", weight: "12" },
];

function normalizeNumberInput(value: string): string {
  return value.replace(",", ".").trim();
}

function parseNumber(value: string): number | null {
  const normalized = normalizeNumberInput(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function createEvaluationPayload(
  subjectId: string,
  minimumGrade: number,
  form: QuickEvaluationForm,
): Evaluation {
  const parsedGrade = parseNumber(form.grade);
  const parsedWeight = parseNumber(form.weight);
  const now = new Date().toISOString();

  return {
    id: form.id,
    subjectId,
    name: form.name.trim() || "Evaluacion",
    grade: parsedGrade,
    weight: parsedWeight ?? 0,
    minimumGrade,
    isPending: parsedGrade === null,
    createdAt: now,
    updatedAt: now,
  };
}

function formatGrade(value: number | null | undefined): string {
  if (typeof value !== "number") {
    return "Pendiente";
  }

  return value.toFixed(2);
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

function formatSummaryGrade(value: number | null | undefined): string {
  if (typeof value !== "number") {
    return "Pendiente";
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

  const parsedMinimumGrade = parseNumber(minimumGradeInput);
  const isMinimumGradeValid =
    parsedMinimumGrade !== null &&
    parsedMinimumGrade >= MIN_GRADE &&
    parsedMinimumGrade <= MAX_GRADE;

  const subject: Subject = useMemo(() => {
    const now = new Date().toISOString();

    return {
      id: "quick-calculator-subject",
      name: "Cálculo rápido",
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
      ? "—"
      : summary.requiredGrade.toFixed(2)
    : "Revisar ponderaciones";

  const displayFinalProjectedGrade = hasCompleteWeight
    ? formatSummaryGrade(summary.finalGrade)
    : "Revisar ponderaciones";

  const displayStatusLabel = hasCompleteWeight
    ? academicStatusLabels[summary.status]
    : "Pendiente";

  const displayAdvice = hasCompleteWeight
    ? (summary.advice ?? "Sin consejo disponible.")
    : "Completa las ponderaciones hasta llegar a 100% para obtener un cálculo confiable.";

  const completedProgress = Math.max(0, Math.min(100, summary.completedWeight));
  const pendingProgress = Math.max(0, Math.min(100, summary.pendingWeight));

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

  const guidanceTone = weightWarning
    ? "warning"
    : statusTone === "danger"
      ? "danger"
      : statusTone === "success"
        ? "success"
        : "info";

  const guidanceTitle = weightWarning
    ? "Ajusta tu base"
    : statusTone === "danger"
      ? "Todavía estás a tiempo"
      : statusTone === "success"
        ? "Vas por excelente camino"
        : "Sigue afinando tu estrategia";

  const guidanceLead = weightWarning
    ? "Necesitas cerrar la ponderación total al 100% para obtener un resultado confiable."
    : statusTone === "danger"
      ? "Tu escenario requiere intervención, pero con foco puedes revertirlo."
      : statusTone === "success"
        ? "Tu desempeño es favorable. Mantén el ritmo y cuida la consistencia."
        : "Tu progreso es estable; pequeños ajustes pueden mejorar tu resultado final.";

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
        name: `Evaluacion ${current.length + 1}`,
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
    <AppScreen scrollable>
      <View style={styles.container}>
        <AppHeader />

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
                <AppText variant="h2" style={styles.heroMainMessage}>
                  Calcula tu escenario académico en segundos
                </AppText>
                <AppText variant="body" tone="secondary">
                  Agrega tus evaluaciones, deja pendientes las notas que aún no
                  tienes y revisa qué necesitas para aprobar.
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
                      1. Define ponderaciones
                    </AppText>
                  </View>
                  <View style={styles.heroStepPill}>
                    <AppText variant="caption" tone="secondary" align="center">
                      2. Ingresa tus notas
                    </AppText>
                  </View>
                  <View style={styles.heroStepPill}>
                    <AppText variant="caption" tone="secondary" align="center">
                      3. Revisa tu resultado
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
                    Una nota vacía se toma como pendiente, no como cero.
                  </AppText>
                </View>
              </View>

              <AppButton
                label="Agregar evaluación"
                onPress={addEvaluation}
                style={styles.heroCta}
              />
            </View>
          </View>
        </EntryCard>

        <EntryCard delay={60}>
          <AppCard
            title="Antes de comenzar"
            style={[
              styles.glassCard,
              { backgroundColor: glassSurface, borderColor: glassBorder },
            ]}
          >
            <AppText tone="secondary">
              Ingresa tus evaluaciones, notas y ponderaciones. Las notas
              pendientes no se calculan como cero.
            </AppText>
          </AppCard>
        </EntryCard>

        <EntryCard delay={90}>
          <AppCard
            title="Configuración rápida"
            style={[styles.glassCard, { borderColor: glassBorder }]}
          >
            <AppInput
              label="Nota mínima de aprobación"
              value={minimumGradeInput}
              onChangeText={setMinimumGradeInput}
              keyboardType="decimal-pad"
              placeholder="4.0"
              error={
                isMinimumGradeValid
                  ? undefined
                  : `La nota mínima debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`
              }
            />
          </AppCard>
        </EntryCard>

        <EntryCard delay={120}>
          <AppCard
            title="Evaluaciones"
            subtitle="Edición temporal"
            style={[styles.glassCard, { borderColor: glassBorder }]}
          >
            <View style={styles.evaluationsList}>
              {evaluations.map((evaluation, index) => {
                const parsedGrade = parseNumber(evaluation.grade);
                const parsedWeight = parseNumber(evaluation.weight);
                const gradeError =
                  evaluation.grade.trim() &&
                  (parsedGrade === null ||
                    parsedGrade < MIN_GRADE ||
                    parsedGrade > MAX_GRADE)
                    ? `La nota debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`
                    : undefined;
                const weightError =
                  evaluation.weight.trim() &&
                  (parsedWeight === null ||
                    parsedWeight < 0 ||
                    parsedWeight > 100)
                    ? "La ponderación debe estar entre 0 y 100."
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
                            Evaluación #{index + 1}
                          </AppText>
                        </View>
                        <AppButton
                          label="Eliminar"
                          variant="ghost"
                          onPress={() => removeEvaluation(evaluation.id)}
                        />
                      </View>

                      <AppInput
                        label="Nombre"
                        value={evaluation.name}
                        onChangeText={(value) =>
                          updateEvaluation(evaluation.id, "name", value)
                        }
                        placeholder={`Evaluación ${index + 1}`}
                      />

                      <View style={styles.inlineFields}>
                        <AppInput
                          label="Nota"
                          value={evaluation.grade}
                          onChangeText={(value) =>
                            updateEvaluation(evaluation.id, "grade", value)
                          }
                          keyboardType="decimal-pad"
                          error={gradeError}
                          containerStyle={styles.inlineField}
                        />
                        <AppInput
                          label="Ponderación (%)"
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
                label="+ Agregar evaluación"
                variant="outline"
                style={styles.sectionAction}
                onPress={addEvaluation}
              />

              {weightWarning ? (
                <AppText tone="warning" style={styles.warningText}>
                  La suma de ponderaciones es {totalWeight.toFixed(0)}%. Para
                  calcular la nota necesaria, debe ser 100%.
                </AppText>
              ) : (
                <AppText tone="success" style={styles.warningText}>
                  Perfecto: tu ponderación total está en 100%.
                </AppText>
              )}
            </View>
          </AppCard>
        </EntryCard>

        <EntryCard delay={170}>
          <AppCard
            title="Resumen académico"
            subtitle="Actualización en tiempo real"
            style={[styles.glassCard, { borderColor: glassBorder }]}
          >
            <View style={styles.summaryGrid}>
              <View
                style={[styles.summaryMetricCard, { borderColor: theme.info }]}
              >
                <AppText variant="caption" tone="secondary">
                  Promedio actual
                </AppText>
                <AppText variant="h3">
                  {formatGrade(summary.currentAverage)}
                </AppText>
              </View>

              <View
                style={[
                  styles.summaryMetricCard,
                  { borderColor: theme.primary },
                ]}
              >
                <AppText variant="caption" tone="secondary">
                  Puntos acumulados
                </AppText>
                <AppText variant="h3">
                  {summary.accumulatedPoints.toFixed(2)}
                </AppText>
              </View>

              <View
                style={[
                  styles.summaryMetricCard,
                  { borderColor: theme.warning },
                ]}
              >
                <AppText variant="caption" tone="secondary">
                  Pendiente
                </AppText>
                <AppText variant="h3" tone="warning">
                  {formatPercent(summary.pendingWeight)}
                </AppText>
              </View>

              <View
                style={[
                  styles.summaryMetricCard,
                  { borderColor: theme.success },
                ]}
              >
                <AppText variant="caption" tone="secondary">
                  Rendido
                </AppText>
                <AppText variant="h3" tone="success">
                  {formatPercent(summary.completedWeight)}
                </AppText>
              </View>

              <View
                style={[
                  styles.summaryMetricCard,
                  { borderColor: theme.secondary },
                ]}
              >
                <AppText variant="caption" tone="secondary">
                  Final proyectada
                </AppText>
                <AppText variant="h3">{displayFinalProjectedGrade}</AppText>
              </View>

              <View
                style={[
                  styles.summaryMetricCard,
                  { borderColor: theme.warning },
                ]}
              >
                <AppText variant="caption" tone="secondary">
                  Nota necesaria
                </AppText>
                <AppText variant="h3" tone="warning">
                  {displayRequiredGrade}
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.weightStatusCard,
                {
                  backgroundColor: glassSurface,
                  borderColor: weightWarning ? theme.warning : theme.success,
                },
              ]}
            >
              <AppText variant="bodyStrong">Suma de ponderaciones</AppText>
              <AppText variant="h3">{formatPercent(totalWeight)}</AppText>
              <AppText tone={weightWarning ? "warning" : "success"}>
                {weightWarning
                  ? `Aún falta ajustar al 100% para una proyección exacta.`
                  : "Perfecto: ponderación completa para proyectar con confianza."}
              </AppText>
            </View>

            <View style={styles.progressSection}>
              <AnimatedProgressBar
                value={completedProgress}
                label="Progreso rendido"
                duration={800}
                height={8}
              />
              <AnimatedProgressBar
                value={pendingProgress}
                label="Progreso pendiente"
                duration={920}
                height={8}
              />
            </View>

            <View style={styles.actionsRow}>
              <AppButton
                label="Limpiar"
                variant="outline"
                style={styles.actionButton}
                onPress={resetCalculator}
              />
            </View>
          </AppCard>
        </EntryCard>

        <EntryCard delay={200}>
          <AppCard
            title="Consejo académico"
            style={[
              styles.glassCard,
              { backgroundColor: glassSurface, borderColor: glassBorder },
            ]}
          >
            <LinearGradient
              colors={["rgba(37,99,235,0.16)", "rgba(6,182,212,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.adviceGlow}
            />

            <View style={styles.adviceContent}>
              <AppText variant="h3" tone={guidanceTone}>
                {guidanceTitle}
              </AppText>
              <AppText tone="secondary">{guidanceLead}</AppText>
              <AppText tone="secondary">{displayAdvice}</AppText>
            </View>
          </AppCard>
        </EntryCard>

        <EntryCard delay={220}>
          <AppCard title="¿Cómo se calcula?" style={styles.glassCard}>
            <AppText tone="secondary">
              La nota se calcula mediante promedio ponderado. Cada evaluación
              aporta a la nota final según su porcentaje. Las evaluaciones sin
              nota se consideran pendientes y no se cuentan como cero.
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
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  heroGlowLine: {
    height: 3,
    borderRadius: 999,
  },
  heroHeader: {
    gap: spacing.xs,
  },
  heroMainMessage: {
    paddingRight: spacing.sm,
  },
  heroGuideCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.xs,
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
    gap: spacing.xs,
  },
  sectionAction: {
    minHeight: 48,
  },
  warningText: {
    marginTop: 2,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryMetricCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 3,
  },
  weightStatusCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  progressSection: {
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
  adviceGlow: {
    borderRadius: 14,
    ...StyleSheet.absoluteFillObject,
  },
  adviceContent: {
    gap: spacing.xs,
  },
});

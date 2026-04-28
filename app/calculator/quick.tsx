import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
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
  { id: "evaluation-1", name: "Evaluación 1", grade: "", weight: "" },
  { id: "evaluation-2", name: "Evaluación 2", grade: "", weight: "" },
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
    name: form.name.trim() || "Evaluación",
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

  const weightWarning = totalWeight !== 100;

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
        name: `Evaluación ${current.length + 1}`,
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
        <View style={styles.headerSection}>
          <AppText variant="title">Calculadora rápida</AppText>
          <AppText tone="secondary">
            Calcula una situación puntual sin guardar datos.
          </AppText>
        </View>

        <AppCard
          title="Antes de comenzar"
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText>
            Ingresa tus evaluaciones, notas y ponderaciones. Las notas
            pendientes no se calcularán como cero.
          </AppText>
        </AppCard>

        <AppCard title="Configuración rápida">
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

        <AppCard title="Evaluaciones" subtitle="Edición temporal">
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
                <View key={evaluation.id} style={styles.evaluationCardShell}>
                  <View style={styles.evaluationHeader}>
                    <AppText variant="subtitle">Evaluación {index + 1}</AppText>
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
                      placeholder="Pendiente"
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
              );
            })}
          </View>

          <AppButton
            label="+ Agregar evaluación"
            variant="outline"
            style={styles.sectionAction}
            onPress={addEvaluation}
          />

          {weightWarning ? (
            <AppText tone="warning" style={styles.warningText}>
              Advertencia: la suma de ponderaciones es {totalWeight.toFixed(0)}
              %. Idealmente debe ser 100%.
            </AppText>
          ) : null}
        </AppCard>

        <AppCard title="Resumen preliminar">
          <View style={styles.summaryList}>
            <AppText>
              Puntos acumulados: {summary.accumulatedPoints.toFixed(2)}
            </AppText>
            <AppText>
              Promedio actual: {formatGrade(summary.currentAverage)}
            </AppText>
            <AppText>
              Ponderación rendida: {formatPercent(summary.completedWeight)}
            </AppText>
            <AppText>
              Ponderación pendiente: {formatPercent(summary.pendingWeight)}
            </AppText>
            <AppText>
              Nota necesaria:{" "}
              {summary.requiredGrade == null
                ? "—"
                : summary.requiredGrade.toFixed(2)}
            </AppText>
            <AppText>Estado: {academicStatusLabels[summary.status]}</AppText>
            <AppText tone="secondary">
              Consejo: {summary.advice ?? "Sin consejo disponible."}
            </AppText>
          </View>

          <View style={styles.actionsRow}>
            <AppButton label="Calcular" style={styles.actionButton} />
            <AppButton
              label="Limpiar"
              variant="outline"
              style={styles.actionButton}
              onPress={resetCalculator}
            />
          </View>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    gap: spacing.sm,
  },
  evaluationsList: {
    gap: spacing.md,
  },
  evaluationCardShell: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlineFields: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  sectionAction: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
  warningText: {
    marginTop: spacing.sm,
  },
  summaryList: {
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
});

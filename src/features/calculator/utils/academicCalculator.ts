import type { AcademicStatus } from "@/src/domain/entities";
import { MAX_GRADE, MIN_GRADE } from "@/src/domain/rules";
import type { EvaluationListItem } from "@/src/features/subjects/types/evaluation.types";

export interface AcademicSummary {
  accumulatedPoints: number;
  completedWeight: number;
  pendingWeight: number;
  currentAverage: number | null;
  requiredGrade: number | null;
  status: AcademicStatus;
  advice: string;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function hasGrade(evaluation: EvaluationListItem): boolean {
  return typeof evaluation.grade === "number";
}

export function calculateAccumulatedPoints(
  evaluations: EvaluationListItem[],
): number {
  const points = evaluations.filter(hasGrade).reduce((total, evaluation) => {
    const grade = Math.max(MIN_GRADE, Math.min(MAX_GRADE, evaluation.grade!));
    return total + grade * (evaluation.weight / 100);
  }, 0);

  return round2(points);
}

export function calculateCompletedWeight(
  evaluations: EvaluationListItem[],
): number {
  const weight = evaluations
    .filter(hasGrade)
    .reduce((total, evaluation) => total + evaluation.weight, 0);

  return round2(weight);
}

export function calculatePendingWeight(
  evaluations: EvaluationListItem[],
): number {
  const weight = evaluations
    .filter((evaluation) => !hasGrade(evaluation))
    .reduce((total, evaluation) => total + evaluation.weight, 0);

  return round2(weight);
}

export function calculateCurrentAverage(
  accumulatedPoints: number,
  completedWeight: number,
): number | null {
  if (completedWeight <= 0) {
    return null;
  }

  return round2(accumulatedPoints / (completedWeight / 100));
}

export function calculateRequiredGrade(
  accumulatedPoints: number,
  pendingWeight: number,
  passingGrade: number,
): number | null {
  if (pendingWeight <= 0) {
    return null;
  }

  const required = (passingGrade - accumulatedPoints) / (pendingWeight / 100);
  return round2(required);
}

export function calculateStatus(input: {
  hasGradedEvaluations: boolean;
  hasPendingEvaluations: boolean;
  completedWeight: number;
  pendingWeight: number;
  currentAverage: number | null;
  requiredGrade: number | null;
  passingGrade: number;
}): AcademicStatus {
  const {
    hasGradedEvaluations,
    hasPendingEvaluations,
    completedWeight,
    currentAverage,
    requiredGrade,
    passingGrade,
  } = input;

  // Pendiente: no existe ninguna evaluacion con nota valida.
  if (!hasGradedEvaluations || completedWeight <= 0) {
    return "pending";
  }

  // Aprobado/Reprobado: no hay pendientes y todas tienen nota valida.
  if (!hasPendingEvaluations) {
    if (currentAverage !== null && currentAverage >= passingGrade) {
      return "approved";
    }

    return "failed";
  }

  // Con pendientes: estado depende de la nota requerida.
  if (requiredGrade === null) {
    return "pending";
  }

  if (requiredGrade < MIN_GRADE) {
    return "favorable";
  }

  if (requiredGrade >= MIN_GRADE && requiredGrade < 6.0) {
    return "achievable";
  }

  if (requiredGrade >= 6.0 && requiredGrade <= MAX_GRADE) {
    return "atRisk";
  }

  if (requiredGrade > MAX_GRADE) {
    return "notAchievable";
  }

  return "pending";
}

export function generateAcademicAdvice(input: {
  status: AcademicStatus;
  requiredGrade: number | null;
  pendingWeight: number;
}): string {
  const { status, requiredGrade, pendingWeight } = input;

  if (status === "pending") {
    return "Aun no hay notas validas registradas. Agrega tu primera nota para calcular el avance real.";
  }

  if (status === "approved") {
    return "Ramo aprobado. Mantener tu constancia te ayudara a cerrar con un buen promedio final.";
  }

  if (status === "failed") {
    return "Ramo reprobado con las evaluaciones actuales. Revisa tus resultados y planifica refuerzo para la siguiente instancia.";
  }

  if (status === "favorable") {
    return "Escenario favorable: con lo pendiente bastaria una nota baja para aprobar. Mantente ordenado y no te confies.";
  }

  if (status === "achievable") {
    if (requiredGrade === null) {
      return "El escenario es alcanzable con las evaluaciones pendientes.";
    }
    return `Escenario alcanzable: necesitas alrededor de ${requiredGrade.toFixed(2)} en el ${pendingWeight.toFixed(2)}% pendiente.`;
  }

  if (status === "atRisk") {
    if (requiredGrade === null) {
      return "Estas en riesgo academico y necesitas un plan de estudio exigente para aprobar.";
    }
    return `Estas en riesgo: necesitas aproximadamente ${requiredGrade.toFixed(2)} en el ${pendingWeight.toFixed(2)}% pendiente.`;
  }

  if (status === "notAchievable") {
    return "No alcanzable con la escala actual: la nota requerida supera 7.0. Prioriza recuperar puntaje y apoyo academico.";
  }

  return "Sin consejo disponible para el estado actual.";
}

export function calculateAcademicSummary(input: {
  evaluations: EvaluationListItem[];
  passingGrade: number;
}): AcademicSummary {
  const accumulatedPoints = calculateAccumulatedPoints(input.evaluations);
  const completedWeight = calculateCompletedWeight(input.evaluations);
  const pendingWeight = calculatePendingWeight(input.evaluations);
  const currentAverage = calculateCurrentAverage(
    accumulatedPoints,
    completedWeight,
  );
  const requiredGrade = calculateRequiredGrade(
    accumulatedPoints,
    pendingWeight,
    input.passingGrade,
  );
  const hasGradedEvaluations = input.evaluations.some(hasGrade);
  const hasPendingEvaluations = input.evaluations.some(
    (evaluation) => !hasGrade(evaluation),
  );
  const status = calculateStatus({
    hasGradedEvaluations,
    hasPendingEvaluations,
    completedWeight,
    pendingWeight,
    currentAverage,
    requiredGrade,
    passingGrade: input.passingGrade,
  });
  const advice = generateAcademicAdvice({
    status,
    requiredGrade,
    pendingWeight,
  });

  return {
    accumulatedPoints,
    completedWeight,
    pendingWeight,
    currentAverage,
    requiredGrade,
    status,
    advice,
  };
}

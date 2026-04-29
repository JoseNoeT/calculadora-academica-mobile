import type { AcademicSummary, Evaluation, Subject } from "../entities";
import { academicStatusLabels } from "../entities";
import { getAcademicStatus } from "./academicStatusCalculator";
import {
    calculateAccumulatedPoints,
    calculateCompletedWeight,
    calculateCurrentWeightedAverage,
    calculateFinalGrade,
    calculatePendingWeight,
    calculateRequiredGrade,
    findPriorityPendingEvaluation,
} from "./gradeCalculator";

function buildAdvice(
  status: AcademicSummary["status"],
  requiredGrade: number | null,
): string {
  switch (status) {
    case "pending":
      return "Aún no hay evaluaciones rendidas suficientes para calcular un escenario académico.";
    case "approved":
      return "La asignatura ya cumple con la nota mínima requerida.";
    case "failed":
      return "La asignatura cerró por debajo de la nota mínima requerida.";
    case "notAchievable":
      return "Con la ponderación pendiente disponible no es posible alcanzar la nota mínima.";
    case "favorable":
      return "El escenario actual es favorable: cualquier resultado dentro del rango válido mantiene la aprobación.";
    case "atRisk":
      return `Se necesita una nota exigente (${requiredGrade ?? "-"}) en lo pendiente para aprobar.`;
    case "achievable":
      return `La nota requerida (${requiredGrade ?? "-"}) sigue dentro de un rango alcanzable.`;
    default:
      return `Estado actual: ${academicStatusLabels[status]}.`;
  }
}

export function calculateAcademicSummary(
  subject: Subject,
  evaluations: Evaluation[],
): AcademicSummary {
  const accumulatedPoints = calculateAccumulatedPoints(evaluations);
  const completedWeight = calculateCompletedWeight(evaluations);
  const pendingWeight = calculatePendingWeight(evaluations);
  const currentAverage = calculateCurrentWeightedAverage(evaluations);
  const finalGrade = calculateFinalGrade(evaluations);
  const requiredGrade = calculateRequiredGrade(
    evaluations,
    subject.passingGrade,
  );
  const priorityEvaluation = findPriorityPendingEvaluation(evaluations);
  const status = getAcademicStatus({
    evaluationsCount: evaluations.length,
    completedWeight,
    pendingWeight,
    finalGrade,
    requiredGrade,
    minimumGrade: subject.passingGrade,
  });

  return {
    subjectId: subject.id,
    accumulatedPoints,
    completedWeight,
    pendingWeight,
    currentAverage,
    finalGrade,
    currentGrade: currentAverage,
    passingGrade: subject.passingGrade,
    requiredGrade,
    evaluatedPercentage: completedWeight,
    remainingPercentage: pendingWeight,
    status,
    advice: buildAdvice(status, requiredGrade),
    priorityEvaluation,
  };
}

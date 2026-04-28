import { calculateAcademicSummary } from "../../../domain/calculators";
import type {
    AcademicSummary,
    Evaluation,
    Subject,
} from "../../../domain/entities";
import type { GradeValue } from "../../../domain/types";
import type {
    SimulationInput,
    SimulationPreview,
} from "../types/simulator.types";

export function simulateRequiredGrade(
  input: SimulationInput,
): SimulationPreview {
  return {
    requiredGrade: null,
    message: `Simulación pendiente de implementación. Objetivo: ${input.targetGrade} con ${input.remainingWeight}% restante.`,
  };
}

export function simulateEvaluationGrade(
  subject: Subject,
  evaluations: Evaluation[],
  evaluationId: string,
  simulatedGrade: GradeValue,
): AcademicSummary {
  const projectedEvaluations = evaluations.map((evaluation) => {
    if (evaluation.id !== evaluationId) {
      return evaluation;
    }

    return {
      ...evaluation,
      grade: simulatedGrade,
      isPending: false,
      updatedAt: evaluation.updatedAt,
    };
  });

  return calculateAcademicSummary(subject, projectedEvaluations);
}

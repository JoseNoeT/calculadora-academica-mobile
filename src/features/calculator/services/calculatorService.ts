import type { AcademicSummary, Subject } from "../../../domain/entities";
import type {
    CalculatorContext,
    CalculatorResult,
} from "../types/calculator.types";

export function createEmptyAcademicSummary(subject: Subject): AcademicSummary {
  return {
    subjectId: subject.id,
    currentGrade: subject.passingGrade,
    passingGrade: subject.passingGrade,
    evaluatedPercentage: 0,
    remainingPercentage: 100,
    status: "pending",
    advice: "Motor de cálculo pendiente de implementación.",
  };
}

export function calculateAcademicSummary(
  context: CalculatorContext,
): CalculatorResult {
  return {
    summary: createEmptyAcademicSummary(context.subject),
    warnings: [
      "El motor completo de cálculo aún no está implementado en esta fase.",
    ],
  };
}

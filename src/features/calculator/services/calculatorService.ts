import { calculateAcademicSummary as calculateDomainAcademicSummary } from "../../../domain/calculators";
import type { AcademicSummary, Subject } from "../../../domain/entities";
import type {
    CalculatorContext,
    CalculatorResult,
} from "../types/calculator.types";

export function createEmptyAcademicSummary(subject: Subject): AcademicSummary {
  return {
    subjectId: subject.id,
    accumulatedPoints: 0,
    completedWeight: 0,
    pendingWeight: 100,
    currentAverage: null,
    finalGrade: null,
    currentGrade: null,
    passingGrade: subject.passingGrade,
    requiredGrade: null,
    evaluatedPercentage: 0,
    remainingPercentage: 100,
    status: "pending",
    advice: "Motor de cálculo pendiente de implementación.",
    priorityEvaluation: null,
  };
}

export function calculateAcademicSummary(
  context: CalculatorContext,
): CalculatorResult {
  const summary = calculateDomainAcademicSummary(
    context.subject,
    context.evaluations,
  );

  return {
    summary,
    warnings: [],
  };
}

export function calculateQuickAcademicSummary(
  context: CalculatorContext,
): AcademicSummary {
  return calculateDomainAcademicSummary(context.subject, context.evaluations);
}

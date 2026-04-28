import type { Evaluation } from "../entities";
import { MAX_GRADE, MIN_GRADE } from "../rules";
import type { GradeValue, PercentageValue } from "../types";

const DECIMAL_PRECISION = 4;

function roundToPrecision(
  value: number,
  precision = DECIMAL_PRECISION,
): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function hasGrade(
  evaluation: Evaluation,
): evaluation is Evaluation & { grade: GradeValue } {
  return typeof evaluation.grade === "number";
}

function getGradedEvaluations(
  evaluations: Evaluation[],
): Array<Evaluation & { grade: GradeValue }> {
  return evaluations.filter(hasGrade);
}

function getPendingEvaluations(evaluations: Evaluation[]): Evaluation[] {
  return evaluations.filter((evaluation) => !hasGrade(evaluation));
}

function normalizeWeightedGrade(
  points: number,
  weight: number,
): GradeValue | null {
  if (weight <= 0) {
    return null;
  }

  return roundToPrecision(points / (weight / 100));
}

export function calculateAccumulatedPoints(
  evaluations: Evaluation[],
): GradeValue {
  const points = getGradedEvaluations(evaluations).reduce(
    (total, evaluation) => total + evaluation.grade * (evaluation.weight / 100),
    0,
  );

  return roundToPrecision(points);
}

export function calculateCompletedWeight(
  evaluations: Evaluation[],
): PercentageValue {
  const completedWeight = getGradedEvaluations(evaluations).reduce(
    (total, evaluation) => total + evaluation.weight,
    0,
  );

  return roundToPrecision(completedWeight);
}

export function calculatePendingWeight(
  evaluations: Evaluation[],
): PercentageValue {
  const pendingWeight = getPendingEvaluations(evaluations).reduce(
    (total, evaluation) => total + evaluation.weight,
    0,
  );

  return roundToPrecision(pendingWeight);
}

export function calculateCurrentWeightedAverage(
  evaluations: Evaluation[],
): GradeValue | null {
  const accumulatedPoints = calculateAccumulatedPoints(evaluations);
  const completedWeight = calculateCompletedWeight(evaluations);

  return normalizeWeightedGrade(accumulatedPoints, completedWeight);
}

export function calculateFinalGrade(
  evaluations: Evaluation[],
): GradeValue | null {
  const pendingWeight = calculatePendingWeight(evaluations);
  if (pendingWeight > 0) {
    return null;
  }

  const accumulatedPoints = calculateAccumulatedPoints(evaluations);
  const totalWeight = evaluations.reduce(
    (total, evaluation) => total + evaluation.weight,
    0,
  );

  return normalizeWeightedGrade(
    roundToPrecision(accumulatedPoints),
    roundToPrecision(totalWeight),
  );
}

export function calculateRequiredGrade(
  evaluations: Evaluation[],
  minimumGrade: GradeValue,
): GradeValue | null {
  const pendingWeight = calculatePendingWeight(evaluations);
  if (pendingWeight <= 0) {
    return null;
  }

  const accumulatedPoints = calculateAccumulatedPoints(evaluations);
  const requiredPoints = minimumGrade - accumulatedPoints;
  const requiredGrade = requiredPoints / (pendingWeight / 100);

  return roundToPrecision(requiredGrade);
}

export function findPriorityPendingEvaluation(
  evaluations: Evaluation[],
): Evaluation | null {
  const pendingEvaluations = getPendingEvaluations(evaluations);
  if (pendingEvaluations.length === 0) {
    return null;
  }

  return pendingEvaluations.reduce((priority, current) => {
    if (current.weight > priority.weight) {
      return current;
    }

    return priority;
  });
}

export function clampGrade(value: GradeValue): GradeValue {
  return roundToPrecision(Math.min(MAX_GRADE, Math.max(MIN_GRADE, value)));
}

export function isGradeBelowMinimum(value: GradeValue): boolean {
  return value < MIN_GRADE;
}

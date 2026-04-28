import type { AcademicStatus } from "../entities";
import { MAX_GRADE, MIN_GRADE } from "../rules";
import type { GradeValue, PercentageValue } from "../types";

export interface AcademicStatusParams {
  evaluationsCount: number;
  completedWeight: PercentageValue;
  pendingWeight: PercentageValue;
  finalGrade: GradeValue | null;
  requiredGrade: GradeValue | null;
  minimumGrade: GradeValue;
}

export function getAcademicStatus({
  evaluationsCount,
  completedWeight,
  pendingWeight,
  finalGrade,
  requiredGrade,
  minimumGrade,
}: AcademicStatusParams): AcademicStatus {
  if (evaluationsCount === 0 || completedWeight <= 0) {
    return "pending";
  }

  if (pendingWeight <= 0 && finalGrade !== null) {
    return finalGrade >= minimumGrade ? "approved" : "failed";
  }

  if (requiredGrade === null) {
    return "pending";
  }

  if (requiredGrade > MAX_GRADE) {
    return "notAchievable";
  }

  if (requiredGrade < MIN_GRADE) {
    return "favorable";
  }

  if (requiredGrade >= 6.0 && requiredGrade <= MAX_GRADE) {
    return "atRisk";
  }

  return "achievable";
}

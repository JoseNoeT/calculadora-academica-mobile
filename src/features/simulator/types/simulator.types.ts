import type { GradeValue, PercentageValue } from "../../../domain/types";

export interface SimulationInput {
  targetGrade: GradeValue;
  remainingWeight: PercentageValue;
}

export interface SimulationPreview {
  requiredGrade: GradeValue | null;
  message: string;
}

import type { GradeValue, PercentageValue } from "../types";

export interface Subject {
  id: string;
  name: string;
  code?: string;
  professorName?: string;
  semester?: string;
  passingGrade: GradeValue;
  targetGrade?: GradeValue;
  accumulatedWeight: PercentageValue;
  createdAt: string;
  updatedAt: string;
}

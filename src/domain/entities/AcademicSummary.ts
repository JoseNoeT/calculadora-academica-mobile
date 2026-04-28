import type { GradeValue, PercentageValue } from "../types";
import type { AcademicStatus } from "./AcademicStatus";

export interface AcademicSummary {
  subjectId: string;
  currentGrade: GradeValue;
  passingGrade: GradeValue;
  requiredGrade?: GradeValue;
  evaluatedPercentage: PercentageValue;
  remainingPercentage: PercentageValue;
  status: AcademicStatus;
  advice?: string;
}

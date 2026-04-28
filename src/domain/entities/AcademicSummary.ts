import type { GradeValue, PercentageValue } from "../types";
import type { AcademicStatus } from "./AcademicStatus";
import type { Evaluation } from "./Evaluation";

export interface AcademicSummary {
  subjectId: string;
  accumulatedPoints: GradeValue;
  completedWeight: PercentageValue;
  pendingWeight: PercentageValue;
  currentAverage: GradeValue | null;
  finalGrade: GradeValue | null;
  currentGrade: GradeValue | null;
  passingGrade: GradeValue;
  requiredGrade?: GradeValue | null;
  evaluatedPercentage: PercentageValue;
  remainingPercentage: PercentageValue;
  status: AcademicStatus;
  advice?: string;
  priorityEvaluation?: Evaluation | null;
}

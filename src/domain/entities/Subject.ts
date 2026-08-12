import type { GradeValue, PercentageValue, SubjectAcademicConfig } from "../types";

export interface Subject {
  id: string;
  name: string;
  code?: string;
  professorName?: string;
  semester?: string;
  passingGrade: GradeValue;
  targetGrade?: GradeValue;
  accumulatedWeight: PercentageValue;
  subjectAcademicConfig?: SubjectAcademicConfig | null;
  createdAt: string;
  updatedAt: string;
}

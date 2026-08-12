import type {
    AcademicBlockType,
    GradeValue,
    NullableGrade,
    PercentageValue,
} from "../types";

export interface Evaluation {
  id: string;
  subjectId: string;
  name: string;
  category?: AcademicBlockType;
  blockId?: string;
  weight: PercentageValue;
  grade: NullableGrade;
  minimumGrade: GradeValue;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
}

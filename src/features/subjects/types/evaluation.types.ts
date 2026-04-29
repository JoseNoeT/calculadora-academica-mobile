export interface EvaluationListItem {
  id: string;
  subjectId: string;
  name: string;
  weight: number;
  grade: number | null;
  minimumGrade: number;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationInput {
  subjectId: string;
  name: string;
  weight: number;
  grade: number | null;
  minimumGrade: number;
}

export interface UpdateEvaluationInput {
  name: string;
  weight: number;
  grade: number | null;
}

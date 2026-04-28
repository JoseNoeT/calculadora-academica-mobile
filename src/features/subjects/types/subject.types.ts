import type { Subject } from "../../../domain/entities";

export interface CreateSubjectInput {
  name: string;
  minimumGrade: number;
  color: string;
}

export interface SubjectDraft extends Partial<Subject> {
  name: string;
}

export interface SubjectListItem {
  id: string;
  name: string;
  minimumGrade: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

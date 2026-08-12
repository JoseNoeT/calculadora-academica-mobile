import type { Subject } from "../../../domain/entities";
import type { AcademicProfileId, SubjectAcademicConfig } from "../../../domain/types";

export interface CreateSubjectInput {
  name: string;
  minimumGrade: number;
  color: string;
  academicProfileId?: AcademicProfileId;
}

export interface UpdateSubjectInput {
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
  subjectAcademicConfig?: SubjectAcademicConfig | null;
  createdAt: string;
  updatedAt: string;
}

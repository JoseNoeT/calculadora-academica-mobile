import type { Subject } from "../../../domain/entities";

export interface CreateSubjectInput {
  name: string;
  code?: string;
  professorName?: string;
  semester?: string;
}

export interface SubjectDraft extends Partial<Subject> {
  name: string;
}

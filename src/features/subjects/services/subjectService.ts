import type { Subject } from "../../../domain/entities";
import { DEFAULT_PASSING_GRADE } from "../../../domain/rules";
import { validateSubjectName } from "../../../domain/validators";
import type { CreateSubjectInput } from "../types/subject.types";

export function createSubjectDraft(input: CreateSubjectInput): Subject {
  const now = new Date().toISOString();

  return {
    id: "",
    name: input.name.trim(),
    code: input.code?.trim() || undefined,
    professorName: input.professorName?.trim() || undefined,
    semester: input.semester?.trim() || undefined,
    passingGrade: DEFAULT_PASSING_GRADE,
    accumulatedWeight: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function validateSubjectDraft(input: CreateSubjectInput) {
  return validateSubjectName(input.name);
}

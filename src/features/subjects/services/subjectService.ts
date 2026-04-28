import { MAX_GRADE, MIN_GRADE } from "../../../domain/rules";
import {
    validatePassingGrade,
    validateSubjectName,
} from "../../../domain/validators";
import {
    getInMemorySubjects,
    saveInMemorySubject,
} from "../repositories/subjectRepository";
import type {
    CreateSubjectInput,
    SubjectListItem,
} from "../types/subject.types";

function createSubjectId(): string {
  return `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getSubjects(): Promise<SubjectListItem[]> {
  return getInMemorySubjects();
}

export async function createSubject(
  input: CreateSubjectInput,
): Promise<SubjectListItem> {
  const name = input.name.trim();
  const nameValidation = validateSubjectName(name);
  const minimumGradeValidation = validatePassingGrade(input.minimumGrade);

  if (!nameValidation.isValid) {
    throw new Error("El nombre del ramo no puede estar vacío.");
  }

  if (!minimumGradeValidation.isValid) {
    throw new Error(
      `La nota mínima debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`,
    );
  }

  const now = new Date().toISOString();
  const subject: SubjectListItem = {
    id: createSubjectId(),
    name,
    minimumGrade: input.minimumGrade,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  };

  await saveInMemorySubject(subject);

  return subject;
}

export function validateSubjectDraft(input: CreateSubjectInput) {
  return validateSubjectName(input.name);
}

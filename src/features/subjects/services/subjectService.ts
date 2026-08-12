import { createSubjectAcademicConfigFromTemplate, MAX_GRADE, MIN_GRADE } from "../../../domain/rules";
import type { AcademicProfileId } from "../../../domain/types";
import {
    validatePassingGrade,
    validateSubjectName,
} from "../../../domain/validators";
import { getAcademicSettingsTemplate } from "../../../storage/settingsStorage";
import { deleteEvaluationsBySubjectId } from "../../../storage/repositories/evaluationRepository";
import {
    getPersistedSubjectById,
    getPersistedSubjects,
    removePersistedSubject,
    savePersistedSubject,
    updatePersistedSubject,
} from "../repositories/subjectRepository";
import type {
    CreateSubjectInput,
    SubjectListItem,
    UpdateSubjectInput,
} from "../types/subject.types";

function createSubjectId(): string {
  return `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getSubjects(): Promise<SubjectListItem[]> {
  return getPersistedSubjects();
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
  const academicTemplate = await getAcademicSettingsTemplate();
  const selectedProfileId =
    input.academicProfileId ?? academicTemplate.defaultProfileId;
  const subjectAcademicConfig = createSubjectAcademicConfigFromTemplate(
    {
      ...academicTemplate,
      defaultProfileId: selectedProfileId,
    },
    {
      passingGradeOverride: input.minimumGrade,
      copiedAt: now,
    },
  );

  const subject: SubjectListItem = {
    id: createSubjectId(),
    name,
    minimumGrade: input.minimumGrade,
    color: input.color,
    subjectAcademicConfig,
    createdAt: now,
    updatedAt: now,
  };

  await savePersistedSubject(subject);

  return subject;
}

export function validateSubjectDraft(input: CreateSubjectInput) {
  return validateSubjectName(input.name);
}

export async function getDefaultAcademicProfileId(): Promise<AcademicProfileId> {
  const academicTemplate = await getAcademicSettingsTemplate();
  return academicTemplate.defaultProfileId;
}

export async function deleteSubject(id: string): Promise<void> {
  try {
    await deleteEvaluationsBySubjectId(id);
    await removePersistedSubject(id);
  } catch (error) {
    console.error("[DeleteSubject] Error:", error);
    throw error;
  }
}

export async function getSubjectById(
  id: string,
): Promise<SubjectListItem | null> {
  return getPersistedSubjectById(id);
}

export async function updateSubject(
  id: string,
  input: UpdateSubjectInput,
): Promise<void> {
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

  await updatePersistedSubject(id, {
    name,
    minimumGrade: input.minimumGrade,
    color: input.color,
    updatedAt: new Date().toISOString(),
  });
}

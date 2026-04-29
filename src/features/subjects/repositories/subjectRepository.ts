import {
    createSubject as createStoredSubject,
    deleteSubject as deleteStoredSubject,
    getSubjectById as getStoredSubjectById,
    getAllSubjects as getStoredSubjects,
    updateSubject as updateStoredSubject,
} from "../../../storage/repositories/subjectRepository";
import type { SubjectListItem } from "../types/subject.types";

export async function getPersistedSubjects(): Promise<SubjectListItem[]> {
  return getStoredSubjects();
}

export async function savePersistedSubject(
  subject: SubjectListItem,
): Promise<void> {
  await createStoredSubject(subject);
}

export async function removePersistedSubject(id: string): Promise<void> {
  await deleteStoredSubject(id);
}

export async function getPersistedSubjectById(
  id: string,
): Promise<SubjectListItem | null> {
  return getStoredSubjectById(id);
}

export async function updatePersistedSubject(
  id: string,
  input: {
    name: string;
    minimumGrade: number;
    color: string;
    updatedAt: string;
  },
): Promise<void> {
  await updateStoredSubject(id, input);
}

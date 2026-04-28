import {
    createSubject as createStoredSubject,
    getAllSubjects as getStoredSubjects,
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

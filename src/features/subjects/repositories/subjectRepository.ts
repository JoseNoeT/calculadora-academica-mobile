import type { SubjectListItem } from "../types/subject.types";

const inMemorySubjects: SubjectListItem[] = [];

export async function getInMemorySubjects(): Promise<SubjectListItem[]> {
  return [...inMemorySubjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function saveInMemorySubject(
  subject: SubjectListItem,
): Promise<void> {
  const existingIndex = inMemorySubjects.findIndex(
    (item) => item.id === subject.id,
  );

  if (existingIndex >= 0) {
    inMemorySubjects[existingIndex] = subject;
    return;
  }

  inMemorySubjects.push(subject);
}

export async function clearInMemorySubjects(): Promise<void> {
  inMemorySubjects.length = 0;
}

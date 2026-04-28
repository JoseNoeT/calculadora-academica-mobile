import type { Subject } from "../../domain/entities";

export interface SubjectStorageItem {
  id: string;
  name: string;
  minimumGrade: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectRepository {
  getAll(): Promise<Subject[]>;
  getById(id: string): Promise<Subject | null>;
  save(subject: Subject): Promise<void>;
  remove(id: string): Promise<void>;
}

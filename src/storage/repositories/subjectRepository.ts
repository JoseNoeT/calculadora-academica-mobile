import type { Subject } from "../../domain/entities";

export interface SubjectRepository {
  getAll(): Promise<Subject[]>;
  getById(id: string): Promise<Subject | null>;
  save(subject: Subject): Promise<void>;
  remove(id: string): Promise<void>;
}

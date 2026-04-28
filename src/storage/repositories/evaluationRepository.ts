import type { Evaluation } from "../../domain/entities";

export interface EvaluationRepository {
  getBySubjectId(subjectId: string): Promise<Evaluation[]>;
  getById(id: string): Promise<Evaluation | null>;
  save(evaluation: Evaluation): Promise<void>;
  remove(id: string): Promise<void>;
}

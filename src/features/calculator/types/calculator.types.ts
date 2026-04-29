import type {
    AcademicSummary,
    Evaluation,
    Subject,
} from "../../../domain/entities";

export interface CalculatorContext {
  subject: Subject;
  evaluations: Evaluation[];
}

export interface CalculatorResult {
  summary: AcademicSummary | null;
  warnings: string[];
}

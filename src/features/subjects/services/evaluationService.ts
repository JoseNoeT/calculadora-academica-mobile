import { MAX_GRADE, MIN_GRADE } from "../../../domain/rules";
import type { AcademicBlockType } from "../../../domain/types";
import {
    createEvaluation as createStoredEvaluation,
    deleteEvaluation as deleteStoredEvaluation,
    getEvaluationsBySubjectId,
    getEvaluationById as getStoredEvaluationById,
    updateEvaluation as updateStoredEvaluation,
    updateEvaluationGrade as updateStoredEvaluationGrade,
} from "../../../storage/repositories/evaluationRepository";
import type {
    CreateEvaluationInput,
    EvaluationListItem,
    UpdateEvaluationInput,
} from "../types/evaluation.types";

const DEFAULT_EVALUATION_CATEGORY: AcademicBlockType = "general";
const DEFAULT_EVALUATION_BLOCK_ID = "general";

function resolveEvaluationCategory(
  value: AcademicBlockType | undefined,
): AcademicBlockType {
  return value ?? DEFAULT_EVALUATION_CATEGORY;
}

function resolveEvaluationBlockId(value: string | undefined): string {
  if (typeof value !== "string") {
    return DEFAULT_EVALUATION_BLOCK_ID;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : DEFAULT_EVALUATION_BLOCK_ID;
}

function createEvaluationId(): string {
  return `evaluation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getEvaluations(
  subjectId: string,
): Promise<EvaluationListItem[]> {
  return getEvaluationsBySubjectId(subjectId);
}

export async function addEvaluation(
  input: CreateEvaluationInput,
): Promise<EvaluationListItem> {
  const now = new Date().toISOString();

  const evaluation: EvaluationListItem = {
    id: createEvaluationId(),
    subjectId: input.subjectId,
    name: input.name.trim() || "Evaluación",
    category: resolveEvaluationCategory(input.category),
    blockId: resolveEvaluationBlockId(input.blockId),
    weight: input.weight,
    grade: input.grade,
    minimumGrade: input.minimumGrade,
    isPending: input.grade === null,
    createdAt: now,
    updatedAt: now,
  };

  await createStoredEvaluation(evaluation);

  return evaluation;
}

export async function deleteEvaluation(id: string): Promise<void> {
  return deleteStoredEvaluation(id);
}

export async function updateEvaluationGrade(
  id: string,
  grade: number | null,
): Promise<void> {
  return updateStoredEvaluationGrade(id, grade);
}

export async function getEvaluationById(
  id: string,
): Promise<EvaluationListItem | null> {
  return getStoredEvaluationById(id);
}

export async function updateEvaluation(
  id: string,
  input: UpdateEvaluationInput,
): Promise<void> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("El nombre de la evaluación es obligatorio.");
  }

  if (input.weight < 0 || input.weight > 100) {
    throw new Error("La ponderación debe estar entre 0 y 100.");
  }

  if (
    input.grade !== null &&
    (input.grade < MIN_GRADE || input.grade > MAX_GRADE)
  ) {
    throw new Error(`La nota debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`);
  }

  const existingEvaluation = await getStoredEvaluationById(id);
  const nextCategory =
    input.category ??
    existingEvaluation?.category ??
    DEFAULT_EVALUATION_CATEGORY;
  const nextBlockId =
    input.blockId ?? existingEvaluation?.blockId ?? DEFAULT_EVALUATION_BLOCK_ID;

  await updateStoredEvaluation(id, {
    name,
    category: resolveEvaluationCategory(nextCategory),
    blockId: resolveEvaluationBlockId(nextBlockId),
    weight: input.weight,
    grade: input.grade,
    updatedAt: new Date().toISOString(),
  });
}

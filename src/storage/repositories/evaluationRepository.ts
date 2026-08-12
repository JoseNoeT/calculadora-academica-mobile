import type { Evaluation } from "../../domain/entities";
import type { AcademicBlockType } from "../../domain/types";
import { initializeDatabase } from "../database/migrations";
import { getDatabase } from "../database/sqliteClient";

const DEFAULT_EVALUATION_CATEGORY: AcademicBlockType = "general";
const DEFAULT_EVALUATION_BLOCK_ID = "general";

function normalizeEvaluationCategory(
  value: string | null | undefined,
): AcademicBlockType {
  if (
    value === "general" ||
    value === "presentation" ||
    value === "exam" ||
    value === "extraordinary"
  ) {
    return value;
  }

  return DEFAULT_EVALUATION_CATEGORY;
}

function normalizeBlockId(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return DEFAULT_EVALUATION_BLOCK_ID;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : DEFAULT_EVALUATION_BLOCK_ID;
}

type EvaluationRow = {
  id: string;
  subject_id: string;
  name: string;
  category: string | null;
  block_id: string | null;
  weight: number;
  grade: number | null;
  minimum_grade: number;
  is_pending: number;
  created_at: string;
  updated_at: string;
};

function mapRowToEvaluation(row: EvaluationRow): Evaluation {
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    category: normalizeEvaluationCategory(row.category),
    blockId: normalizeBlockId(row.block_id),
    weight: row.weight,
    grade: row.grade,
    minimumGrade: row.minimum_grade,
    isPending: row.is_pending === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEvaluationsBySubjectId(
  subjectId: string,
): Promise<Evaluation[]> {
  await initializeDatabase();
  const database = await getDatabase();

  const rows = await database.getAllAsync<EvaluationRow>(
    `
      SELECT id, subject_id, name, category, block_id, weight, grade, minimum_grade, is_pending, created_at, updated_at
      FROM evaluations
      WHERE subject_id = ?
      ORDER BY datetime(created_at) ASC
    `,
    [subjectId],
  );

  return rows.map(mapRowToEvaluation);
}

export async function createEvaluation(evaluation: Evaluation): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  const category = normalizeEvaluationCategory(evaluation.category);
  const blockId = normalizeBlockId(evaluation.blockId);

  await database.runAsync(
    `
      INSERT INTO evaluations (id, subject_id, name, category, block_id, weight, grade, minimum_grade, is_pending, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      evaluation.id,
      evaluation.subjectId,
      evaluation.name,
      category,
      blockId,
      evaluation.weight,
      evaluation.grade ?? null,
      evaluation.minimumGrade,
      evaluation.isPending ? 1 : 0,
      evaluation.createdAt,
      evaluation.updatedAt,
    ],
  );
}

export async function getEvaluationById(
  id: string,
): Promise<Evaluation | null> {
  await initializeDatabase();
  const database = await getDatabase();

  const row = await database.getFirstAsync<EvaluationRow>(
    `
      SELECT id, subject_id, name, category, block_id, weight, grade, minimum_grade, is_pending, created_at, updated_at
      FROM evaluations
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  if (!row) {
    return null;
  }

  return mapRowToEvaluation(row);
}

export async function deleteEvaluation(id: string): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync(`DELETE FROM evaluations WHERE id = ?`, [id]);
}

export async function deleteEvaluationsBySubjectId(
  subjectId: string,
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync(`DELETE FROM evaluations WHERE subject_id = ?`, [
    subjectId,
  ]);
}

export async function updateEvaluationGrade(
  id: string,
  grade: number | null,
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  const now = new Date().toISOString();
  const isPending = grade === null ? 1 : 0;

  await database.runAsync(
    `UPDATE evaluations SET grade = ?, is_pending = ?, updated_at = ? WHERE id = ?`,
    [grade ?? null, isPending, now, id],
  );
}

export async function updateEvaluation(
  id: string,
  input: {
    name: string;
    category?: AcademicBlockType;
    blockId?: string;
    weight: number;
    grade: number | null;
    updatedAt: string;
  },
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  const category =
    typeof input.category === "undefined"
      ? null
      : normalizeEvaluationCategory(input.category);
  const blockId =
    typeof input.blockId === "undefined"
      ? null
      : normalizeBlockId(input.blockId);

  await database.runAsync(
    `
      UPDATE evaluations
      SET
        name = ?,
        category = COALESCE(?, category, 'general'),
        block_id = COALESCE(?, block_id, 'general'),
        weight = ?,
        grade = ?,
        is_pending = ?,
        updated_at = ?
      WHERE id = ?
    `,
    [
      input.name,
      category,
      blockId,
      input.weight,
      input.grade ?? null,
      input.grade === null ? 1 : 0,
      input.updatedAt,
      id,
    ],
  );
}

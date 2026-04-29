import type { Evaluation } from "../../domain/entities";
import { initializeDatabase } from "../database/migrations";
import { getDatabase } from "../database/sqliteClient";

type EvaluationRow = {
  id: string;
  subject_id: string;
  name: string;
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
      SELECT id, subject_id, name, weight, grade, minimum_grade, is_pending, created_at, updated_at
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

  await database.runAsync(
    `
      INSERT INTO evaluations (id, subject_id, name, weight, grade, minimum_grade, is_pending, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      evaluation.id,
      evaluation.subjectId,
      evaluation.name,
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
      SELECT id, subject_id, name, weight, grade, minimum_grade, is_pending, created_at, updated_at
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
    weight: number;
    grade: number | null;
    updatedAt: string;
  },
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE evaluations
      SET
        name = ?,
        weight = ?,
        grade = ?,
        is_pending = ?,
        updated_at = ?
      WHERE id = ?
    `,
    [
      input.name,
      input.weight,
      input.grade ?? null,
      input.grade === null ? 1 : 0,
      input.updatedAt,
      id,
    ],
  );
}

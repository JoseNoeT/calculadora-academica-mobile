import type { Subject } from "../../domain/entities";
import { normalizeSubjectAcademicConfig } from "../../domain/rules";
import type { SubjectAcademicConfig } from "../../domain/types";
import { initializeDatabase } from "../database/migrations";
import { getDatabase } from "../database/sqliteClient";

export interface SubjectStorageItem {
  id: string;
  name: string;
  minimumGrade: number;
  color: string;
  subjectAcademicConfig?: SubjectAcademicConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectRepository {
  getAll(): Promise<Subject[]>;
  getById(id: string): Promise<Subject | null>;
  save(subject: Subject): Promise<void>;
  remove(id: string): Promise<void>;
}

export type CreateSubjectStorageInput = SubjectStorageItem;

export type UpdateSubjectStorageInput = {
  name?: string;
  minimumGrade?: number;
  color?: string;
  updatedAt: string;
};

type SubjectRow = {
  id: string;
  name: string;
  minimum_grade: number;
  color: string | null;
  subject_academic_config_json: string | null;
  created_at: string;
  updated_at: string;
};

function parseSubjectAcademicConfig(
  value: string | null,
  minimumGrade: number,
): SubjectAcademicConfig | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return normalizeSubjectAcademicConfig(parsed, {
      fallbackPassingGrade: minimumGrade,
    });
  } catch {
    return normalizeSubjectAcademicConfig(null, {
      fallbackPassingGrade: minimumGrade,
    });
  }
}

function mapRowToSubjectStorageItem(row: SubjectRow): SubjectStorageItem {
  return {
    id: row.id,
    name: row.name,
    minimumGrade: row.minimum_grade,
    color: row.color ?? "#2563EB",
    subjectAcademicConfig: parseSubjectAcademicConfig(
      row.subject_academic_config_json,
      row.minimum_grade,
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllSubjects(): Promise<SubjectStorageItem[]> {
  await initializeDatabase();
  const database = await getDatabase();

  const rows = await database.getAllAsync<SubjectRow>(
    `
      SELECT id, name, minimum_grade, color, subject_academic_config_json, created_at, updated_at
      FROM subjects
      ORDER BY datetime(created_at) DESC
    `,
  );

  return rows.map(mapRowToSubjectStorageItem);
}

export async function getSubjectById(
  id: string,
): Promise<SubjectStorageItem | null> {
  await initializeDatabase();
  const database = await getDatabase();

  const row = await database.getFirstAsync<SubjectRow>(
    `
      SELECT id, name, minimum_grade, color, subject_academic_config_json, created_at, updated_at
      FROM subjects
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  if (!row) {
    return null;
  }

  return mapRowToSubjectStorageItem(row);
}

export async function createSubject(
  input: CreateSubjectStorageInput,
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO subjects (
        id,
        name,
        minimum_grade,
        color,
        subject_academic_config_json,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.id,
      input.name,
      input.minimumGrade,
      input.color,
      input.subjectAcademicConfig
        ? JSON.stringify(input.subjectAcademicConfig)
        : null,
      input.createdAt,
      input.updatedAt,
    ],
  );
}

export async function updateSubject(
  id: string,
  input: UpdateSubjectStorageInput,
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE subjects
      SET
        name = COALESCE(?, name),
        minimum_grade = COALESCE(?, minimum_grade),
        color = COALESCE(?, color),
        updated_at = ?
      WHERE id = ?
    `,
    [
      input.name ?? null,
      input.minimumGrade ?? null,
      input.color ?? null,
      input.updatedAt,
      id,
    ],
  );
}

export async function deleteSubject(id: string): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  // Defensa ante esquemas legacy donde el ON DELETE CASCADE no esté activo.
  await database.runAsync(
    `
      DELETE FROM evaluations
      WHERE subject_id = ?
    `,
    [id],
  );

  await database.runAsync(
    `
      DELETE FROM subjects
      WHERE id = ?
    `,
    [id],
  );
}

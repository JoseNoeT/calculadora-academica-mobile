import { getDatabase } from "./sqliteClient";

let isInitialized = false;

async function ensureSubjectsAcademicConfigColumn(): Promise<void> {
  const database = await getDatabase();
  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(subjects)",
  );

  const hasSubjectAcademicConfigColumn = columns.some(
    (column) => column.name === "subject_academic_config_json",
  );

  if (!hasSubjectAcademicConfigColumn) {
    await database.execAsync(`
      ALTER TABLE subjects
      ADD COLUMN subject_academic_config_json TEXT NULL;
    `);
  }
}

async function ensureEvaluationsCategoryColumns(): Promise<void> {
  const database = await getDatabase();
  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(evaluations)",
  );

  const hasCategoryColumn = columns.some(
    (column) => column.name === "category",
  );
  const hasBlockIdColumn = columns.some((column) => column.name === "block_id");

  if (!hasCategoryColumn) {
    await database.execAsync(`
      ALTER TABLE evaluations
      ADD COLUMN category TEXT NULL DEFAULT 'general';
    `);
  }

  if (!hasBlockIdColumn) {
    await database.execAsync(`
      ALTER TABLE evaluations
      ADD COLUMN block_id TEXT NULL DEFAULT 'general';
    `);
  }
}

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      minimum_grade REAL NOT NULL,
      color TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY NOT NULL,
      subject_id TEXT NOT NULL,
      name TEXT NOT NULL,
      weight REAL NOT NULL,
      grade REAL,
      minimum_grade REAL NOT NULL,
      is_pending INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await ensureSubjectsAcademicConfigColumn();
  await ensureEvaluationsCategoryColumns();

  isInitialized = true;
}

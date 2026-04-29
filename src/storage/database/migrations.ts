import { getDatabase } from "./sqliteClient";

let isInitialized = false;

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

  isInitialized = true;
}

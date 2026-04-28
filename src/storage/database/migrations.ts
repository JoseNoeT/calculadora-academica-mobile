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
  `);

  isInitialized = true;
}

describe("initializeDatabase migrations", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("agrega columna subject_academic_config_json cuando no existe", async () => {
    const execAsync = jest.fn(async () => undefined);
    const getAllAsync = jest.fn(async (query: string) => {
      if (query.includes("table_info(subjects)")) {
        return [
          { name: "id" },
          { name: "name" },
          { name: "minimum_grade" },
          { name: "color" },
          { name: "created_at" },
          { name: "updated_at" },
        ];
      }

      if (query.includes("table_info(evaluations)")) {
        return [
          { name: "id" },
          { name: "subject_id" },
          { name: "name" },
          { name: "weight" },
          { name: "grade" },
          { name: "minimum_grade" },
          { name: "is_pending" },
          { name: "created_at" },
          { name: "updated_at" },
        ];
      }

      return [];
    });

    jest.doMock("@/src/storage/database/sqliteClient", () => ({
      getDatabase: jest.fn(async () => ({ execAsync, getAllAsync })),
    }));

    const { initializeDatabase } = require("../migrations") as {
      initializeDatabase: () => Promise<void>;
    };

    await initializeDatabase();

    const allSql = execAsync.mock.calls
      .map((call: unknown[]) => String(call[0] ?? ""))
      .join("\n");
    expect(allSql).toContain("ALTER TABLE subjects");
    expect(allSql).toContain("subject_academic_config_json");
    expect(allSql).toContain("ALTER TABLE evaluations");
    expect(allSql).toContain("category");
    expect(allSql).toContain("block_id");
  });

  it("si la columna ya existe, no intenta ALTER TABLE", async () => {
    const execAsync = jest.fn(async () => undefined);
    const getAllAsync = jest.fn(async (query: string) => {
      if (query.includes("table_info(subjects)")) {
        return [
          { name: "id" },
          { name: "name" },
          { name: "minimum_grade" },
          { name: "color" },
          { name: "subject_academic_config_json" },
          { name: "created_at" },
          { name: "updated_at" },
        ];
      }

      if (query.includes("table_info(evaluations)")) {
        return [
          { name: "id" },
          { name: "subject_id" },
          { name: "name" },
          { name: "weight" },
          { name: "grade" },
          { name: "minimum_grade" },
          { name: "is_pending" },
          { name: "category" },
          { name: "block_id" },
          { name: "created_at" },
          { name: "updated_at" },
        ];
      }

      return [];
    });

    jest.doMock("@/src/storage/database/sqliteClient", () => ({
      getDatabase: jest.fn(async () => ({ execAsync, getAllAsync })),
    }));

    const { initializeDatabase } = require("../migrations") as {
      initializeDatabase: () => Promise<void>;
    };

    await initializeDatabase();

    const allSql = execAsync.mock.calls
      .map((call: unknown[]) => String(call[0] ?? ""))
      .join("\n");
    expect(allSql).not.toContain("ALTER TABLE subjects");
    expect(allSql).not.toContain("ALTER TABLE evaluations");
  });

  it("la migracion no ejecuta borrado de datos", async () => {
    const execAsync = jest.fn(async () => undefined);
    const getAllAsync = jest.fn(async () => []);

    jest.doMock("@/src/storage/database/sqliteClient", () => ({
      getDatabase: jest.fn(async () => ({ execAsync, getAllAsync })),
    }));

    const { initializeDatabase } = require("../migrations") as {
      initializeDatabase: () => Promise<void>;
    };

    await initializeDatabase();

    const allSql = execAsync.mock.calls
      .map((call: unknown[]) => String(call[0] ?? ""))
      .join("\n");
    expect(allSql).not.toMatch(/DELETE\s+FROM\s+subjects/i);
    expect(allSql).not.toMatch(/DELETE\s+FROM\s+evaluations/i);
    expect(allSql).not.toMatch(/DROP\s+TABLE\s+subjects/i);
    expect(allSql).not.toMatch(/DROP\s+TABLE\s+evaluations/i);
  });
});

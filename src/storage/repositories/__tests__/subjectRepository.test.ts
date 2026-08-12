import type { SubjectAcademicConfig } from "@/src/domain/types";
import {
    createSubject,
  deleteSubject,
    getAllSubjects,
    getSubjectById,
} from "../subjectRepository";

const subjectRows: Array<{
  id: string;
  name: string;
  minimum_grade: number;
  color: string | null;
  subject_academic_config_json: string | null;
  created_at: string;
  updated_at: string;
}> = [];

const mockDatabase = {
  getAllAsync: jest.fn(async (_query: string) => subjectRows),
  getFirstAsync: jest.fn(async (_query: string, params?: unknown[]) => {
    const id = params?.[0] as string | undefined;
    return subjectRows.find((row) => row.id === id) ?? null;
  }),
  runAsync: jest.fn(async (query: string, params?: unknown[]) => {
    if (query.includes("INSERT INTO subjects")) {
      subjectRows.push({
        id: params?.[0] as string,
        name: params?.[1] as string,
        minimum_grade: params?.[2] as number,
        color: (params?.[3] as string | null) ?? null,
        subject_academic_config_json: (params?.[4] as string | null) ?? null,
        created_at: params?.[5] as string,
        updated_at: params?.[6] as string,
      });
      return;
    }

    if (query.includes("DELETE FROM subjects")) {
      const id = params?.[0] as string;
      const index = subjectRows.findIndex((row) => row.id === id);
      if (index >= 0) {
        subjectRows.splice(index, 1);
      }
    }
  }),
};

jest.mock("@/src/storage/database/migrations", () => ({
  initializeDatabase: jest.fn(async () => undefined),
}));

jest.mock("@/src/storage/database/sqliteClient", () => ({
  getDatabase: jest.fn(async () => mockDatabase),
}));

describe("storage subjectRepository", () => {
  beforeEach(() => {
    subjectRows.length = 0;
    jest.clearAllMocks();
  });

  it("leer ramo legacy sin subject_academic_config_json no falla", async () => {
    subjectRows.push({
      id: "legacy-1",
      name: "Ramo Legacy",
      minimum_grade: 4.0,
      color: "#2563EB",
      subject_academic_config_json: null,
      created_at: "2026-05-03T12:00:00.000Z",
      updated_at: "2026-05-03T12:00:00.000Z",
    });

    const result = await getAllSubjects();

    expect(result).toHaveLength(1);
    expect(result[0].subjectAcademicConfig).toBeNull();
    expect(result[0].minimumGrade).toBe(4.0);
  });

  it("JSON corrupto no rompe la lectura y aplica fallback controlado", async () => {
    subjectRows.push({
      id: "legacy-2",
      name: "Ramo Corrupto",
      minimum_grade: 4.2,
      color: "#0284C7",
      subject_academic_config_json: "{ json_corrupto",
      created_at: "2026-05-03T12:10:00.000Z",
      updated_at: "2026-05-03T12:10:00.000Z",
    });

    const result = await getSubjectById("legacy-2");

    expect(result).not.toBeNull();
    expect(result?.subjectAcademicConfig).toEqual(
      expect.objectContaining({
        calculationProfileId: "weighted_general",
        gradeScaleId: "chile_1_7",
        passingGrade: 4.2,
      }),
    );
  });

  it("JSON incompleto usa fallback controlado", async () => {
    subjectRows.push({
      id: "legacy-3",
      name: "Ramo Incompleto",
      minimum_grade: 4.1,
      color: "#0369A1",
      subject_academic_config_json: JSON.stringify({
        profileId: "duoc_60_40",
      }),
      created_at: "2026-05-03T12:30:00.000Z",
      updated_at: "2026-05-03T12:30:00.000Z",
    });

    const result = await getSubjectById("legacy-3");

    expect(result).not.toBeNull();
    expect(result?.subjectAcademicConfig).toEqual(
      expect.objectContaining({
        calculationProfileId: "duoc_60_40",
        calculationProfileName: "Duoc UC 60/40",
        passingGrade: 4.1,
      }),
    );
  });

  it("createSubject serializa subjectAcademicConfig cuando existe", async () => {
    const subjectAcademicConfig: SubjectAcademicConfig = {
      countryCode: "CL",
      gradeScaleId: "chile_1_7",
      minGrade: 1,
      maxGrade: 7,
      profileId: "weighted_general",
      calculationProfileId: "weighted_general",
      calculationProfileName: "Ponderado general",
      academicConfigVersion: 1,
      gradeScale: {
        id: "chile_1_7",
        name: "Escala chilena 1.0 a 7.0",
        minGrade: 1,
        maxGrade: 7,
        defaultPassingGrade: 4,
        decimalPrecision: 1,
        countryCode: "CL",
      },
      passingGrade: 4.4,
      blocks: [
        {
          id: "general",
          name: "Promedio general",
          weight: 100,
          type: "general",
        },
      ],
      sourceTemplateVersion: 1,
      copiedAt: "2026-05-03T12:20:00.000Z",
    };

    await createSubject({
      id: "new-1",
      name: "Ramo Nuevo",
      minimumGrade: 4.4,
      color: "#2563EB",
      subjectAcademicConfig,
      createdAt: "2026-05-03T12:20:00.000Z",
      updatedAt: "2026-05-03T12:20:00.000Z",
    });

    expect(mockDatabase.runAsync).toHaveBeenCalled();
    const insertedRow = subjectRows.find((row) => row.id === "new-1");

    expect(insertedRow).toBeDefined();
    expect(insertedRow?.subject_academic_config_json).not.toBeNull();
    expect(
      JSON.parse(insertedRow?.subject_academic_config_json ?? "{}"),
    ).toMatchObject({
      calculationProfileId: "weighted_general",
      passingGrade: 4.4,
    });
  });

  it("deleteSubject limpia evaluaciones asociadas y elimina el ramo", async () => {
    subjectRows.push({
      id: "delete-1",
      name: "Ramo a eliminar",
      minimum_grade: 4,
      color: "#2563EB",
      subject_academic_config_json: null,
      created_at: "2026-05-03T12:40:00.000Z",
      updated_at: "2026-05-03T12:40:00.000Z",
    });

    await deleteSubject("delete-1");

    expect(mockDatabase.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("DELETE FROM evaluations"),
      ["delete-1"],
    );
    expect(mockDatabase.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("DELETE FROM subjects"),
      ["delete-1"],
    );
    expect(subjectRows.find((row) => row.id === "delete-1")).toBeUndefined();
  });
});

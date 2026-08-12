import type { Evaluation } from "@/src/domain/entities";
import {
    createEvaluation,
  deleteEvaluationsBySubjectId,
    getEvaluationById,
    updateEvaluation,
} from "../evaluationRepository";

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

const evaluationRows: EvaluationRow[] = [];

const mockDatabase = {
  getAllAsync: jest.fn(async (_query: string, params?: unknown[]) => {
    const subjectId = params?.[0] as string | undefined;
    if (!subjectId) {
      return evaluationRows;
    }

    return evaluationRows.filter((row) => row.subject_id === subjectId);
  }),
  getFirstAsync: jest.fn(async (_query: string, params?: unknown[]) => {
    const id = params?.[0] as string | undefined;
    return evaluationRows.find((row) => row.id === id) ?? null;
  }),
  runAsync: jest.fn(async (query: string, params?: unknown[]) => {
    if (query.includes("INSERT INTO evaluations")) {
      evaluationRows.push({
        id: params?.[0] as string,
        subject_id: params?.[1] as string,
        name: params?.[2] as string,
        category: (params?.[3] as string | null) ?? null,
        block_id: (params?.[4] as string | null) ?? null,
        weight: params?.[5] as number,
        grade: (params?.[6] as number | null) ?? null,
        minimum_grade: params?.[7] as number,
        is_pending: params?.[8] as number,
        created_at: params?.[9] as string,
        updated_at: params?.[10] as string,
      });
      return;
    }

    if (
      query.includes("UPDATE evaluations") &&
      query.includes("category = COALESCE")
    ) {
      const id = params?.[7] as string;
      const row = evaluationRows.find((item) => item.id === id);

      if (!row) {
        return;
      }

      const nextCategory = params?.[1] as string | null;
      const nextBlockId = params?.[2] as string | null;

      row.name = params?.[0] as string;
      row.category = nextCategory ?? row.category ?? "general";
      row.block_id = nextBlockId ?? row.block_id ?? "general";
      row.weight = params?.[3] as number;
      row.grade = (params?.[4] as number | null) ?? null;
      row.is_pending = params?.[5] as number;
      row.updated_at = params?.[6] as string;
      return;
    }

    if (query.includes("DELETE FROM evaluations WHERE subject_id = ?")) {
      const subjectId = params?.[0] as string;
      for (let index = evaluationRows.length - 1; index >= 0; index -= 1) {
        if (evaluationRows[index].subject_id === subjectId) {
          evaluationRows.splice(index, 1);
        }
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

describe("storage evaluationRepository", () => {
  beforeEach(() => {
    evaluationRows.length = 0;
    jest.clearAllMocks();
  });

  it("lectura legacy sin category usa general", async () => {
    evaluationRows.push({
      id: "legacy-category",
      subject_id: "s-1",
      name: "Control 1",
      category: null,
      block_id: "presentation",
      weight: 20,
      grade: null,
      minimum_grade: 4,
      is_pending: 1,
      created_at: "2026-05-03T10:00:00.000Z",
      updated_at: "2026-05-03T10:00:00.000Z",
    });

    const evaluation = await getEvaluationById("legacy-category");

    expect(evaluation?.category).toBe("general");
    expect(evaluation?.blockId).toBe("presentation");
  });

  it("lectura legacy sin blockId usa general", async () => {
    evaluationRows.push({
      id: "legacy-block",
      subject_id: "s-1",
      name: "Control 2",
      category: "exam",
      block_id: null,
      weight: 30,
      grade: 5.1,
      minimum_grade: 4,
      is_pending: 0,
      created_at: "2026-05-03T10:10:00.000Z",
      updated_at: "2026-05-03T10:10:00.000Z",
    });

    const evaluation = await getEvaluationById("legacy-block");

    expect(evaluation?.category).toBe("exam");
    expect(evaluation?.blockId).toBe("general");
  });

  it("crear evaluacion sin category guarda general", async () => {
    const now = "2026-05-03T11:00:00.000Z";
    const evaluation: Evaluation = {
      id: "new-defaults",
      subjectId: "s-2",
      name: "Trabajo",
      weight: 25,
      grade: null,
      minimumGrade: 4,
      isPending: true,
      createdAt: now,
      updatedAt: now,
    };

    await createEvaluation(evaluation);

    const stored = evaluationRows.find((row) => row.id === "new-defaults");
    expect(stored?.category).toBe("general");
    expect(stored?.block_id).toBe("general");
  });

  it("crear evaluacion con presentation guarda presentation", async () => {
    const now = "2026-05-03T11:10:00.000Z";
    const evaluation: Evaluation = {
      id: "new-presentation",
      subjectId: "s-2",
      name: "Presentacion",
      category: "presentation",
      blockId: "presentation",
      weight: 40,
      grade: 6.1,
      minimumGrade: 4,
      isPending: false,
      createdAt: now,
      updatedAt: now,
    };

    await createEvaluation(evaluation);

    const stored = evaluationRows.find((row) => row.id === "new-presentation");
    expect(stored?.category).toBe("presentation");
    expect(stored?.block_id).toBe("presentation");
  });

  it("crear evaluacion con exam guarda exam", async () => {
    const now = "2026-05-03T11:20:00.000Z";
    const evaluation: Evaluation = {
      id: "new-exam",
      subjectId: "s-2",
      name: "Examen",
      category: "exam",
      blockId: "exam",
      weight: 60,
      grade: 5.8,
      minimumGrade: 4,
      isPending: false,
      createdAt: now,
      updatedAt: now,
    };

    await createEvaluation(evaluation);

    const stored = evaluationRows.find((row) => row.id === "new-exam");
    expect(stored?.category).toBe("exam");
    expect(stored?.block_id).toBe("exam");
  });

  it("actualizar evaluacion conserva category y blockId", async () => {
    evaluationRows.push({
      id: "keep-category",
      subject_id: "s-3",
      name: "Evaluacion inicial",
      category: "presentation",
      block_id: "presentation",
      weight: 30,
      grade: null,
      minimum_grade: 4,
      is_pending: 1,
      created_at: "2026-05-03T11:30:00.000Z",
      updated_at: "2026-05-03T11:30:00.000Z",
    });

    await updateEvaluation("keep-category", {
      name: "Evaluacion actualizada",
      weight: 35,
      grade: 5.5,
      updatedAt: "2026-05-03T11:45:00.000Z",
    });

    const updated = evaluationRows.find((row) => row.id === "keep-category");

    expect(updated?.name).toBe("Evaluacion actualizada");
    expect(updated?.category).toBe("presentation");
    expect(updated?.block_id).toBe("presentation");
  });

  it("elimina evaluaciones asociadas por subjectId", async () => {
    evaluationRows.push(
      {
        id: "e-1",
        subject_id: "s-delete",
        name: "Eval 1",
        category: "general",
        block_id: "general",
        weight: 20,
        grade: null,
        minimum_grade: 4,
        is_pending: 1,
        created_at: "2026-05-03T13:00:00.000Z",
        updated_at: "2026-05-03T13:00:00.000Z",
      },
      {
        id: "e-2",
        subject_id: "s-delete",
        name: "Eval 2",
        category: "exam",
        block_id: "exam",
        weight: 80,
        grade: 5.5,
        minimum_grade: 4,
        is_pending: 0,
        created_at: "2026-05-03T13:10:00.000Z",
        updated_at: "2026-05-03T13:10:00.000Z",
      },
      {
        id: "e-3",
        subject_id: "s-keep",
        name: "Eval keep",
        category: "general",
        block_id: "general",
        weight: 50,
        grade: 6,
        minimum_grade: 4,
        is_pending: 0,
        created_at: "2026-05-03T13:20:00.000Z",
        updated_at: "2026-05-03T13:20:00.000Z",
      },
    );

    await deleteEvaluationsBySubjectId("s-delete");

    expect(evaluationRows.map((row) => row.id)).toEqual(["e-3"]);
  });
});

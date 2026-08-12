import * as evaluationRepository from "@/src/storage/repositories/evaluationRepository";

import { addEvaluation, updateEvaluation } from "../evaluationService";

jest.mock("@/src/storage/repositories/evaluationRepository", () => ({
  createEvaluation: jest.fn(async () => undefined),
  deleteEvaluation: jest.fn(async () => undefined),
  getEvaluationById: jest.fn(async () => null),
  getEvaluationsBySubjectId: jest.fn(async () => []),
  updateEvaluation: jest.fn(async () => undefined),
  updateEvaluationGrade: jest.fn(async () => undefined),
}));

describe("evaluationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crear evaluacion nueva sin category usa general", async () => {
    const evaluation = await addEvaluation({
      subjectId: "s-1",
      name: "Control corto",
      weight: 20,
      grade: null,
      minimumGrade: 4,
    });

    expect(evaluation.category).toBe("general");
    expect(evaluation.blockId).toBe("general");
    expect(evaluationRepository.createEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "general",
        blockId: "general",
      }),
    );
  });

  it("crear evaluacion con presentation guarda presentation", async () => {
    await addEvaluation({
      subjectId: "s-1",
      name: "Presentacion oral",
      category: "presentation",
      blockId: "presentation",
      weight: 35,
      grade: 6,
      minimumGrade: 4,
    });

    expect(evaluationRepository.createEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "presentation",
        blockId: "presentation",
      }),
    );
  });

  it("crear evaluacion con exam guarda exam", async () => {
    await addEvaluation({
      subjectId: "s-1",
      name: "Examen parcial",
      category: "exam",
      blockId: "exam",
      weight: 45,
      grade: 5.4,
      minimumGrade: 4,
    });

    expect(evaluationRepository.createEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "exam",
        blockId: "exam",
      }),
    );
  });

  it("actualizar evaluacion no pierde category ni blockId", async () => {
    const mockGetEvaluationById = jest.mocked(
      evaluationRepository.getEvaluationById,
    );

    mockGetEvaluationById.mockResolvedValue({
      id: "e-1",
      subjectId: "s-1",
      name: "Anterior",
      category: "presentation",
      blockId: "presentation",
      weight: 30,
      grade: null,
      minimumGrade: 4,
      isPending: true,
      createdAt: "2026-05-03T12:00:00.000Z",
      updatedAt: "2026-05-03T12:00:00.000Z",
    });

    await updateEvaluation("e-1", {
      name: "Actualizada",
      weight: 40,
      grade: 5.8,
    });

    expect(evaluationRepository.updateEvaluation).toHaveBeenCalledWith(
      "e-1",
      expect.objectContaining({
        category: "presentation",
        blockId: "presentation",
      }),
    );
  });
});

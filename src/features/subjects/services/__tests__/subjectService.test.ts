import {
    CHILE_1_7_GRADE_SCALE,
    DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
} from "@/src/domain/rules";
import * as subjectRepository from "@/src/features/subjects/repositories/subjectRepository";
import * as evaluationRepository from "@/src/storage/repositories/evaluationRepository";

import { createSubject, deleteSubject } from "../subjectService";

jest.mock("@/src/features/subjects/repositories/subjectRepository", () => ({
  getPersistedSubjectById: jest.fn(),
  getPersistedSubjects: jest.fn(async () => []),
  removePersistedSubject: jest.fn(),
  savePersistedSubject: jest.fn(async () => undefined),
  updatePersistedSubject: jest.fn(),
}));

const mockGetAcademicSettingsTemplate = jest.fn(
  async () => DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
);

jest.mock("@/src/storage/settingsStorage", () => ({
  getAcademicSettingsTemplate: () => mockGetAcademicSettingsTemplate(),
}));

jest.mock("@/src/storage/repositories/evaluationRepository", () => ({
  deleteEvaluationsBySubjectId: jest.fn(async () => undefined),
}));

describe("subjectService.createSubject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crea ramo nuevo guardando subjectAcademicConfig desde plantilla global", async () => {
    mockGetAcademicSettingsTemplate.mockResolvedValue({
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "duoc_60_40",
      defaultPassingGrade: 4.0,
    });

    const subject = await createSubject({
      name: "Arquitectura de Software",
      minimumGrade: 4.0,
      color: "#2563EB",
    });

    expect(subject.minimumGrade).toBe(4.0);
    expect(subject.subjectAcademicConfig?.profileId).toBe("duoc_60_40");
    expect(subject.subjectAcademicConfig?.calculationProfileId).toBe(
      "duoc_60_40",
    );
    expect(subject.subjectAcademicConfig?.academicConfigVersion).toBe(1);
    expect(subject.subjectAcademicConfig?.blocks).toEqual([
      {
        id: "presentation",
        name: "Presentacion",
        weight: 60,
        type: "presentation",
      },
      { id: "exam", name: "Examen", weight: 40, type: "exam" },
    ]);
    expect(subjectRepository.savePersistedSubject).toHaveBeenCalledWith(
      expect.objectContaining({
        minimumGrade: 4.0,
        subjectAcademicConfig: expect.objectContaining({
          profileId: "duoc_60_40",
          calculationProfileId: "duoc_60_40",
          minGrade: 1,
          maxGrade: 7,
        }),
      }),
    );
  });

  it("minimumGrade del input sobrescribe passingGrade del snapshot", async () => {
    mockGetAcademicSettingsTemplate.mockResolvedValue({
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultPassingGrade: 5.5,
      defaultGradeScale: CHILE_1_7_GRADE_SCALE,
    });

    const subject = await createSubject({
      name: "Programacion",
      minimumGrade: 4.3,
      color: "#0EA5E9",
    });

    expect(subject.minimumGrade).toBe(4.3);
    expect(subject.subjectAcademicConfig?.passingGrade).toBe(4.3);
  });

  it("createSubject respeta academicProfileId elegido para el ramo", async () => {
    mockGetAcademicSettingsTemplate.mockResolvedValue({
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "weighted_general",
      defaultPassingGrade: 4.0,
    });

    const subject = await createSubject({
      name: "Fisica",
      minimumGrade: 4.2,
      color: "#0284C7",
      academicProfileId: "higher_ed_70_30",
    });

    expect(subject.subjectAcademicConfig?.profileId).toBe("higher_ed_70_30");
    expect(subject.subjectAcademicConfig?.calculationProfileId).toBe(
      "higher_ed_70_30",
    );
    expect(subject.subjectAcademicConfig?.passingGrade).toBe(4.2);
  });

  it("deleteSubject elimina evaluaciones asociadas antes del ramo", async () => {
    await deleteSubject("subject-1");

    expect(evaluationRepository.deleteEvaluationsBySubjectId).toHaveBeenCalledWith(
      "subject-1",
    );
    expect(subjectRepository.removePersistedSubject).toHaveBeenCalledWith(
      "subject-1",
    );
    expect(
      (
        evaluationRepository.deleteEvaluationsBySubjectId as jest.Mock
      ).mock.invocationCallOrder[0],
    ).toBeLessThan(
      (subjectRepository.removePersistedSubject as jest.Mock)
        .mock.invocationCallOrder[0],
    );
  });

  it("deleteSubject relanza error si falla eliminación de evaluaciones", async () => {
    (evaluationRepository.deleteEvaluationsBySubjectId as jest.Mock).mockRejectedValueOnce(
      new Error("db error"),
    );

    await expect(deleteSubject("subject-2")).rejects.toThrow("db error");
    expect(subjectRepository.removePersistedSubject).not.toHaveBeenCalled();
  });
});

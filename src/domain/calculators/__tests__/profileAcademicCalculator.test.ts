import type { Evaluation } from "@/src/domain/entities";
import {
    calculateAccumulatedPoints,
    calculateCompletedWeight,
    calculateCurrentWeightedAverage,
} from "../gradeCalculator";
import { calculateAcademicResultByProfile } from "../profileAcademicCalculator";

function makeEvaluation(overrides: Partial<Evaluation>): Evaluation {
  return {
    id: overrides.id ?? "e-1",
    subjectId: overrides.subjectId ?? "s-1",
    name: overrides.name ?? "Evaluacion",
    category: overrides.category,
    blockId: overrides.blockId,
    weight: overrides.weight ?? 100,
    grade: overrides.grade ?? null,
    minimumGrade: overrides.minimumGrade ?? 4,
    isPending: overrides.isPending ?? overrides.grade == null,
    createdAt: overrides.createdAt ?? "2026-05-03T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-05-03T00:00:00.000Z",
  };
}

describe("profileAcademicCalculator", () => {
  it("weighted_general con evaluaciones completas equivale al motor actual", () => {
    const evaluations = [
      makeEvaluation({ id: "a", weight: 30, grade: 5.4 }),
      makeEvaluation({ id: "b", weight: 30, grade: 6.1 }),
      makeEvaluation({ id: "c", weight: 40, grade: 4.8 }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "weighted_general",
      passingGrade: 4,
      evaluations,
    });

    expect(result.accumulatedPoints).toBe(
      calculateAccumulatedPoints(evaluations),
    );
    expect(result.completedWeight).toBe(calculateCompletedWeight(evaluations));
    expect(result.currentAverage).toBe(
      calculateCurrentWeightedAverage(evaluations),
    );
    expect(result.finalGrade).not.toBeNull();
  });

  it("weighted_general no trata pendientes como cero", () => {
    const evaluations = [
      makeEvaluation({ id: "a", weight: 50, grade: 6 }),
      makeEvaluation({ id: "b", weight: 50, grade: null }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "weighted_general",
      passingGrade: 4,
      evaluations,
    });

    expect(result.currentAverage).toBe(6);
    expect(result.completedWeight).toBe(50);
    expect(result.pendingWeight).toBe(50);
    expect(result.finalGrade).toBeNull();
  });

  it("chile_school_general se comporta como weighted_general", () => {
    const evaluations = [
      makeEvaluation({ id: "a", weight: 50, grade: 5.5 }),
      makeEvaluation({ id: "b", weight: 50, grade: 4.5 }),
    ];

    const weighted = calculateAcademicResultByProfile({
      profileId: "weighted_general",
      passingGrade: 4,
      evaluations,
    });

    const school = calculateAcademicResultByProfile({
      profileId: "chile_school_general",
      passingGrade: 4,
      evaluations,
      minGrade: 1,
      maxGrade: 7,
    });

    expect(school.accumulatedPoints).toBe(weighted.accumulatedPoints);
    expect(school.currentAverage).toBe(weighted.currentAverage);
    expect(school.finalGrade).toBe(weighted.finalGrade);
  });

  it("duoc_60_40 completo calcula presentationGrade, examGrade y finalGrade", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 33,
        grade: 6.2,
      }),
      makeEvaluation({
        id: "p2",
        category: "presentation",
        weight: 33,
        grade: 5.6,
      }),
      makeEvaluation({
        id: "p3",
        category: "presentation",
        weight: 34,
        grade: 5.2,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: 6.0 }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "duoc_60_40",
      passingGrade: 4,
      evaluations,
    });

    expect(result.presentationGrade).toBeCloseTo(5.662, 3);
    expect(result.examGrade).toBe(6);
    expect(result.finalGrade).toBeCloseTo(5.7972, 3);
    expect(result.isFinalComplete).toBe(true);
  });

  it("duoc_60_40 con presentacion incompleta deja finalGrade null", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 30,
        grade: 6.6,
      }),
      makeEvaluation({
        id: "p2",
        category: "presentation",
        weight: 40,
        grade: null,
      }),
      makeEvaluation({
        id: "p3",
        category: "presentation",
        weight: 30,
        grade: null,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: 5.8 }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "duoc_60_40",
      passingGrade: 4,
      evaluations,
    });

    expect(result.presentationCurrentAverage).toBe(6.6);
    expect(result.isPresentationComplete).toBe(false);
    expect(result.finalGrade).toBeNull();
  });

  it("duoc_60_40 con varias pendientes calcula completedWeight correctamente", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 32,
        grade: 5.8,
      }),
      makeEvaluation({
        id: "p2",
        category: "presentation",
        weight: 12,
        grade: null,
      }),
      makeEvaluation({
        id: "p3",
        category: "presentation",
        weight: 32,
        grade: 6.1,
      }),
      makeEvaluation({
        id: "p4",
        category: "presentation",
        weight: 12,
        grade: null,
      }),
      makeEvaluation({
        id: "p5",
        category: "presentation",
        weight: 12,
        grade: null,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: null }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "duoc_60_40",
      passingGrade: 4,
      evaluations,
    });

    expect(result.presentationCompletedWeight).toBe(64);
    expect(result.presentationPendingWeight).toBe(36);
    expect(result.completedWeight).toBe(64);
  });

  it("duoc_60_40 con examen dividido calcula examGrade correctamente", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 100,
        grade: 5.5,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 25, grade: 4.0 }),
      makeEvaluation({ id: "e2", category: "exam", weight: 75, grade: 6.0 }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "duoc_60_40",
      passingGrade: 4,
      evaluations,
    });

    expect(result.examGrade).toBe(5.5);
    expect(result.finalGrade).toBe(5.5);
  });

  it("duoc_60_40 con extraordinary reemplaza examGrade", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 100,
        grade: 5.0,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: 2.5 }),
      makeEvaluation({
        id: "x1",
        category: "extraordinary",
        weight: 100,
        grade: 6.2,
      }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "duoc_60_40",
      passingGrade: 4,
      evaluations,
    });

    expect(result.usedExtraordinaryExam).toBe(true);
    expect(result.examGrade).toBe(6.2);
    expect(result.finalGrade).toBeCloseTo(5.48, 2);
  });

  it("higher_70_30 calcula presentacion 70 y examen 30", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 100,
        grade: 6.0,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: 5.0 }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "higher_70_30",
      passingGrade: 4,
      evaluations,
    });

    expect(result.profileId).toBe("higher_ed_70_30");
    expect(result.finalGrade).toBe(5.7);
  });

  it("higher_75_25 calcula presentacion 75 y examen 25", () => {
    const evaluations = [
      makeEvaluation({
        id: "p1",
        category: "presentation",
        weight: 100,
        grade: 6.0,
      }),
      makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: 5.0 }),
    ];

    const result = calculateAcademicResultByProfile({
      profileId: "higher_75_25",
      passingGrade: 4,
      evaluations,
    });

    expect(result.profileId).toBe("higher_ed_75_25");
    expect(result.finalGrade).toBe(5.75);
  });

  it("custom usa fallback weighted_general y genera warning", () => {
    const evaluations = [makeEvaluation({ id: "a", weight: 100, grade: 5.5 })];

    const result = calculateAcademicResultByProfile({
      profileId: "custom",
      passingGrade: 4,
      evaluations,
    });

    expect(result.profileId).toBe("weighted_general");
    expect(result.warnings.some((warning) => warning.includes("custom"))).toBe(
      true,
    );
  });

  it("perfil desconocido usa fallback weighted_general y genera warning", () => {
    const result = calculateAcademicResultByProfile({
      profileId: "unknown_profile",
      passingGrade: 4,
      evaluations: [makeEvaluation({ id: "a", weight: 100, grade: 5 })],
    });

    expect(result.profileId).toBe("weighted_general");
    expect(
      result.warnings.some((warning) => warning.includes("desconocido")),
    ).toBe(true);
  });

  it("nota fuera de escala genera warning y se trata como pendiente", () => {
    const result = calculateAcademicResultByProfile({
      profileId: "weighted_general",
      passingGrade: 4,
      evaluations: [
        makeEvaluation({ id: "a", weight: 50, grade: 8.5 }),
        makeEvaluation({ id: "b", weight: 50, grade: 6.0 }),
      ],
    });

    expect(result.completedWeight).toBe(50);
    expect(result.pendingWeight).toBe(50);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("ponderacion de bloque distinta a 100 genera warning", () => {
    const result = calculateAcademicResultByProfile({
      profileId: "duoc_60_40",
      passingGrade: 4,
      evaluations: [
        makeEvaluation({
          id: "p1",
          category: "presentation",
          weight: 40,
          grade: 5.5,
        }),
        makeEvaluation({
          id: "p2",
          category: "presentation",
          weight: 40,
          grade: 5.5,
        }),
        makeEvaluation({ id: "e1", category: "exam", weight: 100, grade: 5.5 }),
      ],
    });

    expect(
      result.warnings.some((warning) => warning.includes("presentation")),
    ).toBe(true);
  });
});

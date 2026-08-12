import type { EvaluationListItem } from "@/src/features/subjects/types/evaluation.types";

import {
  calculateAccumulatedPoints,
  calculateAcademicSummary,
  calculateCompletedWeight,
  calculateCurrentAverage,
  calculatePendingWeight,
  calculateRequiredGrade,
  calculateStatus,
} from "../academicCalculator";

function makeEval(overrides: Partial<EvaluationListItem>): EvaluationListItem {
  return {
    id: "1",
    subjectId: "s1",
    name: "Prueba",
    weight: 100,
    grade: null,
    minimumGrade: 4.0,
    isPending: true,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

// ─── calculateAccumulatedPoints ───────────────────────────────────────────────

describe("calculateAccumulatedPoints", () => {
  it("calcula 2.31 con nota 6.6 y ponderación 35%", () => {
    const evals = [makeEval({ grade: 6.6, weight: 35 })];
    expect(calculateAccumulatedPoints(evals)).toBeCloseTo(2.31, 2);
  });

  it("ignora evaluaciones sin nota", () => {
    const evals = [makeEval({ grade: null, weight: 100 })];
    expect(calculateAccumulatedPoints(evals)).toBe(0);
  });

  it("no suma evaluaciones pendientes al acumulado cuando hay mezcla", () => {
    const evals = [
      makeEval({ id: "1", grade: 5.0, weight: 40 }),
      makeEval({ id: "2", grade: null, weight: 60 }),
    ];
    expect(calculateAccumulatedPoints(evals)).toBe(2.0);
  });
});

// ─── calculateCompletedWeight / calculatePendingWeight ───────────────────────

describe("calculateCompletedWeight", () => {
  it("retorna 35 cuando la evaluación con nota vale 35%", () => {
    const evals = [makeEval({ grade: 6.6, weight: 35 })];
    expect(calculateCompletedWeight(evals)).toBe(35);
  });

  it("suma correctamente el peso de múltiples evaluaciones con nota", () => {
    const evals = [
      makeEval({ id: "1", grade: 6.0, weight: 30 }),
      makeEval({ id: "2", grade: 5.0, weight: 30 }),
      makeEval({ id: "3", grade: null, weight: 40 }),
    ];
    expect(calculateCompletedWeight(evals)).toBe(60);
  });
});

describe("calculatePendingWeight", () => {
  it("retorna 65 cuando la evaluación sin nota vale 65%", () => {
    const evals = [makeEval({ grade: null, weight: 65 })];
    expect(calculatePendingWeight(evals)).toBe(65);
  });

  it("suma correctamente el peso de múltiples evaluaciones sin nota", () => {
    const evals = [
      makeEval({ id: "1", grade: 6.0, weight: 30 }),
      makeEval({ id: "2", grade: null, weight: 30 }),
      makeEval({ id: "3", grade: null, weight: 40 }),
    ];
    expect(calculatePendingWeight(evals)).toBe(70);
  });

  it("pesos rendido y pendiente suman 100 cuando la ponderación es completa", () => {
    const evals = [
      makeEval({ id: "1", grade: 6.0, weight: 60 }),
      makeEval({ id: "2", grade: null, weight: 40 }),
    ];
    const completed = calculateCompletedWeight(evals);
    const pending = calculatePendingWeight(evals);
    expect(completed + pending).toBe(100);
  });
});

// ─── calculateCurrentAverage ─────────────────────────────────────────────────

describe("calculateCurrentAverage", () => {
  it("retorna null cuando completedWeight es 0", () => {
    expect(calculateCurrentAverage(0, 0)).toBeNull();
  });

  it("retorna la nota final cuando todas las evaluaciones están completas", () => {
    expect(calculateCurrentAverage(5.5, 100)).toBe(5.5);
  });

  it("proyecta el promedio parcial con peso rendido menor a 100", () => {
    // 2.0 acumulados sobre 40% rendido → promedio = 2.0 / 0.4 = 5.0
    expect(calculateCurrentAverage(2.0, 40)).toBe(5.0);
  });
});

// ─── calculateRequiredGrade ──────────────────────────────────────────────────

describe("calculateRequiredGrade", () => {
  it("calcula ~2.60 con mínima 4.0 y 2.31 acumulados en 65% pendiente", () => {
    expect(calculateRequiredGrade(2.31, 65, 4.0)).toBeCloseTo(2.6, 1);
  });

  it("retorna null cuando no hay peso pendiente", () => {
    expect(calculateRequiredGrade(3.5, 0, 4.0)).toBeNull();
  });
});

// ─── calculateStatus ─────────────────────────────────────────────────────────

describe("calculateStatus", () => {
  const base = {
    hasGradedEvaluations: true,
    hasPendingEvaluations: true,
    hasIncompleteConfiguration: false,
    completedWeight: 60,
    pendingWeight: 40,
    currentAverage: null,
    requiredGrade: null,
    passingGrade: 4.0,
  };

  it("retorna pending cuando no hay evaluaciones con nota", () => {
    expect(
      calculateStatus({ ...base, hasGradedEvaluations: false, completedWeight: 0 }),
    ).toBe("pending");
  });

  it("retorna approved cuando el ramo está cerrado y promedio >= mínima", () => {
    expect(
      calculateStatus({
        ...base,
        hasPendingEvaluations: false,
        pendingWeight: 0,
        completedWeight: 100,
        currentAverage: 5.2,
      }),
    ).toBe("approved");
  });

  it("retorna failed cuando el ramo está cerrado y promedio < mínima", () => {
    expect(
      calculateStatus({
        ...base,
        hasPendingEvaluations: false,
        pendingWeight: 0,
        completedWeight: 100,
        currentAverage: 3.8,
      }),
    ).toBe("failed");
  });

  it("retorna notAchievable cuando la nota requerida supera 7", () => {
    expect(calculateStatus({ ...base, requiredGrade: 8.0 })).toBe("notAchievable");
  });

  it("retorna favorable cuando la nota requerida es <= 4", () => {
    expect(calculateStatus({ ...base, requiredGrade: 3.0 })).toBe("favorable");
  });
});

// ─── calculateAcademicSummary (integración de lógica pura) ───────────────────

describe("calculateAcademicSummary", () => {
  it("todas las evaluaciones pendientes retornan status pending y promedio null", () => {
    const evals = [
      makeEval({ id: "1", grade: null, weight: 50 }),
      makeEval({ id: "2", grade: null, weight: 50 }),
    ];
    const summary = calculateAcademicSummary({ evaluations: evals, passingGrade: 4.0 });
    expect(summary.status).toBe("pending");
    expect(summary.currentAverage).toBeNull();
  });

  it("ramo cerrado con promedio aprobatorio retorna approved y promedio correcto", () => {
    const evals = [
      makeEval({ id: "1", grade: 5.0, weight: 50 }),
      makeEval({ id: "2", grade: 6.0, weight: 50 }),
    ];
    const summary = calculateAcademicSummary({ evaluations: evals, passingGrade: 4.0 });
    expect(summary.status).toBe("approved");
    expect(summary.currentAverage).toBe(5.5);
  });

  it("ramo cerrado con promedio reprobatorio retorna failed", () => {
    const evals = [
      makeEval({ id: "1", grade: 2.0, weight: 50 }),
      makeEval({ id: "2", grade: 3.5, weight: 50 }),
    ];
    const summary = calculateAcademicSummary({ evaluations: evals, passingGrade: 4.0 });
    expect(summary.status).toBe("failed");
  });

  it("QA-32: 90% configurado con notas no se comunica como ramo cerrado", () => {
    const evals = [
      makeEval({ id: "1", grade: 6.0, weight: 50, isPending: false }),
      makeEval({ id: "2", grade: 4.0, weight: 40, isPending: false }),
    ];

    const summary = calculateAcademicSummary({
      evaluations: evals,
      passingGrade: 4.0,
    });

    expect(summary.completedWeight).toBe(90);
    expect(summary.pendingWeight).toBe(0);
    expect(summary.configuredWeight).toBe(90);
    expect(summary.unassignedWeight).toBe(10);
    expect(summary.isConfigurationIncomplete).toBe(true);
    expect(summary.currentAverage).toBeCloseTo(5.11, 2);
    expect(summary.status).toBe("pending");
    expect(summary.requiredGrade).toBeNull();
    expect(summary.advice).toContain("Configuración incompleta");
  });
});

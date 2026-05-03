import type { Evaluation } from "@/src/domain/entities";

import {
  calculateAccumulatedPoints,
  calculateCompletedWeight,
  calculateCurrentWeightedAverage,
  calculateFinalGrade,
  calculatePendingWeight,
  calculateRequiredGrade,
  clampGrade,
  findPriorityPendingEvaluation,
  isGradeBelowMinimum,
} from "../gradeCalculator";

function makeEval(overrides: Partial<Evaluation>): Evaluation {
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

// Caso real: Ramo Matemáticas — nota mínima 4.0
// Eval 1: nota 4.5, peso 30  |  Eval 2: pendiente, peso 30
const e1 = makeEval({ id: "e1", grade: 4.5, weight: 30, isPending: false });
const e2 = makeEval({ id: "e2", grade: null, weight: 30, isPending: true });
const matEvals = [e1, e2];

// ─── calculateAccumulatedPoints ───────────────────────────────────────────────

describe("calculateAccumulatedPoints", () => {
  it("Matemáticas: 4.5 × 30% = 1.35 puntos acumulados", () => {
    expect(calculateAccumulatedPoints(matEvals)).toBeCloseTo(1.35, 4);
  });

  it("retorna 0 cuando no hay evaluaciones con nota", () => {
    expect(calculateAccumulatedPoints([makeEval({ grade: null })])).toBe(0);
  });
});

// ─── calculateCompletedWeight ─────────────────────────────────────────────────

describe("calculateCompletedWeight", () => {
  it("Matemáticas: ponderación rendida = 30", () => {
    expect(calculateCompletedWeight(matEvals)).toBe(30);
  });
});

// ─── calculatePendingWeight ───────────────────────────────────────────────────

describe("calculatePendingWeight", () => {
  it("Matemáticas: ponderación pendiente existente = 30", () => {
    expect(calculatePendingWeight(matEvals)).toBe(30);
  });
});

// ─── suma total y ponderación no asignada (derivadas, sin función propia) ─────

describe("suma total y ponderación no asignada", () => {
  it("suma total de ponderaciones = 60 (completedWeight + pendingWeight)", () => {
    const total =
      calculateCompletedWeight(matEvals) + calculatePendingWeight(matEvals);
    expect(total).toBe(60);
  });

  it("ponderación no asignada = 40 (100 − suma total)", () => {
    const total =
      calculateCompletedWeight(matEvals) + calculatePendingWeight(matEvals);
    expect(100 - total).toBe(40);
  });
});

// ─── calculateCurrentWeightedAverage ─────────────────────────────────────────

describe("calculateCurrentWeightedAverage", () => {
  it("Matemáticas: promedio ponderado actual = 4.5", () => {
    expect(calculateCurrentWeightedAverage(matEvals)).toBe(4.5);
  });

  it("retorna null cuando no hay evaluaciones con nota", () => {
    expect(
      calculateCurrentWeightedAverage([makeEval({ grade: null })]),
    ).toBeNull();
  });
});

// ─── calculateRequiredGrade ───────────────────────────────────────────────────

describe("calculateRequiredGrade", () => {
  it("Matemáticas: nota necesaria ≈ 8.83 (supera 7.0 → no alcanzable)", () => {
    // (4.0 − 1.35) / 0.30 = 8.833...
    expect(calculateRequiredGrade(matEvals, 4.0)).toBeCloseTo(8.83, 1);
  });

  it("retorna null cuando no hay ponderación pendiente", () => {
    const evals = [makeEval({ grade: 5.0, weight: 100, isPending: false })];
    expect(calculateRequiredGrade(evals, 4.0)).toBeNull();
  });

  it("nota necesaria favorable cuando el acumulado ya supera el mínimo", () => {
    // 6.0 × 80% = 4.8 acumulados, mínima 4.0, pendiente 20%
    // (4.0 − 4.8) / 0.20 = −4.0 → favorable (negativo)
    const evals = [
      makeEval({ id: "a", grade: 6.0, weight: 80, isPending: false }),
      makeEval({ id: "b", grade: null, weight: 20, isPending: true }),
    ];
    const required = calculateRequiredGrade(evals, 4.0);
    expect(required).not.toBeNull();
    expect(required!).toBeLessThanOrEqual(4.0);
  });
});

// ─── calculateFinalGrade ──────────────────────────────────────────────────────

describe("calculateFinalGrade", () => {
  it("Matemáticas: retorna null cuando hay ponderación pendiente", () => {
    expect(calculateFinalGrade(matEvals)).toBeNull();
  });

  it("retorna la nota final cuando todas las evaluaciones están completas", () => {
    const evals = [
      makeEval({ id: "a", grade: 5.0, weight: 50, isPending: false }),
      makeEval({ id: "b", grade: 7.0, weight: 50, isPending: false }),
    ];
    // (5.0×0.5 + 7.0×0.5) = 6.0 sobre el 100% total
    expect(calculateFinalGrade(evals)).toBe(6.0);
  });
});

// ─── findPriorityPendingEvaluation ────────────────────────────────────────────

describe("findPriorityPendingEvaluation", () => {
  it("Matemáticas: retorna la evaluación pendiente (e2)", () => {
    expect(findPriorityPendingEvaluation(matEvals)?.id).toBe("e2");
  });

  it("retorna null cuando no hay evaluaciones pendientes", () => {
    const evals = [makeEval({ grade: 5.0, weight: 100, isPending: false })];
    expect(findPriorityPendingEvaluation(evals)).toBeNull();
  });

  it("retorna la evaluación pendiente de mayor ponderación", () => {
    const evals = [
      makeEval({ id: "x1", grade: null, weight: 20, isPending: true }),
      makeEval({ id: "x2", grade: null, weight: 40, isPending: true }),
      makeEval({ id: "x3", grade: null, weight: 30, isPending: true }),
    ];
    expect(findPriorityPendingEvaluation(evals)?.id).toBe("x2");
  });
});

// ─── clampGrade ───────────────────────────────────────────────────────────────

describe("clampGrade", () => {
  it("no modifica una nota dentro del rango", () => {
    expect(clampGrade(5.5)).toBe(5.5);
  });

  it("clampea a MIN_GRADE (2.0) cuando la nota es menor", () => {
    expect(clampGrade(1.0)).toBe(2.0);
  });

  it("clampea a MAX_GRADE (7.0) cuando la nota es mayor", () => {
    expect(clampGrade(8.5)).toBe(7.0);
  });
});

// ─── isGradeBelowMinimum ──────────────────────────────────────────────────────

describe("isGradeBelowMinimum", () => {
  it("retorna true cuando la nota es menor al mínimo del sistema (2.0)", () => {
    expect(isGradeBelowMinimum(1.5)).toBe(true);
  });

  it("retorna false cuando la nota es igual al mínimo", () => {
    expect(isGradeBelowMinimum(2.0)).toBe(false);
  });

  it("retorna false cuando la nota supera el mínimo", () => {
    expect(isGradeBelowMinimum(4.0)).toBe(false);
  });
});

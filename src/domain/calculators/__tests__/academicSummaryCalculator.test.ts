import type { Evaluation, Subject } from "@/src/domain/entities";

import { calculateAcademicSummary } from "../academicSummaryCalculator";

const matSubject: Subject = {
  id: "math-1",
  name: "Matemáticas",
  passingGrade: 4.0,
  accumulatedWeight: 0,
  createdAt: "",
  updatedAt: "",
};

function makeEval(overrides: Partial<Evaluation>): Evaluation {
  return {
    id: "1",
    subjectId: "math-1",
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

// ─── Caso real: Ramo Matemáticas ──────────────────────────────────────────────

describe("calculateAcademicSummary — Ramo Matemáticas (nota mínima 4.0)", () => {
  const evalGraded = makeEval({ id: "e1", grade: 4.5, weight: 30, isPending: false });
  const evalPending = makeEval({ id: "e2", grade: null, weight: 30, isPending: true });
  const evals = [evalGraded, evalPending];
  const summary = calculateAcademicSummary(matSubject, evals);

  it("puntos acumulados = 1.35", () => {
    expect(summary.accumulatedPoints).toBeCloseTo(1.35, 4);
  });

  it("promedio ponderado actual = 4.5", () => {
    expect(summary.currentAverage).toBe(4.5);
  });

  it("ponderación rendida = 30", () => {
    expect(summary.completedWeight).toBe(30);
  });

  it("ponderación pendiente existente = 30", () => {
    expect(summary.pendingWeight).toBe(30);
  });

  it("nota requerida ≈ 8.83 (supera 7.0)", () => {
    expect(summary.requiredGrade).toBeCloseTo(8.83, 1);
  });

  it("estado = notAchievable", () => {
    expect(summary.status).toBe("notAchievable");
  });

  it("nota final = null (hay ponderación pendiente)", () => {
    expect(summary.finalGrade).toBeNull();
  });

  it("la evaluación prioritaria es la pendiente (e2)", () => {
    expect(summary.priorityEvaluation?.id).toBe("e2");
  });
});

// ─── Ramo aprobado (todas completas, promedio >= mínima) ─────────────────────

describe("calculateAcademicSummary — ramo cerrado aprobado", () => {
  const evals = [
    makeEval({ id: "a", grade: 5.0, weight: 50, isPending: false }),
    makeEval({ id: "b", grade: 5.0, weight: 50, isPending: false }),
  ];
  const summary = calculateAcademicSummary(matSubject, evals);

  it("estado = approved", () => {
    expect(summary.status).toBe("approved");
  });

  it("nota final = 5.0", () => {
    expect(summary.finalGrade).toBe(5.0);
  });

  it("ponderación pendiente = 0", () => {
    expect(summary.pendingWeight).toBe(0);
  });
});

// ─── Ramo reprobado (todas completas, promedio < mínima) ─────────────────────

describe("calculateAcademicSummary — ramo cerrado reprobado", () => {
  const evals = [
    makeEval({ id: "a", grade: 3.0, weight: 50, isPending: false }),
    makeEval({ id: "b", grade: 3.5, weight: 50, isPending: false }),
  ];
  const summary = calculateAcademicSummary(matSubject, evals);

  it("estado = failed", () => {
    expect(summary.status).toBe("failed");
  });

  it("nota final < nota mínima", () => {
    expect(summary.finalGrade).not.toBeNull();
    expect(summary.finalGrade!).toBeLessThan(matSubject.passingGrade);
  });
});

// ─── Ramo sin evaluaciones ────────────────────────────────────────────────────

describe("calculateAcademicSummary — sin evaluaciones", () => {
  const summary = calculateAcademicSummary(matSubject, []);

  it("estado = pending", () => {
    expect(summary.status).toBe("pending");
  });

  it("promedio actual = null", () => {
    expect(summary.currentAverage).toBeNull();
  });

  it("puntos acumulados = 0", () => {
    expect(summary.accumulatedPoints).toBe(0);
  });
});

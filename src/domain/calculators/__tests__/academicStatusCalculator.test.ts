import { getAcademicStatus } from "../academicStatusCalculator";

const base = {
  evaluationsCount: 3,
  completedWeight: 75,
  pendingWeight: 25,
  finalGrade: null,
  requiredGrade: null,
  minimumGrade: 4.0,
};

describe("getAcademicStatus", () => {
  it("retorna pending sin evaluaciones", () => {
    expect(
      getAcademicStatus({ ...base, evaluationsCount: 0, completedWeight: 0 }),
    ).toBe("pending");
  });

  it("retorna pending cuando completedWeight es 0 aunque haya evaluaciones", () => {
    expect(getAcademicStatus({ ...base, completedWeight: 0 })).toBe("pending");
  });

  it("retorna favorable cuando la nota requerida es menor a 2", () => {
    expect(getAcademicStatus({ ...base, requiredGrade: 1.5 })).toBe("favorable");
  });

  it("retorna favorable cuando la nota requerida es exactamente 4", () => {
    expect(getAcademicStatus({ ...base, requiredGrade: 4.0 })).toBe("favorable");
  });

  it("retorna notAchievable cuando la nota requerida supera 7", () => {
    expect(getAcademicStatus({ ...base, requiredGrade: 8.5 })).toBe("notAchievable");
  });

  it("retorna approved cuando el ramo está cerrado y la nota final supera la mínima", () => {
    expect(
      getAcademicStatus({
        ...base,
        completedWeight: 100,
        pendingWeight: 0,
        finalGrade: 5.2,
        requiredGrade: null,
      }),
    ).toBe("approved");
  });

  it("retorna failed cuando el ramo está cerrado y la nota final es menor a la mínima", () => {
    expect(
      getAcademicStatus({
        ...base,
        completedWeight: 100,
        pendingWeight: 0,
        finalGrade: 3.9,
        requiredGrade: null,
      }),
    ).toBe("failed");
  });

  it("retorna achievable cuando la nota requerida está entre 4 y 5", () => {
    expect(getAcademicStatus({ ...base, requiredGrade: 4.5 })).toBe("achievable");
  });

  it("retorna atRisk cuando la nota requerida supera 5 pero no 7", () => {
    expect(getAcademicStatus({ ...base, requiredGrade: 6.0 })).toBe("atRisk");
  });
});

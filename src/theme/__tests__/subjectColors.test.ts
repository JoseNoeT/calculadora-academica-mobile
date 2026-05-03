import {
  assignSubjectColor,
  getSubjectColorByValue,
  SUBJECT_COLORS,
} from "../subjectColors";

describe("SUBJECT_COLORS", () => {
  it("contiene más de 5 colores", () => {
    expect(SUBJECT_COLORS.length).toBeGreaterThan(5);
  });

  it("cada color tiene los campos requeridos (id, name, background, textOnColor)", () => {
    for (const color of SUBJECT_COLORS) {
      expect(color.id).toBeTruthy();
      expect(color.name).toBeTruthy();
      expect(color.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color.textOnColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("todos los ids son únicos", () => {
    const ids = SUBJECT_COLORS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(SUBJECT_COLORS.length);
  });
});

describe("getSubjectColorByValue", () => {
  it("reconoce el hex original azul #2563EB", () => {
    const color = getSubjectColorByValue("#2563EB");
    expect(color).toBeDefined();
    expect(color?.id).toBe("blue");
  });

  it("retorna undefined para un hex desconocido", () => {
    expect(getSubjectColorByValue("#000000")).toBeUndefined();
  });
});

describe("assignSubjectColor", () => {
  it("asigna un color válido cuando no hay ninguno usado", () => {
    const color = assignSubjectColor([]);
    expect(color).toBeDefined();
    expect(SUBJECT_COLORS).toContainEqual(color);
  });

  it("no repite color cuando hay disponibles", () => {
    const first = assignSubjectColor([]);
    const second = assignSubjectColor([first.background]);
    expect(second.background).not.toBe(first.background);
  });

  it("no repite ningún color mientras haya disponibles", () => {
    const used: string[] = [];
    for (let i = 0; i < SUBJECT_COLORS.length - 1; i++) {
      const color = assignSubjectColor(used);
      expect(used).not.toContain(color.background);
      used.push(color.background);
    }
  });

  it("usa fallback modular cuando todos los colores están usados", () => {
    const allUsed = SUBJECT_COLORS.map((c) => c.background);
    const color = assignSubjectColor(allUsed);
    expect(color).toBeDefined();
    expect(SUBJECT_COLORS).toContainEqual(color);
  });
});

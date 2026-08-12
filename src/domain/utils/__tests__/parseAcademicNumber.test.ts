import { parseAcademicNumber } from "../parseAcademicNumber";

describe("parseAcademicNumber", () => {
  it('"4,5" → 4.5', () => {
    expect(parseAcademicNumber("4,5")).toBe(4.5);
  });

  it('"4.5" → 4.5', () => {
    expect(parseAcademicNumber("4.5")).toBe(4.5);
  });

  it('" 4,0 " → 4 (ignora espacios)', () => {
    expect(parseAcademicNumber(" 4,0 ")).toBe(4);
  });

  it('"" → null', () => {
    expect(parseAcademicNumber("")).toBeNull();
  });

  it('"   " → null', () => {
    expect(parseAcademicNumber("   ")).toBeNull();
  });

  it('"abc" → null', () => {
    expect(parseAcademicNumber("abc")).toBeNull();
  });

  it('"4,5,6" → null (múltiples comas)', () => {
    expect(parseAcademicNumber("4,5,6")).toBeNull();
  });

  it('"4.5.6" → null (múltiples puntos)', () => {
    expect(parseAcademicNumber("4.5.6")).toBeNull();
  });
});

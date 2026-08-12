import {
    CHILE_1_7_GRADE_SCALE,
    DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
} from "@/src/domain/rules";
import type { AcademicSettingsTemplate } from "@/src/domain/types";
import {
    getAcademicSettingsTemplate,
    getAppPreferences,
    resetAcademicSettingsTemplate,
    saveAcademicSettings,
    saveAcademicSettingsTemplate,
} from "@/src/storage/settingsStorage";

const settingsStore = new Map<string, string>();

const mockDatabase = {
  getFirstAsync: jest.fn(async (_query: string, params?: unknown[]) => {
    const key = (params?.[0] as string | undefined) ?? "";
    const value = settingsStore.get(key);

    if (typeof value === "undefined") {
      return null;
    }

    return { value };
  }),
  runAsync: jest.fn(async (_query: string, params?: unknown[]) => {
    const key = params?.[0] as string | undefined;
    const value = params?.[1] as string | undefined;

    if (typeof key === "string" && typeof value === "string") {
      settingsStore.set(key, value);
    }
  }),
  execAsync: jest.fn(async (query: string) => {
    if (query.includes("DELETE FROM app_settings")) {
      settingsStore.clear();
    }
  }),
};

jest.mock("@/src/storage/database/migrations", () => ({
  initializeDatabase: jest.fn(async () => undefined),
}));

jest.mock("@/src/storage/database/sqliteClient", () => ({
  getDatabase: jest.fn(async () => mockDatabase),
}));

describe("settingsStorage academic template", () => {
  beforeEach(() => {
    settingsStore.clear();
    jest.clearAllMocks();
  });

  it("devuelve DEFAULT_ACADEMIC_SETTINGS_TEMPLATE cuando no hay plantilla guardada", async () => {
    const template = await getAcademicSettingsTemplate();

    expect(template).toEqual(DEFAULT_ACADEMIC_SETTINGS_TEMPLATE);
  });

  it("guarda y recupera AcademicSettingsTemplate", async () => {
    const template: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "duoc_60_40",
      defaultPassingGrade: 4.8,
      updatedAt: "2026-05-03T10:00:00.000Z",
    };

    await saveAcademicSettingsTemplate(template);
    const stored = await getAcademicSettingsTemplate();

    expect(stored).toEqual(template);
  });

  it("si JSON esta corrupto, vuelve al default", async () => {
    settingsStore.set("academicSettingsTemplate", "{ json_corrupto ");

    const template = await getAcademicSettingsTemplate();

    expect(template).toEqual(DEFAULT_ACADEMIC_SETTINGS_TEMPLATE);
  });

  it("respeta legacy globalPassingGrade como fallback", async () => {
    settingsStore.set("globalPassingGrade", "4.6");
    settingsStore.set("gradingScale", "1.0-7.0");

    const template = await getAcademicSettingsTemplate();

    expect(template.defaultPassingGrade).toBe(4.6);
    expect(template.defaultGradeScale).toEqual(CHILE_1_7_GRADE_SCALE);
  });

  it("no rompe getAppPreferences", async () => {
    settingsStore.set("globalPassingGrade", "4.4");
    settingsStore.set("gradingScale", "1.0-7.0");
    settingsStore.set("academicSettingsTemplate", "{ json_corrupto ");

    const preferences = await getAppPreferences();

    expect(preferences.globalPassingGrade).toBe(4.4);
    expect(preferences.gradingScale).toBe("1.0-7.0");
    expect(preferences.showAcademicAdvice).toBe(true);
    expect(preferences.showRiskAlerts).toBe(true);
    expect(preferences.enableAnimations).toBe(true);
  });

  it("resetAcademicSettingsTemplate restaura template por defecto", async () => {
    const customizedTemplate: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "higher_ed_70_30",
      defaultPassingGrade: 5.1,
      updatedAt: "2026-05-03T11:20:00.000Z",
    };

    await saveAcademicSettingsTemplate(customizedTemplate);
    await resetAcademicSettingsTemplate();

    const template = await getAcademicSettingsTemplate();

    expect(template).toEqual(DEFAULT_ACADEMIC_SETTINGS_TEMPLATE);
  });

  it("saveAcademicSettings mantiene plantilla unificada y no rompe legado", async () => {
    await saveAcademicSettingsTemplate({
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "duoc_60_40",
      defaultPassingGrade: 4.0,
    });

    await saveAcademicSettings({
      globalPassingGrade: 4.7,
      gradingScale: "1.0-7.0",
    });

    const template = await getAcademicSettingsTemplate();
    const legacy = await getAppPreferences();

    expect(template.defaultProfileId).toBe("duoc_60_40");
    expect(template.defaultPassingGrade).toBe(4.7);
    expect(template.defaultGradeScale).toEqual(CHILE_1_7_GRADE_SCALE);
    expect(legacy.globalPassingGrade).toBe(4.7);
    expect(legacy.gradingScale).toBe("1.0-7.0");
  });
});

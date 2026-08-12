import type { ThemePreference } from "../domain/entities";
import {
    ACADEMIC_CALCULATION_PROFILES,
    CHILE_1_7_GRADE_SCALE,
    DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
} from "../domain/rules";
import type { AcademicSettingsTemplate, GradeScale } from "../domain/types";
import { initializeDatabase } from "./database/migrations";
import { getDatabase } from "./database/sqliteClient";

const THEME_PREFERENCE_KEY = "themePreference";
const GLOBAL_PASSING_GRADE_KEY = "globalPassingGrade";
const GRADING_SCALE_KEY = "gradingScale";
const SHOW_ACADEMIC_ADVICE_KEY = "showAcademicAdvice";
const SHOW_RISK_ALERTS_KEY = "showRiskAlerts";
const ENABLE_ANIMATIONS_KEY = "enableAnimations";
const ACADEMIC_SETTINGS_TEMPLATE_KEY = "academicSettingsTemplate";

export type GradingScale = "1.0-7.0";

export type AcademicSettings = {
  globalPassingGrade: number;
  gradingScale: GradingScale;
};

export type BehaviorSettings = {
  showAcademicAdvice: boolean;
  showRiskAlerts: boolean;
  enableAnimations: boolean;
};

export type AppPreferences = AcademicSettings & BehaviorSettings;

const DEFAULT_PREFERENCES: AppPreferences = {
  globalPassingGrade: 4.0,
  gradingScale: "1.0-7.0",
  showAcademicAdvice: true,
  showRiskAlerts: true,
  enableAnimations: true,
};

const themePreferences: ThemePreference[] = ["system", "light", "dark"];
const gradingScales: GradingScale[] = ["1.0-7.0"];

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

function isGradingScale(value: string): value is GradingScale {
  return gradingScales.includes(value as GradingScale);
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

function isGradeScale(value: unknown): value is GradeScale {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GradeScale>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.minGrade === "number" &&
    typeof candidate.maxGrade === "number" &&
    typeof candidate.defaultPassingGrade === "number" &&
    typeof candidate.decimalPrecision === "number"
  );
}

function isAcademicSettingsTemplate(
  value: unknown,
): value is AcademicSettingsTemplate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AcademicSettingsTemplate>;

  const hasValidProfileId =
    typeof candidate.defaultProfileId === "string" &&
    candidate.defaultProfileId in ACADEMIC_CALCULATION_PROFILES;

  return (
    hasValidProfileId &&
    typeof candidate.templateVersion === "number" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.defaultPassingGrade === "number" &&
    isGradeScale(candidate.defaultGradeScale)
  );
}

function normalizeLegacyGradeScale(value: string | null): GradeScale | null {
  if (value === "1.0-7.0") {
    return CHILE_1_7_GRADE_SCALE;
  }

  return null;
}

function resolveLegacyPassingGrade(value: string | null): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 7) {
    return null;
  }

  return parsed;
}

function getTemplateWithLegacyFallback(
  legacyPassingGrade: string | null,
  legacyGradingScale: string | null,
): AcademicSettingsTemplate {
  const legacyScale = normalizeLegacyGradeScale(legacyGradingScale);
  const gradeScale =
    legacyScale ?? DEFAULT_ACADEMIC_SETTINGS_TEMPLATE.defaultGradeScale;
  const fallbackPassingGrade = resolveLegacyPassingGrade(legacyPassingGrade);
  const normalizedPassingGrade =
    fallbackPassingGrade !== null
      ? Math.min(
          Math.max(fallbackPassingGrade, gradeScale.minGrade),
          gradeScale.maxGrade,
        )
      : gradeScale.defaultPassingGrade;

  return {
    ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
    defaultCountryCode:
      gradeScale.countryCode ??
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE.defaultCountryCode,
    defaultGradeScale: gradeScale,
    defaultPassingGrade: normalizedPassingGrade,
  };
}

function normalizeTemplate(
  value: unknown,
  legacyPassingGrade: string | null,
  legacyGradingScale: string | null,
): AcademicSettingsTemplate {
  const fallbackTemplate = getTemplateWithLegacyFallback(
    legacyPassingGrade,
    legacyGradingScale,
  );

  if (!isAcademicSettingsTemplate(value)) {
    return fallbackTemplate;
  }

  const candidate = value;

  const boundedPassingGrade = Math.min(
    Math.max(
      candidate.defaultPassingGrade,
      candidate.defaultGradeScale.minGrade,
    ),
    candidate.defaultGradeScale.maxGrade,
  );

  return {
    defaultCountryCode: candidate.defaultCountryCode,
    defaultGradeScale: candidate.defaultGradeScale,
    defaultPassingGrade: boundedPassingGrade,
    defaultProfileId: candidate.defaultProfileId,
    templateVersion: candidate.templateVersion,
    updatedAt: candidate.updatedAt,
  };
}

async function getSettingValue(key: string): Promise<string | null> {
  await initializeDatabase();
  const database = await getDatabase();

  const row = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
    [key],
  );

  return row?.value ?? null;
}

async function saveSettingValue(key: string, value: string): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO app_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [key, value],
  );
}

export async function getThemePreference(): Promise<ThemePreference | null> {
  const value = await getSettingValue(THEME_PREFERENCE_KEY);

  if (!value || !isThemePreference(value)) {
    return null;
  }

  return value;
}

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  await saveSettingValue(THEME_PREFERENCE_KEY, preference);
}

export async function getAppPreferences(): Promise<AppPreferences> {
  const [
    gradeValue,
    gradingScaleValue,
    adviceValue,
    riskAlertsValue,
    animationsValue,
  ] = await Promise.all([
    getSettingValue(GLOBAL_PASSING_GRADE_KEY),
    getSettingValue(GRADING_SCALE_KEY),
    getSettingValue(SHOW_ACADEMIC_ADVICE_KEY),
    getSettingValue(SHOW_RISK_ALERTS_KEY),
    getSettingValue(ENABLE_ANIMATIONS_KEY),
  ]);

  const parsedGrade = Number(gradeValue);
  const globalPassingGrade =
    Number.isFinite(parsedGrade) && parsedGrade >= 1 && parsedGrade <= 7
      ? parsedGrade
      : DEFAULT_PREFERENCES.globalPassingGrade;

  return {
    globalPassingGrade,
    gradingScale:
      gradingScaleValue && isGradingScale(gradingScaleValue)
        ? gradingScaleValue
        : DEFAULT_PREFERENCES.gradingScale,
    showAcademicAdvice: toBoolean(
      adviceValue ?? undefined,
      DEFAULT_PREFERENCES.showAcademicAdvice,
    ),
    showRiskAlerts: toBoolean(
      riskAlertsValue ?? undefined,
      DEFAULT_PREFERENCES.showRiskAlerts,
    ),
    enableAnimations: toBoolean(
      animationsValue ?? undefined,
      DEFAULT_PREFERENCES.enableAnimations,
    ),
  };
}

export async function getAcademicSettingsTemplate(): Promise<AcademicSettingsTemplate> {
  const [templateValue, legacyPassingGrade, legacyGradingScale] =
    await Promise.all([
      getSettingValue(ACADEMIC_SETTINGS_TEMPLATE_KEY),
      getSettingValue(GLOBAL_PASSING_GRADE_KEY),
      getSettingValue(GRADING_SCALE_KEY),
    ]);

  if (!templateValue) {
    return getTemplateWithLegacyFallback(
      legacyPassingGrade,
      legacyGradingScale,
    );
  }

  try {
    const parsedTemplate = JSON.parse(templateValue) as unknown;
    return normalizeTemplate(
      parsedTemplate,
      legacyPassingGrade,
      legacyGradingScale,
    );
  } catch {
    return getTemplateWithLegacyFallback(
      legacyPassingGrade,
      legacyGradingScale,
    );
  }
}

export async function saveAcademicSettingsTemplate(
  template: AcademicSettingsTemplate,
): Promise<void> {
  const normalizedTemplate = normalizeTemplate(template, null, null);
  await saveSettingValue(
    ACADEMIC_SETTINGS_TEMPLATE_KEY,
    JSON.stringify(normalizedTemplate),
  );
}

export async function resetAcademicSettingsTemplate(): Promise<void> {
  await saveAcademicSettingsTemplate(DEFAULT_ACADEMIC_SETTINGS_TEMPLATE);
}

export async function saveAcademicSettings(
  settings: AcademicSettings,
): Promise<void> {
  await Promise.all([
    saveSettingValue(
      GLOBAL_PASSING_GRADE_KEY,
      settings.globalPassingGrade.toFixed(1),
    ),
    saveSettingValue(GRADING_SCALE_KEY, settings.gradingScale),
  ]);

  const currentTemplate = await getAcademicSettingsTemplate();
  const nextScale =
    normalizeLegacyGradeScale(settings.gradingScale) ??
    currentTemplate.defaultGradeScale;

  await saveAcademicSettingsTemplate({
    ...currentTemplate,
    defaultCountryCode:
      nextScale.countryCode ?? currentTemplate.defaultCountryCode,
    defaultGradeScale: nextScale,
    defaultPassingGrade: settings.globalPassingGrade,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveBehaviorSettings(
  settings: BehaviorSettings,
): Promise<void> {
  await Promise.all([
    saveSettingValue(
      SHOW_ACADEMIC_ADVICE_KEY,
      String(settings.showAcademicAdvice),
    ),
    saveSettingValue(SHOW_RISK_ALERTS_KEY, String(settings.showRiskAlerts)),
    saveSettingValue(ENABLE_ANIMATIONS_KEY, String(settings.enableAnimations)),
  ]);
}

export async function deleteAllSubjectsData(): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM subjects`);
}

export async function resetApplicationData(): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();

  await database.execAsync(`
    DELETE FROM subjects;
    DELETE FROM app_settings;
  `);
}

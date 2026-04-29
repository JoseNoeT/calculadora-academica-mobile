import type { ThemePreference } from "../domain/entities";
import { initializeDatabase } from "./database/migrations";
import { getDatabase } from "./database/sqliteClient";

const THEME_PREFERENCE_KEY = "themePreference";
const GLOBAL_PASSING_GRADE_KEY = "globalPassingGrade";
const GRADING_SCALE_KEY = "gradingScale";
const SHOW_ACADEMIC_ADVICE_KEY = "showAcademicAdvice";
const SHOW_RISK_ALERTS_KEY = "showRiskAlerts";
const ENABLE_ANIMATIONS_KEY = "enableAnimations";

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

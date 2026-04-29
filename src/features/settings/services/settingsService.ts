import type { AppSettings } from "../../../domain/entities";
import { DEFAULT_PASSING_GRADE } from "../../../domain/rules";
import type { UpdateSettingsInput } from "../types/settings.types";

export function createDefaultSettings(): AppSettings {
  return {
    passingGrade: DEFAULT_PASSING_GRADE,
    themePreference: "system",
    useCompactMode: false,
    enableHaptics: true,
    locale: "es-CL",
  };
}

export function mergeSettings(
  current: AppSettings,
  updates: UpdateSettingsInput,
): AppSettings {
  return {
    ...current,
    ...updates,
  };
}

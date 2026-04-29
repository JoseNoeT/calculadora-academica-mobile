import type { AppSettings, ThemePreference } from "../../../domain/entities";

export interface UpdateSettingsInput extends Partial<AppSettings> {}

export interface ThemeOption {
  value: ThemePreference;
  label: string;
}

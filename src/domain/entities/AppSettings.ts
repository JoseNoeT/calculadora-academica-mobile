import type { GradeValue } from "../types";

export type ThemePreference = "system" | "light" | "dark";

export interface AppSettings {
  passingGrade: GradeValue;
  themePreference: ThemePreference;
  useCompactMode: boolean;
  enableHaptics: boolean;
  locale: string;
}

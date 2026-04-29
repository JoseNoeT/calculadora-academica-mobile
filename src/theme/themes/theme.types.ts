export interface AppThemeAcademicColors {
  pending: string;
  approved: string;
  achievable: string;
  atRisk: string;
  notAchievable: string;
  failed: string;
}

export interface AppTheme {
  mode: "light" | "dark";
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  pending: string;
  academic: AppThemeAcademicColors;
}

export const palette = {
  blue50: "#EFF6FF",
  blue100: "#DBEAFE",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  cyan500: "#06B6D4",
  emerald500: "#10B981",
  amber500: "#F59E0B",
  orange500: "#F97316",
  red500: "#EF4444",
  rose500: "#F43F5E",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate500: "#64748B",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const academicStatusColors = {
  pending: {
    light: "#64748B",
    dark: "#94A3B8",
  },
  approved: {
    light: "#10B981",
    dark: "#34D399",
  },
  achievable: {
    light: "#06B6D4",
    dark: "#22D3EE",
  },
  atRisk: {
    light: "#F59E0B",
    dark: "#FBBF24",
  },
  notAchievable: {
    light: "#F97316",
    dark: "#FB923C",
  },
  failed: {
    light: "#EF4444",
    dark: "#F87171",
  },
} as const;

export const lightColors = {
  background: palette.slate50,
  surface: palette.white,
  surfaceElevated: palette.slate100,
  textPrimary: palette.slate900,
  textSecondary: palette.slate700,
  border: palette.slate200,
  primary: palette.blue600,
  secondary: palette.cyan500,
  success: palette.emerald500,
  warning: palette.amber500,
  danger: palette.red500,
  info: palette.blue500,
  pending: academicStatusColors.pending.light,
} as const;

export const darkColors = {
  background: palette.slate900,
  surface: palette.slate800,
  surfaceElevated: palette.slate700,
  textPrimary: palette.slate50,
  textSecondary: palette.slate300,
  border: palette.slate700,
  primary: palette.blue500,
  secondary: "#22D3EE",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#60A5FA",
  pending: academicStatusColors.pending.dark,
} as const;

export type AcademicStatus = keyof typeof academicStatusColors;

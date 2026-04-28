import { academicStatusColors, darkColors } from "../tokens/colors";

export const darkTheme = {
  mode: "dark",
  ...darkColors,
  academic: {
    pending: academicStatusColors.pending.dark,
    approved: academicStatusColors.approved.dark,
    achievable: academicStatusColors.achievable.dark,
    atRisk: academicStatusColors.atRisk.dark,
    notAchievable: academicStatusColors.notAchievable.dark,
    failed: academicStatusColors.failed.dark,
  },
} as const;

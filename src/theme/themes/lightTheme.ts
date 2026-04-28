import { academicStatusColors, lightColors } from "../tokens/colors";
import type { AppTheme } from "./theme.types";

export const lightTheme: AppTheme = {
  mode: "light",
  ...lightColors,
  academic: {
    pending: academicStatusColors.pending.light,
    approved: academicStatusColors.approved.light,
    achievable: academicStatusColors.achievable.light,
    atRisk: academicStatusColors.atRisk.light,
    notAchievable: academicStatusColors.notAchievable.light,
    failed: academicStatusColors.failed.light,
  },
};

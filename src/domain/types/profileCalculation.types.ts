import type { AcademicStatus, Evaluation } from "../entities";

export type SupportedAcademicProfileId =
  | "weighted_general"
  | "chile_school_general"
  | "duoc_60_40"
  | "higher_ed_70_30"
  | "higher_ed_75_25"
  | "higher_70_30"
  | "higher_75_25"
  | "custom"
  | string;

export interface ProfileAcademicCalculationInput {
  profileId: SupportedAcademicProfileId;
  profileName?: string;
  passingGrade: number;
  evaluations: Evaluation[];
  minGrade?: number;
  maxGrade?: number;
}

export interface ProfileAcademicCalculationResult {
  profileId: string;
  profileName: string;
  accumulatedPoints: number;
  completedWeight: number;
  pendingWeight: number;
  currentAverage: number | null;
  finalGrade: number | null;
  requiredGrade: number | null;
  status: AcademicStatus;
  advice: string;
  warnings: string[];
  presentationGrade?: number | null;
  presentationCurrentAverage?: number | null;
  presentationCompletedWeight?: number;
  presentationPendingWeight?: number;
  examGrade?: number | null;
  examCurrentAverage?: number | null;
  examCompletedWeight?: number;
  examPendingWeight?: number;
  usedExtraordinaryExam?: boolean;
  isPresentationComplete?: boolean;
  isExamComplete?: boolean;
  isFinalComplete?: boolean;
  missingAssessments?: string[];
}

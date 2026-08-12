export type GradeScaleId = string;

export type AcademicProfileId =
  | "weighted_general"
  | "chile_school_general"
  | "duoc_60_40"
  | "higher_ed_70_30"
  | "higher_ed_75_25"
  | "custom";

export type AcademicEducationLevel = "school" | "higherEducation" | "custom";

export type AcademicProfileType = "weightedGeneral" | "blockBased" | "custom";

export type AcademicBlockType =
  | "general"
  | "presentation"
  | "exam"
  | "extraordinary";

export interface GradeScale {
  id: GradeScaleId;
  name: string;
  minGrade: number;
  maxGrade: number;
  defaultPassingGrade: number;
  decimalPrecision: number;
  countryCode?: string;
}

export interface AcademicCalculationBlock {
  id: string;
  name: string;
  weight: number;
  type: AcademicBlockType;
}

export interface AcademicCalculationProfile {
  id: AcademicProfileId;
  name: string;
  description: string;
  countryCode?: string;
  institutionName?: string;
  educationLevel: AcademicEducationLevel;
  profileType: AcademicProfileType;
  blocks: AcademicCalculationBlock[];
}

export interface SubjectAcademicConfig {
  countryCode: string;
  gradeScaleId: GradeScaleId;
  minGrade: number;
  maxGrade: number;
  profileId: AcademicProfileId;
  calculationProfileId: AcademicProfileId;
  calculationProfileName: string;
  academicConfigVersion: number;
  gradeScale: GradeScale;
  passingGrade: number;
  blocks: AcademicCalculationBlock[];
  sourceTemplateVersion: number;
  copiedAt: string;
  customName?: string;
}

export interface AcademicSettingsTemplate {
  defaultCountryCode?: string;
  defaultGradeScale: GradeScale;
  defaultPassingGrade: number;
  defaultProfileId: AcademicProfileId;
  templateVersion: number;
  updatedAt: string;
}

import type {
    AcademicCalculationBlock,
    AcademicCalculationProfile,
    AcademicProfileId,
    AcademicSettingsTemplate,
    GradeScale,
    SubjectAcademicConfig,
} from "../types";
import {
    ACADEMIC_CALCULATION_PROFILES,
    DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
} from "./academicProfiles";

const ACADEMIC_CONFIG_VERSION = 1;

type CreateSubjectAcademicConfigOptions = {
  customName?: string;
  passingGradeOverride?: number;
  copiedAt?: string;
};

type NormalizeSubjectAcademicConfigOptions = {
  fallbackPassingGrade?: number;
};

function cloneProfileBlocks(profile: AcademicCalculationProfile) {
  return profile.blocks.map((block) => ({ ...block }));
}

function cloneBlocks(blocks: AcademicCalculationBlock[]) {
  return blocks.map((block) => ({ ...block }));
}

function cloneGradeScale(scale: GradeScale): GradeScale {
  return { ...scale };
}

function getProfileById(profileId: string): AcademicCalculationProfile {
  return (
    ACADEMIC_CALCULATION_PROFILES[
      profileId as keyof typeof ACADEMIC_CALCULATION_PROFILES
    ] ?? ACADEMIC_CALCULATION_PROFILES.weighted_general
  );
}

function boundPassingGrade(
  value: number,
  minGrade: number,
  maxGrade: number,
): number {
  return Math.min(Math.max(value, minGrade), maxGrade);
}

export function createSubjectAcademicConfigFromTemplate(
  template: AcademicSettingsTemplate,
  options?: CreateSubjectAcademicConfigOptions,
): SubjectAcademicConfig {
  const profile = getProfileById(template.defaultProfileId);
  const gradeScale = cloneGradeScale(template.defaultGradeScale);
  const passingGrade = boundPassingGrade(
    options?.passingGradeOverride ?? template.defaultPassingGrade,
    gradeScale.minGrade,
    gradeScale.maxGrade,
  );

  return {
    countryCode:
      template.defaultCountryCode ??
      gradeScale.countryCode ??
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE.defaultCountryCode ??
      "CL",
    gradeScaleId: gradeScale.id,
    minGrade: gradeScale.minGrade,
    maxGrade: gradeScale.maxGrade,
    profileId: profile.id,
    calculationProfileId: profile.id,
    calculationProfileName: profile.name,
    academicConfigVersion: ACADEMIC_CONFIG_VERSION,
    gradeScale,
    passingGrade,
    blocks: cloneProfileBlocks(profile),
    sourceTemplateVersion: template.templateVersion,
    copiedAt: options?.copiedAt ?? new Date().toISOString(),
    customName: options?.customName,
  };
}

export function normalizeSubjectAcademicConfig(
  value: unknown,
  options?: NormalizeSubjectAcademicConfigOptions,
): SubjectAcademicConfig {
  const fallbackTemplate = {
    ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
    defaultPassingGrade:
      options?.fallbackPassingGrade ??
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE.defaultPassingGrade,
  };

  const fallback = createSubjectAcademicConfigFromTemplate(fallbackTemplate);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<SubjectAcademicConfig>;
  const profile = getProfileById(
    (candidate.calculationProfileId ??
      candidate.profileId ??
      fallback.profileId) as string,
  );

  const rawGradeScale = candidate.gradeScale;
  const gradeScale: GradeScale =
    rawGradeScale &&
    typeof rawGradeScale.id === "string" &&
    typeof rawGradeScale.name === "string" &&
    typeof rawGradeScale.minGrade === "number" &&
    typeof rawGradeScale.maxGrade === "number" &&
    typeof rawGradeScale.defaultPassingGrade === "number" &&
    typeof rawGradeScale.decimalPrecision === "number"
      ? cloneGradeScale(rawGradeScale)
      : cloneGradeScale(fallback.gradeScale);

  const passingGrade = boundPassingGrade(
    typeof candidate.passingGrade === "number"
      ? candidate.passingGrade
      : fallback.passingGrade,
    gradeScale.minGrade,
    gradeScale.maxGrade,
  );

  const blocks = Array.isArray(candidate.blocks)
    ? cloneBlocks(
        candidate.blocks.filter(
          (block): block is AcademicCalculationBlock =>
            !!block &&
            typeof block.id === "string" &&
            typeof block.name === "string" &&
            typeof block.weight === "number" &&
            typeof block.type === "string",
        ),
      )
    : cloneBlocks(profile.blocks);

  return {
    countryCode:
      candidate.countryCode ?? gradeScale.countryCode ?? fallback.countryCode,
    gradeScaleId: candidate.gradeScaleId ?? gradeScale.id,
    minGrade:
      typeof candidate.minGrade === "number"
        ? candidate.minGrade
        : gradeScale.minGrade,
    maxGrade:
      typeof candidate.maxGrade === "number"
        ? candidate.maxGrade
        : gradeScale.maxGrade,
    profileId:
      (candidate.profileId as AcademicProfileId | undefined) ?? profile.id,
    calculationProfileId:
      (candidate.calculationProfileId as AcademicProfileId | undefined) ??
      profile.id,
    calculationProfileName: candidate.calculationProfileName ?? profile.name,
    academicConfigVersion:
      typeof candidate.academicConfigVersion === "number"
        ? candidate.academicConfigVersion
        : ACADEMIC_CONFIG_VERSION,
    gradeScale,
    passingGrade,
    blocks: blocks.length > 0 ? blocks : cloneBlocks(profile.blocks),
    sourceTemplateVersion:
      typeof candidate.sourceTemplateVersion === "number"
        ? candidate.sourceTemplateVersion
        : fallback.sourceTemplateVersion,
    copiedAt:
      typeof candidate.copiedAt === "string"
        ? candidate.copiedAt
        : fallback.copiedAt,
    customName:
      typeof candidate.customName === "string"
        ? candidate.customName
        : undefined,
  };
}

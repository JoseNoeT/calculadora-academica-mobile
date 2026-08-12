import type {
    AcademicCalculationProfile,
    AcademicProfileId,
    AcademicSettingsTemplate,
    GradeScale,
} from "../types";

export const CHILE_1_7_GRADE_SCALE: GradeScale = {
  id: "chile_1_7",
  name: "Escala chilena 1.0 a 7.0",
  minGrade: 1.0,
  maxGrade: 7.0,
  defaultPassingGrade: 4.0,
  decimalPrecision: 1,
  countryCode: "CL",
};

const BASE_GENERAL_BLOCK = {
  id: "general",
  name: "Promedio general",
  weight: 100,
  type: "general" as const,
};

export const ACADEMIC_CALCULATION_PROFILES: Record<
  AcademicProfileId,
  AcademicCalculationProfile
> = {
  weighted_general: {
    id: "weighted_general",
    name: "Ponderado general",
    description: "Promedio ponderado tradicional con un bloque general.",
    educationLevel: "custom",
    profileType: "weightedGeneral",
    blocks: [BASE_GENERAL_BLOCK],
  },
  chile_school_general: {
    id: "chile_school_general",
    name: "Chile escolar",
    description: "Promedio general para contexto escolar en escala chilena.",
    countryCode: "CL",
    educationLevel: "school",
    profileType: "weightedGeneral",
    blocks: [BASE_GENERAL_BLOCK],
  },
  duoc_60_40: {
    id: "duoc_60_40",
    name: "Duoc UC 60/40",
    description:
      "Estructura en bloques de presentacion y examen con pesos 60/40.",
    countryCode: "CL",
    institutionName: "Duoc UC",
    educationLevel: "higherEducation",
    profileType: "blockBased",
    blocks: [
      {
        id: "presentation",
        name: "Presentacion",
        weight: 60,
        type: "presentation",
      },
      {
        id: "exam",
        name: "Examen",
        weight: 40,
        type: "exam",
      },
    ],
  },
  higher_ed_70_30: {
    id: "higher_ed_70_30",
    name: "Educacion superior 70/30",
    description:
      "Estructura en bloques de presentacion y examen con pesos 70/30.",
    educationLevel: "higherEducation",
    profileType: "blockBased",
    blocks: [
      {
        id: "presentation",
        name: "Presentacion",
        weight: 70,
        type: "presentation",
      },
      {
        id: "exam",
        name: "Examen",
        weight: 30,
        type: "exam",
      },
    ],
  },
  higher_ed_75_25: {
    id: "higher_ed_75_25",
    name: "Educacion superior 75/25",
    description:
      "Estructura en bloques de presentacion y examen con pesos 75/25.",
    educationLevel: "higherEducation",
    profileType: "blockBased",
    blocks: [
      {
        id: "presentation",
        name: "Presentacion",
        weight: 75,
        type: "presentation",
      },
      {
        id: "exam",
        name: "Examen",
        weight: 25,
        type: "exam",
      },
    ],
  },
  custom: {
    id: "custom",
    name: "Personalizado",
    description: "Perfil editable para reglas de calculo personalizadas.",
    educationLevel: "custom",
    profileType: "custom",
    blocks: [BASE_GENERAL_BLOCK],
  },
};

export const ACADEMIC_PROFILE_CATALOG: AcademicCalculationProfile[] =
  Object.values(ACADEMIC_CALCULATION_PROFILES);

export const DEFAULT_ACADEMIC_SETTINGS_TEMPLATE: AcademicSettingsTemplate = {
  defaultCountryCode: "CL",
  defaultGradeScale: CHILE_1_7_GRADE_SCALE,
  defaultPassingGrade: CHILE_1_7_GRADE_SCALE.defaultPassingGrade,
  defaultProfileId: "weighted_general",
  templateVersion: 1,
  updatedAt: "1970-01-01T00:00:00.000Z",
};

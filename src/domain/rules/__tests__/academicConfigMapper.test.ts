import type { AcademicSettingsTemplate } from "@/src/domain/types";

import {
    createSubjectAcademicConfigFromTemplate,
    normalizeSubjectAcademicConfig,
} from "../academicConfigMapper";
import {
    ACADEMIC_CALCULATION_PROFILES,
    CHILE_1_7_GRADE_SCALE,
    DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
} from "../academicProfiles";

describe("createSubjectAcademicConfigFromTemplate", () => {
  it("crea SubjectAcademicConfig desde DEFAULT_ACADEMIC_SETTINGS_TEMPLATE", () => {
    const config = createSubjectAcademicConfigFromTemplate(
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
    );

    expect(config.profileId).toBe("weighted_general");
    expect(config.calculationProfileId).toBe("weighted_general");
    expect(config.calculationProfileName).toBe("Ponderado general");
    expect(config.academicConfigVersion).toBe(1);
    expect(config.countryCode).toBe("CL");
    expect(config.gradeScaleId).toBe("chile_1_7");
    expect(config.minGrade).toBe(1);
    expect(config.maxGrade).toBe(7);
    expect(config.passingGrade).toBe(
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE.defaultPassingGrade,
    );
    expect(config.blocks).toHaveLength(1);
  });

  it("crea config con perfil duoc_60_40 y copia bloques presentacion 60 / examen 40", () => {
    const duocTemplate: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "duoc_60_40",
    };

    const config = createSubjectAcademicConfigFromTemplate(duocTemplate);

    expect(config.profileId).toBe("duoc_60_40");
    expect(config.blocks).toEqual([
      {
        id: "presentation",
        name: "Presentacion",
        weight: 60,
        type: "presentation",
      },
      { id: "exam", name: "Examen", weight: 40, type: "exam" },
    ]);
  });

  it("si el profileId no existe, usa weighted_general", () => {
    const invalidTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultProfileId: "not_existing_profile",
    } as unknown as AcademicSettingsTemplate;

    const config = createSubjectAcademicConfigFromTemplate(invalidTemplate);

    expect(config.profileId).toBe("weighted_general");
    expect(config.blocks).toEqual(
      ACADEMIC_CALCULATION_PROFILES.weighted_general.blocks,
    );
  });

  it("respeta passingGrade del template", () => {
    const template: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultPassingGrade: 4.8,
    };

    const config = createSubjectAcademicConfigFromTemplate(template);

    expect(config.passingGrade).toBe(4.8);
  });

  it("respeta gradeScale del template", () => {
    const customScale = {
      ...CHILE_1_7_GRADE_SCALE,
      id: "custom_scale",
      name: "Escala custom",
      defaultPassingGrade: 4.3,
    };

    const template: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultGradeScale: customScale,
      defaultPassingGrade: 4.3,
    };

    const config = createSubjectAcademicConfigFromTemplate(template);

    expect(config.gradeScale).toEqual(customScale);
  });

  it("copiedAt queda definido", () => {
    const config = createSubjectAcademicConfigFromTemplate(
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
    );

    expect(typeof config.copiedAt).toBe("string");
    expect(config.copiedAt.length).toBeGreaterThan(0);
  });

  it("sourceTemplateVersion queda copiado", () => {
    const template: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      templateVersion: 7,
    };

    const config = createSubjectAcademicConfigFromTemplate(template);

    expect(config.sourceTemplateVersion).toBe(7);
  });

  it("no muta el template original", () => {
    const template: AcademicSettingsTemplate = {
      ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      defaultGradeScale: {
        ...DEFAULT_ACADEMIC_SETTINGS_TEMPLATE.defaultGradeScale,
      },
    };
    const originalTemplate = JSON.parse(
      JSON.stringify(template),
    ) as AcademicSettingsTemplate;

    createSubjectAcademicConfigFromTemplate(template);

    expect(template).toEqual(originalTemplate);
  });

  it("no comparte referencias de blocks con el catalogo original", () => {
    const config = createSubjectAcademicConfigFromTemplate(
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
    );

    expect(config.blocks).not.toBe(
      ACADEMIC_CALCULATION_PROFILES.weighted_general.blocks,
    );
  });

  it("customName opcional queda guardado si se entrega", () => {
    const config = createSubjectAcademicConfigFromTemplate(
      DEFAULT_ACADEMIC_SETTINGS_TEMPLATE,
      { customName: "Mi configuracion de prueba" },
    );

    expect(config.customName).toBe("Mi configuracion de prueba");
  });

  it("normalizeSubjectAcademicConfig completa contrato minimo cuando viene incompleto", () => {
    const normalized = normalizeSubjectAcademicConfig({
      profileId: "duoc_60_40",
    });

    expect(normalized).toEqual(
      expect.objectContaining({
        profileId: "duoc_60_40",
        calculationProfileId: "duoc_60_40",
        calculationProfileName: "Duoc UC 60/40",
        academicConfigVersion: 1,
      }),
    );
  });

  it("normalizeSubjectAcademicConfig usa fallbackPassingGrade para datos invalidos", () => {
    const normalized = normalizeSubjectAcademicConfig(null, {
      fallbackPassingGrade: 4.6,
    });

    expect(normalized.passingGrade).toBe(4.6);
  });
});

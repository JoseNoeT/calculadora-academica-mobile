import type { AcademicStatus, Evaluation } from "../entities";
import { ACADEMIC_CALCULATION_PROFILES, MAX_GRADE, MIN_GRADE } from "../rules";
import type {
    AcademicBlockType,
    ProfileAcademicCalculationInput,
    ProfileAcademicCalculationResult,
} from "../types";
import { getAcademicStatus } from "./academicStatusCalculator";

const DECIMAL_PRECISION = 4;
const BLOCK_WEIGHT_TOLERANCE = 0.01;

function roundToPrecision(
  value: number,
  precision = DECIMAL_PRECISION,
): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function normalizeWeightedGrade(points: number, weight: number): number | null {
  if (weight <= 0) {
    return null;
  }

  return roundToPrecision(points / (weight / 100));
}

function buildAdvice(
  status: AcademicStatus,
  requiredGrade: number | null,
): string {
  switch (status) {
    case "pending":
      return "Aún no hay evaluaciones rendidas suficientes para calcular un escenario académico.";
    case "approved":
      return "La asignatura ya cumple con la nota mínima requerida.";
    case "failed":
      return "La asignatura cerró por debajo de la nota mínima requerida.";
    case "notAchievable":
      return "Con la ponderación pendiente disponible no es posible alcanzar la nota mínima.";
    case "favorable":
      return "El escenario actual es favorable: cualquier resultado dentro del rango válido mantiene la aprobación.";
    case "atRisk":
      return `Se necesita una nota exigente (${requiredGrade ?? "-"}) en lo pendiente para aprobar.`;
    case "achievable":
      return `La nota requerida (${requiredGrade ?? "-"}) sigue dentro de un rango alcanzable.`;
    default:
      return "Estado académico no disponible.";
  }
}

function normalizeProfileId(profileId: string): string {
  if (profileId === "higher_70_30") {
    return "higher_ed_70_30";
  }

  if (profileId === "higher_75_25") {
    return "higher_ed_75_25";
  }

  return profileId;
}

type SanitizedEvaluation = Evaluation & {
  normalizedCategory: AcademicBlockType;
  normalizedBlockId: string;
  sanitizedGrade: number | null;
};

function sanitizeEvaluations(
  evaluations: Evaluation[],
  minGrade: number,
  maxGrade: number,
  warnings: string[],
): SanitizedEvaluation[] {
  return evaluations.map((evaluation) => {
    const normalizedCategory: AcademicBlockType =
      evaluation.category === "presentation" ||
      evaluation.category === "exam" ||
      evaluation.category === "extraordinary"
        ? evaluation.category
        : "general";

    const normalizedBlockId =
      typeof evaluation.blockId === "string" &&
      evaluation.blockId.trim().length > 0
        ? evaluation.blockId.trim()
        : "general";

    let sanitizedGrade = evaluation.grade;

    if (typeof evaluation.grade === "number") {
      if (evaluation.grade === 0) {
        sanitizedGrade = null;
        warnings.push(
          `Evaluación ${evaluation.id}: nota 0.0 se trató como pendiente por estar fuera de escala.`,
        );
      } else if (evaluation.grade < minGrade || evaluation.grade > maxGrade) {
        sanitizedGrade = null;
        warnings.push(
          `Evaluación ${evaluation.id}: nota fuera de escala [${minGrade}, ${maxGrade}] tratada como pendiente.`,
        );
      }
    }

    return {
      ...evaluation,
      normalizedCategory,
      normalizedBlockId,
      sanitizedGrade,
    };
  });
}

function calculateWeightedMetrics(
  evaluations: SanitizedEvaluation[],
  passingGrade: number,
): Pick<
  ProfileAcademicCalculationResult,
  | "accumulatedPoints"
  | "completedWeight"
  | "pendingWeight"
  | "currentAverage"
  | "finalGrade"
  | "requiredGrade"
  | "status"
  | "advice"
> {
  const graded = evaluations.filter(
    (evaluation) => typeof evaluation.sanitizedGrade === "number",
  );
  const pending = evaluations.filter(
    (evaluation) => typeof evaluation.sanitizedGrade !== "number",
  );

  const accumulatedPoints = roundToPrecision(
    graded.reduce(
      (total, evaluation) =>
        total +
        (evaluation.sanitizedGrade as number) * (evaluation.weight / 100),
      0,
    ),
  );
  const completedWeight = roundToPrecision(
    graded.reduce((total, evaluation) => total + evaluation.weight, 0),
  );
  const pendingWeight = roundToPrecision(
    pending.reduce((total, evaluation) => total + evaluation.weight, 0),
  );

  const currentAverage = normalizeWeightedGrade(
    accumulatedPoints,
    completedWeight,
  );
  const totalWeight = roundToPrecision(
    evaluations.reduce((total, evaluation) => total + evaluation.weight, 0),
  );
  const finalGrade =
    pendingWeight > 0
      ? null
      : normalizeWeightedGrade(accumulatedPoints, totalWeight);
  const requiredGrade =
    pendingWeight > 0
      ? roundToPrecision(
          (passingGrade - accumulatedPoints) / (pendingWeight / 100),
        )
      : null;
  const status = getAcademicStatus({
    evaluationsCount: evaluations.length,
    completedWeight,
    pendingWeight,
    finalGrade,
    requiredGrade,
    minimumGrade: passingGrade,
  });

  return {
    accumulatedPoints,
    completedWeight,
    pendingWeight,
    currentAverage,
    finalGrade,
    requiredGrade,
    status,
    advice: buildAdvice(status, requiredGrade),
  };
}

type BlockMetrics = {
  grade: number | null;
  currentAverage: number | null;
  completedWeight: number;
  pendingWeight: number;
  hasAnyEvaluations: boolean;
  isComplete: boolean;
};

function calculateBlockMetrics(
  evaluations: SanitizedEvaluation[],
): BlockMetrics {
  const graded = evaluations.filter(
    (evaluation) => typeof evaluation.sanitizedGrade === "number",
  );
  const pending = evaluations.filter(
    (evaluation) => typeof evaluation.sanitizedGrade !== "number",
  );

  const completedWeight = roundToPrecision(
    graded.reduce((total, evaluation) => total + evaluation.weight, 0),
  );
  const pendingWeight = roundToPrecision(
    pending.reduce((total, evaluation) => total + evaluation.weight, 0),
  );
  const blockPoints = roundToPrecision(
    graded.reduce(
      (total, evaluation) =>
        total +
        (evaluation.sanitizedGrade as number) * (evaluation.weight / 100),
      0,
    ),
  );
  const totalWeight = roundToPrecision(
    evaluations.reduce((total, evaluation) => total + evaluation.weight, 0),
  );

  return {
    grade:
      pendingWeight <= 0
        ? normalizeWeightedGrade(blockPoints, totalWeight)
        : null,
    currentAverage: normalizeWeightedGrade(blockPoints, completedWeight),
    completedWeight,
    pendingWeight,
    hasAnyEvaluations: evaluations.length > 0,
    isComplete: evaluations.length > 0 && pendingWeight <= 0,
  };
}

function warnIfBlockWeightNot100(
  blockName: string,
  evaluations: SanitizedEvaluation[],
  warnings: string[],
): void {
  if (evaluations.length === 0) {
    return;
  }

  const totalWeight = roundToPrecision(
    evaluations.reduce((total, evaluation) => total + evaluation.weight, 0),
  );

  if (Math.abs(totalWeight - 100) > BLOCK_WEIGHT_TOLERANCE) {
    warnings.push(
      `El bloque ${blockName} suma ${totalWeight}% en lugar de 100%.`,
    );
  }
}

function calculateBlockProfile(
  normalizedProfileId: string,
  passingGrade: number,
  evaluations: SanitizedEvaluation[],
  warnings: string[],
): ProfileAcademicCalculationResult {
  const profile =
    ACADEMIC_CALCULATION_PROFILES[
      normalizedProfileId as keyof typeof ACADEMIC_CALCULATION_PROFILES
    ];
  const profileName = profile?.name ?? normalizedProfileId;

  const presentationEvaluations = evaluations.filter(
    (evaluation) => evaluation.normalizedCategory === "presentation",
  );
  const examEvaluations = evaluations.filter(
    (evaluation) => evaluation.normalizedCategory === "exam",
  );
  const extraordinaryEvaluations = evaluations.filter(
    (evaluation) => evaluation.normalizedCategory === "extraordinary",
  );

  warnIfBlockWeightNot100("presentation", presentationEvaluations, warnings);
  warnIfBlockWeightNot100("exam", examEvaluations, warnings);

  const presentation = calculateBlockMetrics(presentationEvaluations);
  const exam = calculateBlockMetrics(examEvaluations);
  const extraordinary = calculateBlockMetrics(extraordinaryEvaluations);

  const usedExtraordinaryExam =
    extraordinary.hasAnyEvaluations && extraordinary.currentAverage !== null;
  const examCurrentAverage = usedExtraordinaryExam
    ? extraordinary.currentAverage
    : exam.currentAverage;
  const examGrade = usedExtraordinaryExam ? extraordinary.grade : exam.grade;
  const examCompletedWeight = usedExtraordinaryExam
    ? extraordinary.completedWeight
    : exam.completedWeight;
  const examPendingWeight = usedExtraordinaryExam
    ? extraordinary.pendingWeight
    : exam.pendingWeight;

  const missingAssessments: string[] = [];

  if (!presentation.hasAnyEvaluations) {
    missingAssessments.push("presentation");
    warnings.push("Faltan evaluaciones del bloque presentation.");
  }

  if (!exam.hasAnyEvaluations && !usedExtraordinaryExam) {
    missingAssessments.push("exam");
    warnings.push("Faltan evaluaciones del bloque exam.");
  }

  const isPresentationComplete =
    presentation.hasAnyEvaluations && presentation.isComplete;
  const isExamComplete =
    usedExtraordinaryExam || (exam.hasAnyEvaluations && exam.isComplete);
  const isFinalComplete = isPresentationComplete && isExamComplete;

  const presentationWeight =
    profile?.blocks.find((block) => block.type === "presentation")?.weight ?? 0;
  const examWeight =
    profile?.blocks.find((block) => block.type === "exam")?.weight ?? 0;

  const finalGrade =
    isFinalComplete &&
    presentation.grade !== null &&
    examGrade !== null &&
    presentationWeight > 0 &&
    examWeight > 0
      ? roundToPrecision(
          presentation.grade * (presentationWeight / 100) +
            examGrade * (examWeight / 100),
        )
      : null;

  const weighted = calculateWeightedMetrics(evaluations, passingGrade);
  const status = getAcademicStatus({
    evaluationsCount: evaluations.length,
    completedWeight: weighted.completedWeight,
    pendingWeight: weighted.pendingWeight,
    finalGrade,
    requiredGrade: null,
    minimumGrade: passingGrade,
  });

  return {
    profileId: normalizedProfileId,
    profileName,
    accumulatedPoints: weighted.accumulatedPoints,
    completedWeight: weighted.completedWeight,
    pendingWeight: weighted.pendingWeight,
    currentAverage: weighted.currentAverage,
    finalGrade,
    requiredGrade: null,
    status,
    advice: buildAdvice(status, null),
    warnings,
    presentationGrade: presentation.grade,
    presentationCurrentAverage: presentation.currentAverage,
    presentationCompletedWeight: presentation.completedWeight,
    presentationPendingWeight: presentation.pendingWeight,
    examGrade,
    examCurrentAverage,
    examCompletedWeight,
    examPendingWeight,
    usedExtraordinaryExam,
    isPresentationComplete,
    isExamComplete,
    isFinalComplete,
    missingAssessments,
  };
}

export function calculateAcademicResultByProfile(
  input: ProfileAcademicCalculationInput,
): ProfileAcademicCalculationResult {
  const warnings: string[] = [];
  const minGrade = input.minGrade ?? MIN_GRADE;
  const maxGrade = input.maxGrade ?? MAX_GRADE;

  let normalizedProfileId = normalizeProfileId(input.profileId);

  if (normalizedProfileId === "custom") {
    warnings.push(
      "Perfil custom aún no implementa reglas avanzadas; se usó weighted_general como fallback.",
    );
    normalizedProfileId = "weighted_general";
  }

  if (!(normalizedProfileId in ACADEMIC_CALCULATION_PROFILES)) {
    warnings.push(
      `Perfil académico desconocido (${input.profileId}); se usó weighted_general como fallback.`,
    );
    normalizedProfileId = "weighted_general";
  }

  const sanitizedEvaluations = sanitizeEvaluations(
    input.evaluations,
    minGrade,
    maxGrade,
    warnings,
  );

  if (
    normalizedProfileId === "duoc_60_40" ||
    normalizedProfileId === "higher_ed_70_30" ||
    normalizedProfileId === "higher_ed_75_25"
  ) {
    return calculateBlockProfile(
      normalizedProfileId,
      input.passingGrade,
      sanitizedEvaluations,
      warnings,
    );
  }

  const weighted = calculateWeightedMetrics(
    sanitizedEvaluations,
    input.passingGrade,
  );
  const profileName =
    input.profileName ??
    ACADEMIC_CALCULATION_PROFILES[
      normalizedProfileId as keyof typeof ACADEMIC_CALCULATION_PROFILES
    ]?.name ??
    normalizedProfileId;

  return {
    profileId: normalizedProfileId,
    profileName,
    accumulatedPoints: weighted.accumulatedPoints,
    completedWeight: weighted.completedWeight,
    pendingWeight: weighted.pendingWeight,
    currentAverage: weighted.currentAverage,
    finalGrade: weighted.finalGrade,
    requiredGrade: weighted.requiredGrade,
    status: weighted.status,
    advice: weighted.advice,
    warnings,
  };
}

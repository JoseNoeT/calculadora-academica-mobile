export const ACADEMIC_STATUSES = [
  "pending",
  "approved",
  "achievable",
  "atRisk",
  "notAchievable",
  "failed",
] as const;

export type AcademicStatus = (typeof ACADEMIC_STATUSES)[number];

export const academicStatusLabels: Record<AcademicStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  achievable: "Alcanzable",
  atRisk: "En riesgo",
  notAchievable: "No alcanzable",
  failed: "Reprobado",
};

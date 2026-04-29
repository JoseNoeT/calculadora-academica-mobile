import type { AcademicStatus } from "@/src/domain/entities";
import {
    calculateAcademicSummary,
    generateAcademicAdvice,
} from "@/src/features/calculator/utils/academicCalculator";
import type { HomeEvaluationLite } from "@/src/features/home/utils/homeInsights";
import { getEvaluations } from "@/src/features/subjects/services/evaluationService";
import type { SubjectListItem } from "@/src/features/subjects/types/subject.types";

export type DashboardAlert = {
  id: string;
  tone: "info" | "warning" | "danger" | "success";
  message: string;
};

export type FeaturedSubject = {
  id: string;
  name: string;
  color: string;
  status: AcademicStatus;
  currentAverage: number | null;
  pendingEvaluations: number;
};

export type SubjectDashboardMetrics = {
  totalSubjects: number;
  subjectsWithEvaluations: number;
  subjectsAtRisk: number;
  overallProgress: number;
  pendingEvaluations: number;
  pendingEvaluationItems: HomeEvaluationLite[];
  overallCurrentAverage: number | null;
  overallStatus: AcademicStatus;
  overallAdvice: string;
  trendDirection: "up" | "down" | "flat";
  trendPoints: number[];
  alerts: DashboardAlert[];
  featuredSubjects: FeaturedSubject[];
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function resolveOverallStatus(statuses: AcademicStatus[]): AcademicStatus {
  if (statuses.length === 0) {
    return "pending";
  }

  if (statuses.includes("failed")) {
    return "failed";
  }

  if (statuses.includes("notAchievable")) {
    return "notAchievable";
  }

  if (statuses.includes("atRisk")) {
    return "atRisk";
  }

  if (statuses.includes("achievable")) {
    return "achievable";
  }

  if (statuses.includes("pending")) {
    return "pending";
  }

  if (statuses.includes("favorable")) {
    return "favorable";
  }

  return "approved";
}

const EMPTY_METRICS: SubjectDashboardMetrics = {
  totalSubjects: 0,
  subjectsWithEvaluations: 0,
  subjectsAtRisk: 0,
  overallProgress: 0,
  pendingEvaluations: 0,
  pendingEvaluationItems: [],
  overallCurrentAverage: null,
  overallStatus: "pending",
  overallAdvice: generateAcademicAdvice({
    status: "pending",
    requiredGrade: null,
    pendingWeight: 0,
  }),
  trendDirection: "flat",
  trendPoints: [8, 14, 22, 16, 28, 34],
  alerts: [
    {
      id: "no-subjects",
      tone: "info",
      message: "No tienes ramos registrados. Comienza creando tu primer ramo.",
    },
  ],
  featuredSubjects: [],
};

export async function buildSubjectDashboardMetrics(
  subjects: SubjectListItem[],
): Promise<SubjectDashboardMetrics> {
  if (subjects.length === 0) {
    return EMPTY_METRICS;
  }

  const subjectData = await Promise.all(
    subjects.map(async (subject) => {
      const evaluations = await getEvaluations(subject.id);
      const summary = calculateAcademicSummary({
        evaluations,
        passingGrade: subject.minimumGrade,
      });
      const pendingEvaluations = evaluations.filter(
        (evaluation) => evaluation.grade == null || evaluation.isPending,
      ).length;
      const pendingEvaluationItems = evaluations
        .filter(
          (evaluation) => evaluation.grade == null || evaluation.isPending,
        )
        .map((evaluation) => ({
          id: evaluation.id,
          name: `${subject.name}: ${evaluation.name}`,
          isPending: evaluation.isPending,
          grade: evaluation.grade,
        }));

      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        updatedAt: subject.updatedAt,
        evaluationsCount: evaluations.length,
        pendingEvaluations,
        pendingEvaluationItems,
        completedWeight: summary.completedWeight,
        pendingWeight: summary.pendingWeight,
        currentAverage: summary.currentAverage,
        status: summary.status,
      };
    }),
  );

  const subjectsWithEvaluations = subjectData.filter(
    (item) => item.evaluationsCount > 0,
  ).length;

  const subjectsAtRisk = subjectData.filter((item) =>
    ["atRisk", "notAchievable", "failed"].includes(item.status),
  ).length;

  const pendingEvaluations = subjectData.reduce(
    (acc, item) => acc + item.pendingEvaluations,
    0,
  );
  const pendingEvaluationItems = subjectData.flatMap(
    (item) => item.pendingEvaluationItems,
  );

  const totalCompleted = subjectData.reduce(
    (acc, item) => acc + item.completedWeight,
    0,
  );

  const averages = subjectData
    .map((item) => item.currentAverage)
    .filter((value): value is number => typeof value === "number");

  const overallCurrentAverage =
    averages.length > 0
      ? round2(
          averages.reduce((acc, value) => acc + value, 0) / averages.length,
        )
      : null;

  const overallStatus = resolveOverallStatus(
    subjectData.map((item) => item.status),
  );
  const averagePendingWeight =
    subjectData.reduce((acc, item) => acc + item.pendingWeight, 0) /
    subjectData.length;
  const overallAdvice = generateAcademicAdvice({
    status: overallStatus,
    requiredGrade: null,
    pendingWeight: round2(averagePendingWeight),
  });

  const trendPointsRaw = subjectData
    .map((item) => Math.max(0, Math.min(100, Math.round(item.completedWeight))))
    .slice(0, 6);

  const trendPoints =
    trendPointsRaw.length > 0 ? trendPointsRaw : [10, 20, 14, 24, 32, 40];
  const trendDelta = trendPoints[trendPoints.length - 1] - trendPoints[0];
  const trendDirection =
    trendDelta >= 5 ? "up" : trendDelta <= -5 ? "down" : "flat";

  const alerts: DashboardAlert[] = [];

  if (subjectsAtRisk > 0) {
    alerts.push({
      id: "risk-subjects",
      tone: subjectsAtRisk >= 2 ? "danger" : "warning",
      message:
        subjectsAtRisk === 1
          ? "Tienes 1 ramo en riesgo. Revisa su nota requerida hoy."
          : `Tienes ${subjectsAtRisk} ramos en riesgo. Prioriza los de mayor ponderación pendiente.`,
    });
  }

  if (pendingEvaluations > 0) {
    alerts.push({
      id: "pending-evals",
      tone: "info",
      message:
        pendingEvaluations === 1
          ? "Tienes 1 evaluación pendiente por registrar o rendir."
          : `Tienes ${pendingEvaluations} evaluaciones pendientes. Organiza tu próximo bloque de estudio.`,
    });
  }

  if (overallCurrentAverage !== null && overallCurrentAverage < 4.5) {
    alerts.push({
      id: "low-average",
      tone: "warning",
      message: `Tu promedio global actual es ${overallCurrentAverage.toFixed(2)}. Enfoca esfuerzos en subir los ramos críticos.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "all-good",
      tone: "success",
      message: "Sin alertas críticas por ahora. Mantén tu ritmo de estudio.",
    });
  }

  const featuredSubjects = subjectData
    .sort((a, b) => {
      const aRisk = ["atRisk", "notAchievable", "failed"].includes(a.status)
        ? 1
        : 0;
      const bRisk = ["atRisk", "notAchievable", "failed"].includes(b.status)
        ? 1
        : 0;

      if (aRisk !== bRisk) {
        return bRisk - aRisk;
      }

      if (a.pendingEvaluations !== b.pendingEvaluations) {
        return b.pendingEvaluations - a.pendingEvaluations;
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    })
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      status: item.status,
      currentAverage: item.currentAverage,
      pendingEvaluations: item.pendingEvaluations,
    }));

  return {
    totalSubjects: subjects.length,
    subjectsWithEvaluations,
    subjectsAtRisk,
    pendingEvaluations,
    pendingEvaluationItems,
    overallProgress: Math.round(totalCompleted / subjects.length),
    overallCurrentAverage,
    overallStatus,
    overallAdvice,
    trendDirection,
    trendPoints,
    alerts,
    featuredSubjects,
  };
}

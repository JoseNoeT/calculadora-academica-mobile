import { type AcademicStatus } from "@/src/domain/entities";
import { generateAcademicAdvice } from "@/src/features/calculator/utils/academicCalculator";

export type HomeRiskSubject = {
  id: string;
  name: string;
  status: AcademicStatus;
  pendingEvaluations: number;
  currentAverage: number | null;
};

export type HomeEvaluationLite = {
  id: string;
  name: string;
  isPending?: boolean;
  grade: number | null;
};

export type HomeSummary = {
  totalSubjects: number;
  subjectsAtRisk: number;
  pendingEvaluations: number;
  overallStatus: AcademicStatus;
  overallCurrentAverage: number | null;
  trendDirection: "up" | "down" | "flat";
  riskSubjects: HomeRiskSubject[];
};

export type HomeAlert = {
  id: string;
  icon: string;
  tone: "danger" | "warning" | "success" | "info";
  message: string;
};

export type HomeInsight = {
  id: string;
  icon: string;
  tone: "danger" | "warning" | "success" | "info";
  text: string;
};

export type HomeNextAction = {
  id: string;
  title: string;
  description: string;
  routeKey: "subjects-create" | "subjects" | "simulator" | "calculator";
};

export function getRiskSubjects(
  subjects: HomeRiskSubject[],
): HomeRiskSubject[] {
  return subjects.filter((subject) =>
    ["atRisk", "notAchievable", "failed"].includes(subject.status),
  );
}

export function getPendingEvaluations(
  evaluations: HomeEvaluationLite[],
): HomeEvaluationLite[] {
  return evaluations.filter(
    (evaluation) => evaluation.isPending || evaluation.grade == null,
  );
}

export function getHomeAlerts(summary: HomeSummary): HomeAlert[] {
  const alerts: HomeAlert[] = [];

  if (summary.totalSubjects === 0) {
    return [
      {
        id: "start",
        icon: "i",
        tone: "info",
        message: "Crea tu primer ramo para activar tu panel académico.",
      },
    ];
  }

  if (summary.subjectsAtRisk > 0) {
    alerts.push({
      id: "risk",
      icon: "!",
      tone: summary.subjectsAtRisk >= 2 ? "danger" : "warning",
      message:
        summary.subjectsAtRisk === 1
          ? "Tienes 1 ramo en riesgo. Priorízalo hoy."
          : `Tienes ${summary.subjectsAtRisk} ramos en riesgo. Necesitas un plan de recuperación.`,
    });
  }

  if (summary.pendingEvaluations > 0) {
    alerts.push({
      id: "pending",
      icon: "•",
      tone: "warning",
      message:
        summary.pendingEvaluations === 1
          ? "Hay 1 evaluación pendiente por registrar o rendir."
          : `Hay ${summary.pendingEvaluations} evaluaciones pendientes por registrar o rendir.`,
    });
  }

  if (
    summary.overallCurrentAverage !== null &&
    summary.overallCurrentAverage < 4.5
  ) {
    alerts.push({
      id: "average",
      icon: "!",
      tone: "danger",
      message: `Promedio global en ${summary.overallCurrentAverage.toFixed(2)}. Refuerza ramos críticos esta semana.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "positive",
      icon: "✓",
      tone: "success",
      message: "Sin alertas críticas. Mantén constancia y ritmo de estudio.",
    });
  }

  return alerts;
}

export function getHomeInsights(summary: HomeSummary): HomeInsight[] {
  const insights: HomeInsight[] = [];

  insights.push({
    id: "advice",
    icon: "★",
    tone:
      summary.overallStatus === "approved" ||
      summary.overallStatus === "favorable"
        ? "success"
        : summary.overallStatus === "atRisk" ||
            summary.overallStatus === "notAchievable" ||
            summary.overallStatus === "failed"
          ? "danger"
          : "info",
    text: generateAcademicAdvice({
      status: summary.overallStatus,
      requiredGrade: null,
      pendingWeight: Math.min(100, summary.pendingEvaluations * 10),
    }),
  });

  insights.push({
    id: "trend",
    icon:
      summary.trendDirection === "up"
        ? "↑"
        : summary.trendDirection === "down"
          ? "↓"
          : "→",
    tone:
      summary.trendDirection === "up"
        ? "success"
        : summary.trendDirection === "down"
          ? "warning"
          : "info",
    text:
      summary.trendDirection === "up"
        ? "Tu tendencia general mejora. Mantén este ritmo."
        : summary.trendDirection === "down"
          ? "Tu tendencia bajó. Conviene intervenir en los ramos con menor avance."
          : "Tu tendencia está estable. Define una meta concreta para avanzar.",
  });

  return insights;
}

export function getNextActions(summary: HomeSummary): HomeNextAction[] {
  if (summary.totalSubjects === 0) {
    return [
      {
        id: "create-subject",
        title: "Crear ramo",
        description:
          "Define tu primer ramo y comienza a registrar evaluaciones.",
        routeKey: "subjects-create",
      },
      {
        id: "open-calculator",
        title: "Calcular",
        description: "Usa la calculadora rápida para explorar escenarios.",
        routeKey: "calculator",
      },
    ];
  }

  const actions: HomeNextAction[] = [];

  if (summary.subjectsAtRisk > 0) {
    actions.push({
      id: "simulate",
      title: "Simular",
      description: "Proyecta notas para recuperar ramos en riesgo.",
      routeKey: "simulator",
    });
  }

  if (summary.pendingEvaluations > 0) {
    actions.push({
      id: "update-subjects",
      title: "Ramos",
      description:
        "Registra tus evaluaciones pendientes para afinar el estado.",
      routeKey: "subjects",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "calculator",
      title: "Calcular",
      description: "Ajusta tu estrategia académica con simulaciones rápidas.",
      routeKey: "calculator",
    });
  }

  return actions.slice(0, 3);
}

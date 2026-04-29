import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

import {
    AnimatedProgressBar,
    AnimatedStatCard,
    MiniTrendChart,
} from "@/src/components/charts";
import { AppBadge, AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

type HomeHeroProps = {
  onPressCalculateNow: () => void;
  onPressCreateSubject: () => void;
  onPressSubjects: () => void;
  onPressSimulator: () => void;
  onPressSettings: () => void;
  totalSubjects: number;
  subjectsWithEvaluations: number;
  subjectsAtRisk: number;
  statusLabel: string;
  statusTone: "info" | "success" | "warning" | "danger" | "pending";
  overallProgress: number;
  trendPoints: number[];
};

type QuickAction = {
  id: string;
  icon: string;
  title: string;
  onPress: () => void;
};

export function HomeHero({
  onPressCalculateNow,
  onPressCreateSubject,
  onPressSubjects,
  onPressSimulator,
  onPressSettings,
  totalSubjects,
  subjectsWithEvaluations,
  subjectsAtRisk,
  statusLabel,
  statusTone,
  overallProgress,
  trendPoints,
}: HomeHeroProps) {
  const { theme } = useAppTheme();
  const { height } = useWindowDimensions();
  const isCompactHeight = height < 700;
  const isVerySmallHeight = height < 640;
  const hasSubjects = totalSubjects > 0;
  const ctaLabel = hasSubjects ? "Calcular ahora" : "Crear ramo";
  const helperText = hasSubjects
    ? "Visualiza tu estado y decide el siguiente movimiento."
    : "Comienza agregando tu primer ramo";

  const quickActions: QuickAction[] = [
    {
      id: "subjects",
      icon: "📚",
      title: "Mis ramos",
      onPress: onPressSubjects,
    },
    {
      id: "simulator",
      icon: "🧪",
      title: "Simulador",
      onPress: onPressSimulator,
    },
    {
      id: "settings",
      icon: "⚙️",
      title: "Configuración",
      onPress: onPressSettings,
    },
  ];

  const glassBackground =
    theme.mode === "dark"
      ? "rgba(51, 65, 85, 0.45)"
      : "rgba(255, 255, 255, 0.72)";

  const glassBorder =
    theme.mode === "dark"
      ? "rgba(148, 163, 184, 0.28)"
      : "rgba(148, 163, 184, 0.34)";

  return (
    <View style={styles.root}>
      <View style={styles.orbContainer} pointerEvents="none">
        <View
          style={[
            styles.orb,
            styles.indigoOrb,
            isCompactHeight ? styles.indigoOrbCompact : null,
          ]}
        />
        <View
          style={[
            styles.orb,
            styles.emeraldOrb,
            isCompactHeight ? styles.emeraldOrbCompact : null,
          ]}
        />
        <View
          style={[
            styles.orb,
            styles.amberOrb,
            isCompactHeight ? styles.amberOrbCompact : null,
          ]}
        />
      </View>

      <View
        style={[
          styles.heroCard,
          isCompactHeight ? styles.heroCardCompact : null,
          {
            backgroundColor: glassBackground,
            borderColor: glassBorder,
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(37,99,235,0.8)",
            "rgba(6,182,212,0.45)",
            "rgba(249,115,22,0.25)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardGlowLine}
        />

        <View style={styles.heroHeader}>
          <AppText variant="h3" style={{ color: theme.primary }}>
            Pulso académico general
          </AppText>
          <AppText
            variant="body"
            style={styles.heroSubtitle}
            tone="secondary"
            numberOfLines={2}
          >
            {helperText}
          </AppText>
          <AppBadge label={statusLabel} tone={statusTone} />
        </View>

        <View
          style={[
            styles.progressCard,
            isCompactHeight ? styles.progressCardCompact : null,
            { backgroundColor: glassBackground, borderColor: glassBorder },
          ]}
        >
          <LinearGradient
            colors={["rgba(37,99,235,0.45)", "rgba(37,99,235,0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressTopLine}
          />

          <AnimatedProgressBar
            value={overallProgress}
            duration={850}
            label="Progreso académico"
            height={8}
          />

          <View style={styles.statsRow}>
            <AnimatedStatCard
              label="Ramos"
              value={`${totalSubjects}`}
              tone="info"
            />
            <AnimatedStatCard
              label="Con evaluaciones"
              value={`${subjectsWithEvaluations}`}
              delay={70}
            />
            <AnimatedStatCard
              label="En riesgo"
              value={`${subjectsAtRisk}`}
              tone={subjectsAtRisk > 0 ? "warning" : "success"}
              delay={140}
            />
          </View>

          <MiniTrendChart
            points={trendPoints}
            height={isCompactHeight ? 38 : 46}
          />
        </View>

        <Pressable
          onPress={hasSubjects ? onPressCalculateNow : onPressCreateSubject}
          style={({ pressed }) => [
            styles.ctaWrap,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ctaGradient,
              isCompactHeight ? styles.ctaGradientCompact : null,
            ]}
          >
            <AppText variant="button" style={styles.ctaText}>
              {ctaLabel}
            </AppText>
          </LinearGradient>
        </Pressable>

        <View
          style={[
            styles.quickActionsRow,
            isCompactHeight ? styles.quickActionsRowCompact : null,
            isVerySmallHeight ? styles.quickActionsRowVerySmall : null,
          ]}
        >
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.quickAction,
                isCompactHeight ? styles.quickActionCompact : null,
                isVerySmallHeight ? styles.quickActionVerySmall : null,
                {
                  backgroundColor: glassBackground,
                  borderColor: glassBorder,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <AppText style={styles.quickActionIcon}>{action.icon}</AppText>
              <AppText
                variant="caption"
                style={styles.quickActionTitle}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                align="center"
              >
                {action.title}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    borderRadius: 24,
    overflow: "visible",
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  indigoOrb: {
    width: 160,
    height: 160,
    top: -52,
    left: -42,
    backgroundColor: "rgba(37, 99, 235, 0.22)",
  },
  emeraldOrb: {
    width: 122,
    height: 122,
    top: 54,
    right: -34,
    backgroundColor: "rgba(6, 182, 212, 0.18)",
  },
  amberOrb: {
    width: 90,
    height: 90,
    bottom: -28,
    left: 70,
    backgroundColor: "rgba(249, 115, 22, 0.16)",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroCardCompact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  cardGlowLine: {
    height: 3,
    borderRadius: 999,
  },
  heroHeader: {
    gap: 4,
  },
  heroSubtitle: {
    paddingRight: spacing.xs,
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  progressCardCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  progressTopLine: {
    height: 2,
    borderRadius: 999,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  ctaWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  ctaGradient: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  ctaGradientCompact: {
    minHeight: 44,
  },
  ctaText: {
    color: "#F8FAFC",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  quickActionsRowCompact: {
    gap: 6,
  },
  quickActionsRowVerySmall: {
    flexWrap: "wrap",
    rowGap: spacing.xs,
  },
  quickAction: {
    flex: 1,
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  quickActionCompact: {
    minHeight: 64,
    paddingHorizontal: spacing.xs,
  },
  quickActionVerySmall: {
    minWidth: "48%",
    flexBasis: "48%",
  },
  quickActionIcon: {
    fontSize: 18,
    lineHeight: 24,
  },
  quickActionTitle: {
    paddingHorizontal: 2,
  },
  indigoOrbCompact: {
    width: 132,
    height: 132,
    top: -54,
    left: -48,
  },
  emeraldOrbCompact: {
    width: 98,
    height: 98,
    top: 60,
    right: -42,
  },
  amberOrbCompact: {
    width: 78,
    height: 78,
    bottom: -34,
    left: 64,
  },
});

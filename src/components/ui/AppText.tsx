import React from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { useAppTheme } from "../../theme";

type AppTextVariant =
  | "h1"
  | "h1Compact"
  | "h2"
  | "h3"
  | "body"
  | "bodyStrong"
  | "caption"
  | "button"
  // Semantic variants
  | "navTitle"
  | "navSubtitle"
  | "cardTitle"
  | "bodySecondary"
  | "metricLabel"
  | "metricValue"
  // Backward-compatible aliases
  | "title"
  | "subtitle"
  | "hero"
  | "sectionTitle"
  | "label"
  | "metric";

type AppTextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending";

type AppTextProps = {
  children: React.ReactNode;
  variant?: AppTextVariant;
  tone?: AppTextTone;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  align?: "auto" | "left" | "center" | "right" | "justify";
};

export function AppText({
  children,
  variant = "body",
  tone = "primary",
  style,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale,
  align = "left",
}: AppTextProps) {
  const { theme } = useAppTheme();

  const colorMap: Record<AppTextTone, string> = {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    muted: theme.textMuted,
    accent: theme.textAccent,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.info,
    pending: theme.pending,
  };

  // bodySecondary renders in secondary tone by default unless explicitly overridden
  const effectiveTone: AppTextTone =
    variant === "bodySecondary" && tone === "primary" ? "secondary" : tone;

  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      style={[
        styles.base,
        variantStyles[variant],
        { color: colorMap[effectiveTone], textAlign: align },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
});

const variantStyles = StyleSheet.create({
  // Core variants
  h1: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  h1Compact: {
    fontFamily: "Syne_700Bold",
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  h2: {
    fontFamily: "Syne_700Bold",
    fontSize: 20,
    lineHeight: 25,
  },
  h3: {
    fontFamily: "Syne_600SemiBold",
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    lineHeight: 20,
  },
  // Semantic variants
  navTitle: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.4,
  },
  navSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  cardTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 20,
    lineHeight: 25,
  },
  bodySecondary: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  metricLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  metricValue: {
    fontFamily: "Syne_700Bold",
    fontSize: 24,
    lineHeight: 28,
  },
  // Backward-compatible aliases
  subtitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontFamily: "Syne_700Bold",
    fontSize: 20,
    lineHeight: 25,
  },
  hero: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontFamily: "Syne_600SemiBold",
    fontSize: 17,
    lineHeight: 22,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metric: {
    fontFamily: "Syne_700Bold",
    fontSize: 24,
    lineHeight: 28,
  },
});

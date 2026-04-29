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
  // Backward-compatible aliases used across the app
  | "title"
  | "subtitle"
  | "hero"
  | "sectionTitle"
  | "label"
  | "metric";
type AppTextTone =
  | "primary"
  | "secondary"
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

  const colorMap = {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.info,
    pending: theme.pending,
  } as const;

  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      style={[
        styles.base,
        variantStyles[variant],
        { color: colorMap[tone], textAlign: align },
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
  // Aliases
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

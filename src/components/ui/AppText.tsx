import React from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { fontSizes, fontWeights, lineHeights, useAppTheme } from "../../theme";

type AppTextVariant = "body" | "caption" | "title" | "subtitle";
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
};

export function AppText({
  children,
  variant = "body",
  tone = "primary",
  style,
  numberOfLines,
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
      style={[
        styles.base,
        variantStyles[variant],
        { color: colorMap[tone] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.regular,
  },
});

const variantStyles = StyleSheet.create({
  body: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.medium,
  },
  title: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.semibold,
  },
});

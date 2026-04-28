import React from "react";
import { StyleSheet, View } from "react-native";

import { radius, spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

type AppBadgeTone =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending";

type AppBadgeProps = {
  label: string;
  tone?: AppBadgeTone;
};

export function AppBadge({ label, tone = "default" }: AppBadgeProps) {
  const { theme } = useAppTheme();

  const toneMap = {
    default: {
      backgroundColor: theme.surfaceElevated,
      textColor: theme.textSecondary,
    },
    primary: { backgroundColor: theme.primary, textColor: theme.surface },
    secondary: { backgroundColor: theme.secondary, textColor: theme.surface },
    success: { backgroundColor: theme.success, textColor: theme.surface },
    warning: { backgroundColor: theme.warning, textColor: theme.surface },
    danger: { backgroundColor: theme.danger, textColor: theme.surface },
    info: { backgroundColor: theme.info, textColor: theme.surface },
    pending: { backgroundColor: theme.pending, textColor: theme.surface },
  } as const;

  const currentTone = toneMap[tone];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTone.backgroundColor },
      ]}
    >
      <AppText
        variant="caption"
        style={{ color: currentTone.textColor, fontWeight: "600" }}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});

import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { radius, shadows, spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

type AppCardProps = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, title, subtitle, style }: AppCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        shadows.sm,
        style,
      ]}
    >
      {title ? <AppText variant="subtitle">{title}</AppText> : null}
      {subtitle ? (
        <AppText variant="caption" tone="secondary" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  subtitle: {
    marginTop: -2,
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";

import { radius, spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

type AppProgressBarProps = {
  progress: number;
  label?: string;
};

export function AppProgressBar({ progress, label }: AppProgressBarProps) {
  const { theme } = useAppTheme();
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {label ? <AppText variant="caption">{label}</AppText> : null}
      <View style={[styles.track, { backgroundColor: theme.surfaceElevated }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${safeProgress}%`,
              backgroundColor: theme.primary,
            },
          ]}
        />
      </View>
      <AppText variant="caption" tone="secondary">
        {safeProgress}%
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});

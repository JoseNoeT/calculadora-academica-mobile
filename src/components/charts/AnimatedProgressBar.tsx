import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/ui";
import { useAppTheme } from "@/src/theme";

type AnimatedProgressBarProps = {
  value: number;
  label?: string;
  height?: number;
  duration?: number;
  showValue?: boolean;
};

export function AnimatedProgressBar({
  value,
  label,
  height = 10,
  duration = 850,
  showValue = true,
}: AnimatedProgressBarProps) {
  const { theme } = useAppTheme();
  const progress = useRef(new Animated.Value(0)).current;

  const normalizedValue = Math.max(0, Math.min(100, value));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: normalizedValue,
      duration,
      useNativeDriver: false,
    }).start();
  }, [duration, normalizedValue, progress]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.root}>
      {label || showValue ? (
        <View style={styles.header}>
          {label ? (
            <AppText variant="caption" tone="secondary">
              {label}
            </AppText>
          ) : (
            <View />
          )}
          {showValue ? (
            <AppText variant="caption">{Math.round(normalizedValue)}%</AppText>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.track, { backgroundColor: theme.border, height }]}>
        <Animated.View style={[styles.fillMask, { width }]}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  track: {
    borderRadius: 999,
    overflow: "hidden",
  },
  fillMask: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
});

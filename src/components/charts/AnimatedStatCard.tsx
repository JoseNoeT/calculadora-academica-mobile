import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { AppText } from "@/src/components/ui";
import { radius, spacing, useAppTheme } from "@/src/theme";

type AnimatedStatCardProps = {
  label: string;
  value: string;
  tone?: "primary" | "secondary" | "info" | "warning" | "success" | "danger";
  delay?: number;
};

export function AnimatedStatCard({
  label,
  value,
  tone = "primary",
  delay = 0,
}: AnimatedStatCardProps) {
  const { theme } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <AppText
        variant="caption"
        tone="secondary"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </AppText>
      <AppText
        variant="h3"
        tone={tone}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {value}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 70,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: "center",
    gap: 4,
  },
});

import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

export type AppCardVariant = "default" | "elevated" | "glass" | "accent";
export type AppCardAccentTone = "cool" | "warm";

type AppCardProps = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  variant?: AppCardVariant;
  accentTone?: AppCardAccentTone;
  showTopAccent?: boolean;
  animateOnMount?: boolean;
};

export function AppCard({
  children,
  title,
  subtitle,
  style,
  variant = "default",
  accentTone = "cool",
  showTopAccent,
  animateOnMount = false,
}: AppCardProps) {
  const { theme } = useAppTheme();
  const opacity = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animateOnMount ? 8 : 0)).current;

  useEffect(() => {
    if (!animateOnMount) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animateOnMount, opacity, translateY]);

  const resolvedShowTopAccent = showTopAccent ?? variant === "accent";

  const baseBackground =
    variant === "glass"
      ? theme.mode === "dark"
        ? "rgba(30, 41, 59, 0.76)"
        : "rgba(255, 255, 255, 0.86)"
      : variant === "elevated"
        ? theme.mode === "dark"
          ? "rgba(51, 65, 85, 0.94)"
          : theme.surface
        : theme.surface;

  const borderColor =
    variant === "accent"
      ? accentTone === "warm"
        ? theme.warning
        : theme.info
      : theme.border;

  const shadowStyle = {
    shadowColor: "#000",
    shadowOpacity:
      variant === "elevated"
        ? theme.mode === "dark"
          ? 0.24
          : 0.12
        : theme.mode === "dark"
          ? 0.16
          : 0.08,
    shadowRadius: variant === "elevated" ? 14 : 9,
    shadowOffset: { width: 0, height: variant === "elevated" ? 6 : 4 },
    elevation: variant === "elevated" ? (theme.mode === "dark" ? 5 : 4) : 2,
  } as const;

  const accentColors =
    accentTone === "warm"
      ? (["rgba(249,115,22,0.9)", "rgba(245,158,11,0.85)"] as const)
      : (["rgba(37,99,235,0.9)", "rgba(6,182,212,0.85)"] as const);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: baseBackground,
          borderColor,
        },
        shadowStyle,
        animateOnMount ? { opacity, transform: [{ translateY }] } : null,
        style,
      ]}
    >
      {resolvedShowTopAccent ? (
        <LinearGradient
          colors={[...accentColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topAccent}
        />
      ) : null}

      {title || subtitle ? (
        <View style={styles.header}>
          {title ? (
            <AppText variant="h2" numberOfLines={2}>
              {title}
            </AppText>
          ) : null}
          {subtitle ? (
            <AppText variant="caption" tone="secondary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  topAccent: {
    height: 3,
    borderRadius: 999,
    marginBottom: spacing.xs,
  },
  header: {
    gap: spacing.xs,
  },
});

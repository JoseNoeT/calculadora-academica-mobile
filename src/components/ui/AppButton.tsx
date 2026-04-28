import React from "react";
import {
    Pressable,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { radius, spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

type AppButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: AppButtonProps) {
  const { theme } = useAppTheme();

  const variantStyles = {
    primary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      textColor: theme.surface,
    },
    secondary: {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
      textColor: theme.surface,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.border,
      textColor: theme.textPrimary,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: theme.primary,
    },
  } as const;

  const currentVariant = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderColor: currentVariant.borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <AppText style={{ color: currentVariant.textColor, fontWeight: "600" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});

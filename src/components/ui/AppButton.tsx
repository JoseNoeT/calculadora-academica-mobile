import React from "react";
import {
    Pressable,
    StyleSheet,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from "react-native";

import { radius, shadows, spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

type AppButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  labelStyle,
}: AppButtonProps) {
  const { theme } = useAppTheme();

  const variantStyles = {
    primary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      textColor: theme.surface,
      withShadow: true,
    },
    secondary: {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
      textColor: theme.surface,
      withShadow: true,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.border,
      textColor: theme.textPrimary,
      withShadow: false,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: theme.primary,
      withShadow: false,
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
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        currentVariant.withShadow ? shadows.sm : null,
        style,
      ]}
    >
      <AppText
        variant="button"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[{ color: currentVariant.textColor }, labelStyle]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
});

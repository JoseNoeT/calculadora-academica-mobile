import React from "react";
import {
    StyleSheet,
    TextInput,
    View,
    type StyleProp,
    type TextInputProps,
    type ViewStyle,
} from "react-native";

import { radius, spacing, useAppTheme } from "../../theme";
import { AppText } from "./AppText";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function AppInput({
  label,
  error,
  containerStyle,
  ...props
}: AppInputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" tone="secondary">
          {label}
        </AppText>
      ) : null}
      <TextInput
        {...props}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.primary}
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
      />
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});

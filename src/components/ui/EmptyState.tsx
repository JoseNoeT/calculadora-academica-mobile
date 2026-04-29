import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../theme";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title">{title}</AppText>
      {description ? (
        <AppText tone="secondary" style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {actionLabel ? (
        <AppButton label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  description: {
    textAlign: "center",
  },
});

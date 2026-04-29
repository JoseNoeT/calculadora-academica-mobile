import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { radius, shadows, spacing, useAppTheme } from "../../theme";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

type AppModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function AppModal({
  visible,
  title,
  description,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: AppModalProps) {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View
          style={[
            styles.container,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.md,
          ]}
        >
          <AppText variant="subtitle">{title}</AppText>
          {description ? (
            <AppText variant="body" tone="secondary">
              {description}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <AppButton
              label={cancelLabel}
              variant="outline"
              onPress={onCancel}
              style={styles.button}
            />
            <AppButton
              label={confirmLabel}
              variant="primary"
              onPress={onConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

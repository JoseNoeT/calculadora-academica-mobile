import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

type AppScreenHeaderProps = {
  backLabel?: string;
  onBack?: () => void;
};

export function AppScreenHeader({
  backLabel = "Volver",
  onBack,
}: AppScreenHeaderProps) {
  const router = useRouter();
  const { theme } = useAppTheme();

  const handleBack = onBack ?? (() => router.back());

  const chipBackground =
    theme.mode === "dark"
      ? "rgba(148, 163, 184, 0.1)"
      : "rgba(37, 99, 235, 0.06)";

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: chipBackground,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        hitSlop={8}
      >
        <AppText style={[styles.arrow, { color: theme.primary }]}>←</AppText>
        <AppText style={[styles.label, { color: theme.primary }]}>
          {backLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
  },
  arrow: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "DMSans_500Medium",
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    lineHeight: 18,
  },
});

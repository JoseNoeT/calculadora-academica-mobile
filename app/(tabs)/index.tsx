import { type Href, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const quickCalculatorRoute: Href = "/calculator/quick" as Href;

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="caption" tone="secondary">
            Panel académico
          </AppText>
          <AppText variant="title">Calculadora Académica</AppText>
          <AppText tone="secondary">
            Calcula, proyecta y mejora tus notas.
          </AppText>
        </View>

        <AppCard
          title="Mantén el control"
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText>Controla tu avance antes de que sea tarde.</AppText>
        </AppCard>

        <AppCard title="Acciones rápidas" subtitle="Próximamente disponibles">
          <View style={styles.actionsGrid}>
            <View style={styles.actionsRow}>
              <AppButton
                label="Calcular rápido"
                variant="secondary"
                style={styles.actionButton}
                onPress={() => router.push(quickCalculatorRoute)}
              />
              <AppButton
                label="Mis ramos"
                variant="outline"
                style={styles.actionButton}
              />
            </View>
            <View style={styles.actionsRow}>
              <AppButton
                label="Simular nota"
                variant="outline"
                style={styles.actionButton}
              />
              <AppButton
                label="Configuración"
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </View>
        </AppCard>

        <AppCard
          title="Estado inicial"
          subtitle="Comienza en menos de un minuto"
        >
          <AppText>Sin ramos registrados todavía.</AppText>
          <AppText tone="secondary">
            Agrega tu primer ramo para comenzar a controlar tus notas.
          </AppText>
          <AppButton label="Crear primer ramo" style={styles.primaryAction} />
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    gap: spacing.sm,
  },
  actionsGrid: {
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
  primaryAction: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
});

import { StyleSheet, View } from "react-native";

import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

export default function QuickCalculatorScreen() {
  const { theme } = useAppTheme();

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Calculadora rápida</AppText>
          <AppText tone="secondary">
            Calcula una situación puntual sin guardar datos.
          </AppText>
        </View>

        <AppCard
          title="Antes de comenzar"
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText>
            Ingresa tus evaluaciones, notas y ponderaciones. Las notas
            pendientes no se calcularán como cero.
          </AppText>
        </AppCard>

        <AppCard title="Evaluaciones" subtitle="Ejemplo visual">
          <View style={styles.evaluationsList}>
            <View style={styles.evaluationRow}>
              <AppText variant="subtitle">Evaluación 1</AppText>
              <AppText tone="secondary">Nota 5.5 | Ponderación 30%</AppText>
            </View>

            <View style={styles.evaluationRow}>
              <AppText variant="subtitle">Evaluación 2</AppText>
              <AppText tone="secondary">Pendiente | Ponderación 40%</AppText>
            </View>
          </View>

          <AppButton
            label="+ Agregar evaluación"
            variant="outline"
            style={styles.sectionAction}
          />
        </AppCard>

        <AppCard title="Resumen preliminar">
          <View style={styles.summaryList}>
            <AppText>Promedio actual: 5.50</AppText>
            <AppText>Ponderación rendida: 30%</AppText>
            <AppText>Ponderación pendiente: 70%</AppText>
            <AppText>Nota necesaria: —</AppText>
            <AppText>Estado: Pendiente</AppText>
          </View>

          <View style={styles.actionsRow}>
            <AppButton label="Calcular" style={styles.actionButton} />
            <AppButton
              label="Limpiar"
              variant="outline"
              style={styles.actionButton}
            />
          </View>
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
  evaluationsList: {
    gap: spacing.md,
  },
  evaluationRow: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  sectionAction: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
  summaryList: {
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
});

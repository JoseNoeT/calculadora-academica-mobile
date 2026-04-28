import { StyleSheet, View } from "react-native";

import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/ui";
import { spacing } from "@/src/theme";

export default function HomeScreen() {
  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Calculadora Académica</AppText>
          <AppText tone="secondary">
            Calcula, proyecta y mejora tus notas.
          </AppText>
        </View>

        <AppCard>
          <AppText tone="secondary">
            Controla tu avance antes de que sea tarde.
          </AppText>
        </AppCard>

        <AppCard title="Acciones rápidas" subtitle="Próximamente disponibles">
          <View style={styles.actionsGrid}>
            <AppButton label="Calcular rápido" variant="secondary" />
            <AppButton label="Mis ramos" variant="outline" />
            <AppButton label="Simular nota" variant="outline" />
            <AppButton label="Configuración" variant="outline" />
          </View>
        </AppCard>

        <AppCard title="Estado inicial">
          <AppText>Sin ramos registrados todavía.</AppText>
          <AppText tone="secondary">
            Agrega tu primer ramo para comenzar a controlar tus notas.
          </AppText>
        </AppCard>

        <AppButton label="Crear primer ramo" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    gap: spacing.xs,
  },
  actionsGrid: {
    gap: spacing.sm,
  },
});

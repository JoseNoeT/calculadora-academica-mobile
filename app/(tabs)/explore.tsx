import { StyleSheet, View } from "react-native";

import { AppCard, AppScreen, AppText, EmptyState } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

export default function SubjectsShellScreen() {
  const { theme } = useAppTheme();

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Mis ramos</AppText>
          <AppText tone="secondary">
            Organiza tus asignaturas y controla tu avance académico.
          </AppText>
        </View>

        <AppCard style={{ backgroundColor: theme.surfaceElevated }}>
          <EmptyState
            title="Aún no tienes ramos registrados."
            description="Cuando agregues un ramo, podrás ver su promedio actual, ponderación rendida, nota necesaria y estado académico."
            actionLabel="Agregar primer ramo"
            onAction={() => {
              // TODO: conectar con flujo real de creación cuando exista la pantalla.
            }}
          />
        </AppCard>

        <AppCard title="¿Qué podrás revisar aquí?">
          <View style={styles.educationalList}>
            <AppText>• Promedio actual</AppText>
            <AppText>• Nota necesaria para aprobar</AppText>
            <AppText>• Evaluaciones pendientes</AppText>
            <AppText>• Estado académico por ramo</AppText>
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
  educationalList: {
    gap: spacing.sm,
  },
});

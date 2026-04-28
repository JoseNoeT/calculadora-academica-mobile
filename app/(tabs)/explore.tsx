import { type Href, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

export default function SubjectsShellScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const createSubjectRoute: Href = "/subjects/create" as Href;

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Mis ramos</AppText>
          <AppText tone="secondary">
            Organiza tus asignaturas y controla tu avance académico.
          </AppText>
        </View>

        <AppCard
          title="Aún no tienes ramos registrados."
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText tone="secondary">
            Crea tu primer ramo para guardar evaluaciones, ponderaciones, notas
            pendientes y calcular tu estado académico durante el semestre.
          </AppText>
          <AppButton
            label="Agregar primer ramo"
            style={styles.primaryAction}
            onPress={() => router.push(createSubjectRoute)}
          />
        </AppCard>

        <AppCard title="¿Qué podrás revisar por ramo?">
          <View style={styles.educationalList}>
            <AppText>• Promedio ponderado actual</AppText>
            <AppText>• Puntos acumulados</AppText>
            <AppText>• Ponderación rendida y pendiente</AppText>
            <AppText>• Nota necesaria para aprobar</AppText>
            <AppText>• Estado académico automático</AppText>
            <AppText>• Evaluación pendiente más importante</AppText>
          </View>
        </AppCard>

        <AppCard
          title="Siguiente mejora"
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText tone="secondary">
            Pronto podrás crear ramos, agregar evaluaciones y guardar tu avance
            localmente en el dispositivo.
          </AppText>
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
  primaryAction: {
    marginTop: spacing.md,
    minHeight: 48,
  },
});

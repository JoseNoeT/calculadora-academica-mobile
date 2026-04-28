import { useFocusEffect } from "@react-navigation/native";
import { type Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/ui";
import { getSubjects } from "@/src/features/subjects/services/subjectService";
import type { SubjectListItem } from "@/src/features/subjects/types/subject.types";
import { spacing, useAppTheme } from "@/src/theme";

export default function SubjectsShellScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const createSubjectRoute: Href = "/subjects/create" as Href;
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);

  const loadSubjects = useCallback(async () => {
    const items = await getSubjects();
    setSubjects(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSubjects();
    }, [loadSubjects]),
  );

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Mis ramos</AppText>
          <AppText tone="secondary">
            Organiza tus asignaturas y controla tu avance académico.
          </AppText>
        </View>

        {subjects.length === 0 ? (
          <AppCard
            title="Aún no tienes ramos registrados."
            style={{ backgroundColor: theme.surfaceElevated }}
          >
            <AppText tone="secondary">
              Crea tu primer ramo para guardar evaluaciones, ponderaciones,
              notas pendientes y calcular tu estado académico durante el
              semestre.
            </AppText>
            <AppButton
              label="Agregar primer ramo"
              style={styles.primaryAction}
              onPress={() => router.push(createSubjectRoute)}
            />
          </AppCard>
        ) : (
          <View style={styles.subjectsList}>
            <AppCard
              title="Tus ramos"
              subtitle="Guardados localmente en este dispositivo"
            >
              <AppButton
                label="Agregar ramo"
                variant="outline"
                style={styles.primaryAction}
                onPress={() => router.push(createSubjectRoute)}
              />
            </AppCard>

            {subjects.map((subject) => (
              <AppCard key={subject.id}>
                <View style={styles.subjectHeader}>
                  <AppText variant="subtitle">{subject.name}</AppText>
                  <View
                    style={[
                      styles.subjectColorDot,
                      {
                        backgroundColor: subject.color,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                </View>
                <AppText tone="secondary">
                  Nota mínima: {subject.minimumGrade.toFixed(1)}
                </AppText>
                <AppText tone="secondary">Sin evaluaciones todavía</AppText>
              </AppCard>
            ))}
          </View>
        )}

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
  subjectsList: {
    gap: spacing.md,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectColorDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  primaryAction: {
    marginTop: spacing.md,
    minHeight: 48,
  },
});

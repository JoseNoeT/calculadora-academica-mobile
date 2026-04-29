import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";

import { AppHeader } from "@/src/components/layout/AppHeader";
import {
    AppBadge,
    AppButton,
    AppCard,
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import {
    deleteAllSubjectsData,
    getAppPreferences,
    resetApplicationData,
    saveAcademicSettings,
    saveBehaviorSettings,
    type AppPreferences,
    type GradingScale,
} from "@/src/storage/settingsStorage";
import type { ThemeName } from "@/src/theme";
import { spacing, useAppTheme } from "@/src/theme";

const themeOptions: Array<{
  value: ThemeName;
  label: string;
  description: string;
}> = [
  {
    value: "system",
    label: "Sistema",
    description: "Usa automáticamente el modo de tu dispositivo.",
  },
  {
    value: "light",
    label: "Claro",
    description: "Prioriza legibilidad en ambientes luminosos.",
  },
  {
    value: "dark",
    label: "Oscuro",
    description: "Reduce brillo y fatiga visual en ambientes oscuros.",
  },
];

const gradingScaleOptions: Array<{
  value: GradingScale;
  label: string;
  description: string;
}> = [
  {
    value: "1.0-7.0",
    label: "Escala chilena",
    description: "Rango activo: 1.0 a 7.0 (extensible en futuras versiones).",
  },
];

const defaultPreferences: AppPreferences = {
  globalPassingGrade: 4.0,
  gradingScale: "1.0-7.0",
  showAcademicAdvice: true,
  showRiskAlerts: true,
  enableAnimations: true,
};

export default function SettingsScreen() {
  const { theme, themeName, setThemeName } = useAppTheme();
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultPreferences);
  const [minimumGradeInput, setMinimumGradeInput] = useState("4.0");
  const [minimumGradeError, setMinimumGradeError] = useState<string>();
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);

  const appVersion = useMemo(
    () => Constants.expoConfig?.version ?? "1.0.0",
    [],
  );
  const projectName = useMemo(
    () => Constants.expoConfig?.name ?? "Calculadora Académica Mobile",
    [],
  );

  const hydratePreferences = useCallback(async () => {
    const nextPreferences = await getAppPreferences();
    setPreferences(nextPreferences);
    setMinimumGradeInput(nextPreferences.globalPassingGrade.toFixed(1));
    setMinimumGradeError(undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void hydratePreferences();
    }, [hydratePreferences]),
  );

  const handleSaveAcademicSettings = useCallback(async () => {
    const parsed = Number(minimumGradeInput.replace(",", ".").trim());

    if (!Number.isFinite(parsed)) {
      setMinimumGradeError("Ingresa un valor numérico válido.");
      return;
    }

    if (parsed < 1 || parsed > 7) {
      setMinimumGradeError("La nota mínima global debe estar entre 1.0 y 7.0.");
      return;
    }

    const normalizedGrade = Math.round((parsed + Number.EPSILON) * 10) / 10;

    try {
      setIsSavingAcademic(true);
      await saveAcademicSettings({
        globalPassingGrade: normalizedGrade,
        gradingScale: preferences.gradingScale,
      });
      setPreferences((current) => ({
        ...current,
        globalPassingGrade: normalizedGrade,
      }));
      setMinimumGradeInput(normalizedGrade.toFixed(1));
      setMinimumGradeError(undefined);
    } finally {
      setIsSavingAcademic(false);
    }
  }, [minimumGradeInput, preferences.gradingScale]);

  const handleSelectScale = useCallback(
    async (nextScale: GradingScale) => {
      if (nextScale === preferences.gradingScale) {
        return;
      }

      await saveAcademicSettings({
        globalPassingGrade: preferences.globalPassingGrade,
        gradingScale: nextScale,
      });
      setPreferences((current) => ({ ...current, gradingScale: nextScale }));
    },
    [preferences.globalPassingGrade, preferences.gradingScale],
  );

  const handleToggleBehavior = useCallback(
    async (
      key: "showAcademicAdvice" | "showRiskAlerts" | "enableAnimations",
    ) => {
      const next = {
        ...preferences,
        [key]: !preferences[key],
      };

      setPreferences(next);
      await saveBehaviorSettings({
        showAcademicAdvice: next.showAcademicAdvice,
        showRiskAlerts: next.showRiskAlerts,
        enableAnimations: next.enableAnimations,
      });
    },
    [preferences],
  );

  const handleDeleteAllSubjects = useCallback(() => {
    Alert.alert(
      "Eliminar todos los ramos",
      "Se eliminarán todos los ramos y evaluaciones guardadas en este dispositivo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteAllSubjectsData();
            Alert.alert(
              "Datos eliminados",
              "Todos los ramos fueron eliminados correctamente.",
            );
          },
        },
      ],
    );
  }, []);

  const handleResetApplication = useCallback(() => {
    Alert.alert(
      "Reiniciar aplicación",
      "Se eliminarán ramos, evaluaciones y configuraciones personalizadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: async () => {
            await resetApplicationData();
            setThemeName("system");
            await hydratePreferences();
            Alert.alert(
              "Aplicación reiniciada",
              "La configuración volvió a su estado inicial.",
            );
          },
        },
      ],
    );
  }, [hydratePreferences, setThemeName]);

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <AppHeader hideSettingsAction />

        <AppCard title="Tema de la aplicación" variant="elevated" showTopAccent>
          <AppText variant="body" tone="secondary">
            El cambio se guarda automáticamente y se mantiene al volver a abrir
            la app.
          </AppText>

          <View style={styles.optionsList}>
            {themeOptions.map((option) => {
              const isSelected = themeName === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setThemeName(option.value)}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected
                        ? theme.surfaceElevated
                        : theme.surface,
                    },
                  ]}
                >
                  <View style={styles.optionTitleRow}>
                    <AppText variant="h3">{option.label}</AppText>
                    <View
                      style={[
                        styles.selectionDot,
                        {
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                          backgroundColor: isSelected
                            ? theme.primary
                            : "transparent",
                        },
                      ]}
                    />
                  </View>
                  <AppText tone="secondary" variant="caption">
                    {option.description}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        <AppCard title="Configuración académica" variant="elevated">
          <AppInput
            label="Nota mínima global"
            value={minimumGradeInput}
            onChangeText={setMinimumGradeInput}
            keyboardType="decimal-pad"
            placeholder="Ej: 4.0"
            error={minimumGradeError}
          />

          <View style={styles.optionsList}>
            {gradingScaleOptions.map((scale) => {
              const isSelected = preferences.gradingScale === scale.value;

              return (
                <Pressable
                  key={scale.value}
                  onPress={() => void handleSelectScale(scale.value)}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected
                        ? theme.surfaceElevated
                        : theme.surface,
                    },
                  ]}
                >
                  <View style={styles.optionTitleRow}>
                    <AppText variant="h3">{scale.label}</AppText>
                    {isSelected ? (
                      <AppBadge label="Activo" tone="info" />
                    ) : null}
                  </View>
                  <AppText variant="caption" tone="secondary">
                    {scale.description}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppButton
            label={isSavingAcademic ? "Guardando..." : "Guardar"}
            onPress={() => void handleSaveAcademicSettings()}
            disabled={isSavingAcademic}
          />
        </AppCard>

        <AppCard title="Comportamiento" variant="glass">
          <View style={styles.switchList}>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <AppText variant="h3">Consejos académicos</AppText>
                <AppText variant="caption" tone="secondary">
                  Muestra recomendaciones automáticas según tu estado actual.
                </AppText>
              </View>
              <Switch
                value={preferences.showAcademicAdvice}
                onValueChange={() =>
                  void handleToggleBehavior("showAcademicAdvice")
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <AppText variant="h3">Alertas de riesgo</AppText>
                <AppText variant="caption" tone="secondary">
                  Activa notificaciones visuales cuando haya ramos críticos.
                </AppText>
              </View>
              <Switch
                value={preferences.showRiskAlerts}
                onValueChange={() =>
                  void handleToggleBehavior("showRiskAlerts")
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <AppText variant="h3">Animaciones</AppText>
                <AppText variant="caption" tone="secondary">
                  Habilita transiciones y microanimaciones de la interfaz.
                </AppText>
              </View>
              <Switch
                value={preferences.enableAnimations}
                onValueChange={() =>
                  void handleToggleBehavior("enableAnimations")
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>
          </View>
        </AppCard>

        <AppCard title="Datos" variant="accent" accentTone="warm">
          <AppText variant="caption" tone="secondary">
            Estas acciones son locales y no requieren conexión a internet.
          </AppText>

          <View style={styles.actionsRow}>
            <AppButton
              label="Eliminar ramos"
              variant="outline"
              onPress={handleDeleteAllSubjects}
              style={styles.actionButton}
            />
            <AppButton
              label="Reiniciar app"
              variant="outline"
              onPress={handleResetApplication}
              style={styles.actionButton}
            />
          </View>
        </AppCard>

        <AppCard title="Información" variant="glass">
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="secondary">
              Proyecto
            </AppText>
            <AppText variant="bodyStrong">{projectName}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="secondary">
              Versión
            </AppText>
            <AppText variant="bodyStrong">{appVersion}</AppText>
          </View>
          <AppText variant="caption" tone="secondary">
            Panel de configuración local para pruebas académicas y ajustes de
            experiencia.
          </AppText>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  optionsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  switchList: {
    gap: spacing.md,
  },
  switchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  switchCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  infoRow: {
    gap: 2,
  },
});

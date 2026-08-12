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
import { strings } from "@/src/constants/strings";
import { parseAcademicNumber } from "@/src/domain/utils/parseAcademicNumber";
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
    label: strings.settings.system,
    description: strings.settings.systemDescription,
  },
  {
    value: "light",
    label: strings.settings.light,
    description: strings.settings.lightDescription,
  },
  {
    value: "dark",
    label: strings.settings.dark,
    description: strings.settings.darkDescription,
  },
];

const gradingScaleOptions: Array<{
  value: GradingScale;
  label: string;
  description: string;
}> = [
  {
    value: "1.0-7.0",
    label: strings.settings.chileanScale,
    description: strings.settings.scaleDescription,
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
    () => Constants.expoConfig?.name ?? strings.settings.projectFallbackName,
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
    const parsed = parseAcademicNumber(minimumGradeInput);

    if (parsed === null) {
      setMinimumGradeError(strings.settings.invalidNumericValue);
      return;
    }

    if (parsed < 1 || parsed > 7) {
      setMinimumGradeError(strings.settings.globalMinRangeError);
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
      strings.settings.deleteAllSubjectsTitle,
      strings.settings.deleteAllSubjectsMessage,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.common.delete,
          style: "destructive",
          onPress: async () => {
            await deleteAllSubjectsData();
            Alert.alert(
              strings.settings.deletedDataTitle,
              strings.settings.deletedDataMessage,
            );
          },
        },
      ],
    );
  }, []);

  const handleResetApplication = useCallback(() => {
    Alert.alert(
      strings.settings.resetAppTitle,
      strings.settings.resetAppMessage,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.settings.resetButton,
          style: "destructive",
          onPress: async () => {
            await resetApplicationData();
            setThemeName("system");
            await hydratePreferences();
            Alert.alert(
              strings.settings.appResetTitle,
              strings.settings.appResetMessage,
            );
          },
        },
      ],
    );
  }, [hydratePreferences, setThemeName]);

  return (
    <AppScreen scrollable stickyHeader={<AppHeader hideSettingsAction />}>
      <View style={styles.container}>
        <AppCard
          title={strings.settings.appThemeTitle}
          variant="elevated"
          showTopAccent
        >
          <AppText variant="bodySecondary">
            {strings.settings.appThemeDescription}
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

        <AppCard
          title={strings.settings.academicConfigTitle}
          variant="elevated"
        >
          <AppInput
            label={strings.settings.globalMinLabel}
            value={minimumGradeInput}
            onChangeText={setMinimumGradeInput}
            keyboardType="decimal-pad"
            placeholder={strings.settings.globalMinPlaceholder}
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
                      <AppBadge label={strings.settings.active} tone="info" />
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
            label={
              isSavingAcademic ? strings.settings.saving : strings.common.save
            }
            onPress={() => void handleSaveAcademicSettings()}
            disabled={isSavingAcademic}
          />
        </AppCard>

        <AppCard title={strings.settings.behaviorTitle} variant="glass">
          <View style={styles.switchList}>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <AppText variant="h3">
                  {strings.settings.academicAdviceTitle}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {strings.settings.academicAdviceDescription}
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
                <AppText variant="h3">
                  {strings.settings.riskAlertsTitle}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {strings.settings.riskAlertsDescription}
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
                <AppText variant="h3">
                  {strings.settings.animationsTitle}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {strings.settings.animationsDescription}
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

        <AppCard
          title={strings.settings.dataTitle}
          variant="accent"
          accentTone="warm"
        >
          <AppText variant="caption" tone="secondary">
            {strings.settings.dataDescription}
          </AppText>

          <View style={styles.actionsRow}>
            <AppButton
              label={strings.settings.deleteSubjects}
              variant="outline"
              onPress={handleDeleteAllSubjects}
              style={styles.actionButton}
            />
            <AppButton
              label={strings.settings.resetApp}
              variant="outline"
              onPress={handleResetApplication}
              style={styles.actionButton}
            />
          </View>
        </AppCard>

        <AppCard title={strings.settings.infoTitle} variant="glass">
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="secondary">
              {strings.settings.project}
            </AppText>
            <AppText variant="bodyStrong">{projectName}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="secondary">
              {strings.settings.version}
            </AppText>
            <AppText variant="bodyStrong">{appVersion}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="secondary">
              {strings.settings.developedBy}
            </AppText>
            <AppText variant="bodyStrong">
              {strings.settings.developedByValue}
            </AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText variant="caption" tone="secondary">
              {strings.settings.github}
            </AppText>
            <AppText variant="bodyStrong">{strings.settings.githubValue}</AppText>
          </View>
          <AppText variant="caption" tone="secondary">
            {strings.settings.infoDescription}
          </AppText>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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

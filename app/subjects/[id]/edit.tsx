import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
    AppButton,
    AppCard,
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { strings } from "@/src/constants/strings";
import { MAX_GRADE, MIN_GRADE } from "@/src/domain/rules";
import { parseAcademicNumber } from "@/src/domain/utils/parseAcademicNumber";
import {
    getSubjectById,
    updateSubject,
} from "@/src/features/subjects/services/subjectService";
import { spacing, useAppTheme } from "@/src/theme";
import {
    getSubjectColorById,
    getSubjectColorByValue,
    SUBJECT_COLORS,
} from "@/src/theme/subjectColors";

export default function EditSubjectScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subjectName, setSubjectName] = useState("");
  const [minimumGradeInput, setMinimumGradeInput] = useState("");
  const [selectedColorId, setSelectedColorId] = useState(SUBJECT_COLORS[0].id);

  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [minimumGradeError, setMinimumGradeError] = useState<
    string | undefined
  >(undefined);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSubject = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const subject = await getSubjectById(params.id);
        if (!isMounted) {
          return;
        }

        if (!subject) {
          setLoadError(strings.editSubject.missingSubject);
          setIsLoading(false);
          return;
        }

        setSubjectName(subject.name);
        setMinimumGradeInput(subject.minimumGrade.toFixed(1));
        const foundColor = getSubjectColorByValue(subject.color);
        setSelectedColorId(foundColor?.id ?? SUBJECT_COLORS[0].id);
        setIsLoading(false);
      } catch {
        if (!isMounted) {
          return;
        }
        setLoadError(strings.editSubject.loadFailed);
        setIsLoading(false);
      }
    };

    void loadSubject();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleSave = async () => {
    const normalizedName = subjectName.trim();
    const parsedMinimumGrade = parseAcademicNumber(minimumGradeInput);

    let hasError = false;

    if (!normalizedName) {
      setNameError(strings.editSubject.nameRequired);
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (
      parsedMinimumGrade === null ||
      parsedMinimumGrade < MIN_GRADE ||
      parsedMinimumGrade > MAX_GRADE
    ) {
      setMinimumGradeError(
        strings.editSubject.gradeRangeError(MIN_GRADE, MAX_GRADE),
      );
      hasError = true;
    } else {
      setMinimumGradeError(undefined);
    }

    if (hasError) {
      setSaveError(null);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      await updateSubject(params.id, {
        name: normalizedName,
        minimumGrade: parsedMinimumGrade!,
        color: getSubjectColorById(selectedColorId).background,
      });

      router.back();
    } catch (error) {
      setIsSaving(false);
      setSaveError(
        error instanceof Error ? error.message : strings.editSubject.saveFailed,
      );
    }
  };

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: strings.editSubject.stackTitle }} />
      <View style={styles.container}>
        {isLoading ? (
          <AppCard title={strings.editSubject.loadingTitle}>
            <AppText tone="secondary">
              {strings.editSubject.waitMessage}
            </AppText>
          </AppCard>
        ) : loadError ? (
          <AppCard title={strings.editSubject.unavailableTitle}>
            <AppText tone="secondary">{loadError}</AppText>
            <AppButton
              label={strings.common.back}
              variant="outline"
              style={styles.backButton}
              onPress={() => router.back()}
            />
          </AppCard>
        ) : (
          <>
            <View style={styles.headerSection}>
              <AppText variant="title">
                {strings.editSubject.headerTitle}
              </AppText>
              <AppText tone="secondary">
                {strings.editSubject.headerDescription}
              </AppText>
            </View>

            <AppCard title={strings.editSubject.dataTitle}>
              <AppInput
                label={strings.editSubject.nameLabel}
                value={subjectName}
                onChangeText={setSubjectName}
                placeholder={strings.editSubject.namePlaceholder}
                error={nameError}
              />

              <AppInput
                label={strings.editSubject.minGradeLabel}
                value={minimumGradeInput}
                onChangeText={setMinimumGradeInput}
                placeholder={strings.editSubject.minGradePlaceholder}
                keyboardType="decimal-pad"
                error={minimumGradeError}
              />

              <View style={styles.colorSection}>
                <AppText variant="caption">
                  {strings.editSubject.colorIdentifier}
                </AppText>
                <View style={styles.colorGrid}>
                  {SUBJECT_COLORS.map((color) => {
                    const isSelected = color.id === selectedColorId;

                    return (
                      <Pressable
                        key={color.id}
                        onPress={() => setSelectedColorId(color.id)}
                        accessibilityLabel={color.name}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color.background },
                          isSelected && {
                            borderWidth: 3,
                            borderColor: color.textOnColor,
                          },
                        ]}
                      >
                        {isSelected ? (
                          <AppText
                            style={[
                              styles.colorSwatchCheck,
                              { color: color.textOnColor },
                            ]}
                          >
                            ✓
                          </AppText>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.colorPreview}>
                  <View
                    style={[
                      styles.colorPreviewDot,
                      {
                        backgroundColor:
                          getSubjectColorById(selectedColorId).background,
                      },
                    ]}
                  />
                  <AppText variant="caption" tone="secondary">
                    {getSubjectColorById(selectedColorId).name}
                  </AppText>
                </View>
              </View>
            </AppCard>

            {saveError ? (
              <AppCard style={{ backgroundColor: theme.surfaceElevated }}>
                <AppText tone="danger">{saveError}</AppText>
              </AppCard>
            ) : null}

            <View style={styles.actionsRow}>
              <AppButton
                label={
                  isSaving
                    ? strings.editSubject.saving
                    : strings.editSubject.saveChanges
                }
                style={styles.actionButton}
                onPress={() => void handleSave()}
              />
              <AppButton
                label={strings.common.cancel}
                variant="outline"
                style={styles.actionButton}
                onPress={() => router.back()}
              />
            </View>
          </>
        )}
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
  colorSection: {
    gap: spacing.sm,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchCheck: {
    fontSize: 18,
    lineHeight: 22,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  colorPreviewDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
  backButton: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
});

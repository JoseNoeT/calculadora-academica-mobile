import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppScreenHeader } from "@/src/components/layout/AppScreenHeader";
import {
    AppButton,
    AppCard,
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { strings } from "@/src/constants/strings";
import type { AcademicProfileId } from "@/src/domain/types";
import {
  ACADEMIC_CALCULATION_PROFILES,
  MAX_GRADE,
  MIN_GRADE,
} from "@/src/domain/rules";
import { parseAcademicNumber } from "@/src/domain/utils/parseAcademicNumber";
import {
    createSubject,
  getDefaultAcademicProfileId,
    getSubjects,
} from "@/src/features/subjects/services/subjectService";
import { spacing, useAppTheme } from "@/src/theme";
import {
    assignSubjectColor,
    getSubjectColorById,
    SUBJECT_COLORS,
} from "@/src/theme/subjectColors";

export default function CreateSubjectScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [subjectName, setSubjectName] = useState("");
  const [passingGrade, setPassingGrade] = useState("4.0");
  const [selectedColorId, setSelectedColorId] = useState(SUBJECT_COLORS[0].id);
  const [selectedAcademicProfileId, setSelectedAcademicProfileId] =
    useState<AcademicProfileId>("weighted_general");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [passingGradeError, setPassingGradeError] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const initDefaultColor = async () => {
      const [subjects, defaultAcademicProfileId] = await Promise.all([
        getSubjects(),
        getDefaultAcademicProfileId(),
      ]);
      const usedColorValues = subjects.map((s) => s.color);
      const defaultColor = assignSubjectColor(usedColorValues);
      setSelectedColorId(defaultColor.id);
      setSelectedAcademicProfileId(defaultAcademicProfileId);
    };
    void initDefaultColor();
  }, []);

  const selectedColor = getSubjectColorById(selectedColorId);
  const selectedAcademicProfileLabel =
    ACADEMIC_CALCULATION_PROFILES[selectedAcademicProfileId].name;

  const handleSave = async () => {
    const normalizedName = subjectName.trim();
    const parsedMinimumGrade = parseAcademicNumber(passingGrade);

    let hasError = false;

    if (!normalizedName) {
      setNameError(strings.createSubject.nameRequired);
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (
      parsedMinimumGrade === null ||
      parsedMinimumGrade < MIN_GRADE ||
      parsedMinimumGrade > MAX_GRADE
    ) {
      setPassingGradeError(
        strings.createSubject.gradeRangeError(MIN_GRADE, MAX_GRADE),
      );
      hasError = true;
    } else {
      setPassingGradeError(undefined);
    }

    if (hasError) {
      setSaveMessage(null);
      return;
    }

    try {
      await createSubject({
        name: normalizedName,
        minimumGrade: parsedMinimumGrade!,
        color: selectedColor.background,
        academicProfileId: selectedAcademicProfileId,
      });

      setSaveMessage(strings.createSubject.savedMessage);
      router.back();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : strings.createSubject.saveFailedMessage;
      setSaveMessage(errorMessage);
    }
  };

  return (
    <AppScreen
      scrollable
      stickyHeader={<AppScreenHeader backLabel="Ramos" />}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">{strings.createSubject.headerTitle}</AppText>
          <AppText tone="secondary">
            {strings.createSubject.headerDescription}
          </AppText>
        </View>

        <AppCard title={strings.createSubject.subjectDataTitle}>
          <AppInput
            label={strings.createSubject.subjectNameLabel}
            value={subjectName}
            onChangeText={setSubjectName}
            placeholder={strings.createSubject.subjectNamePlaceholder}
            error={nameError}
          />

          <AppInput
            label={strings.createSubject.passingGradeLabel}
            value={passingGrade}
            onChangeText={setPassingGrade}
            placeholder={strings.createSubject.passingGradePlaceholder}
            keyboardType="decimal-pad"
            error={passingGradeError}
          />

          <View
            style={[
              styles.academicSystemSection,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <AppText variant="caption" tone="secondary">
              {strings.createSubject.academicSystemTitle}
            </AppText>
            <AppText variant="h3">{selectedAcademicProfileLabel}</AppText>
            <AppText variant="caption" tone="secondary">
              {strings.createSubject.academicSystemDescription}
            </AppText>
          </View>

          <View style={styles.colorSection}>
            <AppText variant="caption">
              {strings.createSubject.colorIdentifier}
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
                  { backgroundColor: selectedColor.background },
                ]}
              />
              <AppText variant="caption" tone="secondary">
                {selectedColor.name}
              </AppText>
            </View>
          </View>
        </AppCard>

        <AppCard
          title={strings.createSubject.whyCreateTitle}
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText tone="secondary">
            {strings.createSubject.whyCreateDescription}
          </AppText>
        </AppCard>

        {saveMessage ? (
          <AppCard style={{ backgroundColor: theme.surfaceElevated }}>
            <AppText tone="info">{saveMessage}</AppText>
          </AppCard>
        ) : null}

        <View style={styles.actionsRow}>
          <AppButton
            label={strings.createSubject.saveSubject}
            style={styles.actionButton}
            onPress={handleSave}
          />
          <AppButton
            label={strings.common.cancel}
            variant="outline"
            style={styles.actionButton}
            onPress={() => router.back()}
          />
        </View>
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
  academicSystemSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
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
});

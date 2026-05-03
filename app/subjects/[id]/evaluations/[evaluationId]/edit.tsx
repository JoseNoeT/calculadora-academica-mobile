import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

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
    getEvaluationById,
    updateEvaluation,
} from "@/src/features/subjects/services/evaluationService";
import { spacing } from "@/src/theme";

export default function EditEvaluationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; evaluationId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [grade, setGrade] = useState("");

  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [weightError, setWeightError] = useState<string | undefined>(undefined);
  const [gradeError, setGradeError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const loadEvaluation = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const evaluation = await getEvaluationById(params.evaluationId);

        if (!isMounted) {
          return;
        }

        if (!evaluation || evaluation.subjectId !== params.id) {
          setLoadError(strings.editEvaluation.missingEvaluation);
          setIsLoading(false);
          return;
        }

        setName(evaluation.name);
        setWeight(evaluation.weight.toFixed(2));
        setGrade(
          typeof evaluation.grade === "number"
            ? evaluation.grade.toFixed(1)
            : "",
        );
        setIsLoading(false);
      } catch {
        if (!isMounted) {
          return;
        }
        setLoadError(strings.editEvaluation.loadFailed);
        setIsLoading(false);
      }
    };

    void loadEvaluation();

    return () => {
      isMounted = false;
    };
  }, [params.evaluationId, params.id]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const parsedWeight = parseAcademicNumber(weight);
    const parsedGrade = grade.trim() ? parseAcademicNumber(grade) : null;

    let hasError = false;

    if (!trimmedName) {
      setNameError(strings.editEvaluation.nameRequired);
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (parsedWeight === null || parsedWeight < 0 || parsedWeight > 100) {
      setWeightError(strings.editEvaluation.weightRangeError);
      hasError = true;
    } else {
      setWeightError(undefined);
    }

    if (
      grade.trim() &&
      (parsedGrade === null ||
        parsedGrade < MIN_GRADE ||
        parsedGrade > MAX_GRADE)
    ) {
      setGradeError(
        strings.editEvaluation.gradeRangeError(MIN_GRADE, MAX_GRADE),
      );
      hasError = true;
    } else {
      setGradeError(undefined);
    }

    if (hasError) {
      setSaveError(null);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      await updateEvaluation(params.evaluationId, {
        name: trimmedName,
        weight: parsedWeight!,
        grade: parsedGrade,
      });

      router.back();
    } catch (error) {
      setIsSaving(false);
      setSaveError(
        error instanceof Error
          ? error.message
          : strings.editEvaluation.saveFailed,
      );
    }
  };

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: strings.editEvaluation.stackTitle }} />
      <View style={styles.container}>
        {isLoading ? (
          <AppCard title={strings.editEvaluation.loadingTitle}>
            <AppText tone="secondary">
              {strings.editEvaluation.waitMessage}
            </AppText>
          </AppCard>
        ) : loadError ? (
          <AppCard title={strings.editEvaluation.unavailableTitle}>
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
                {strings.editEvaluation.headerTitle}
              </AppText>
              <AppText tone="secondary">
                {strings.editEvaluation.headerDescription}
              </AppText>
            </View>

            <AppCard title={strings.editEvaluation.dataTitle}>
              <AppInput
                label={strings.editEvaluation.nameLabel}
                value={name}
                onChangeText={setName}
                placeholder={strings.editEvaluation.namePlaceholder}
                error={nameError}
              />

              <AppInput
                label={strings.editEvaluation.weightLabel}
                value={weight}
                onChangeText={setWeight}
                placeholder={strings.editEvaluation.weightPlaceholder}
                keyboardType="decimal-pad"
                error={weightError}
              />

              <AppInput
                label={strings.editEvaluation.gradeLabel}
                value={grade}
                onChangeText={setGrade}
                placeholder=""
                keyboardType="decimal-pad"
                error={gradeError}
              />
            </AppCard>

            {saveError ? (
              <AppCard>
                <AppText tone="danger">{saveError}</AppText>
              </AppCard>
            ) : null}

            <View style={styles.actionsRow}>
              <AppButton
                label={
                  isSaving
                    ? strings.editEvaluation.saving
                    : strings.editEvaluation.saveChanges
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

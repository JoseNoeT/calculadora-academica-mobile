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
import { addEvaluation } from "@/src/features/subjects/services/evaluationService";
import { getSubjects } from "@/src/features/subjects/services/subjectService";
import { spacing } from "@/src/theme";

export default function CreateEvaluationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const [subjectMinimumGrade, setSubjectMinimumGrade] = useState(MIN_GRADE);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [grade, setGrade] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [weightError, setWeightError] = useState<string | undefined>();
  const [gradeError, setGradeError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void getSubjects().then((subjects) => {
      const found = subjects.find((s) => s.id === params.id);
      if (isMounted && found) setSubjectMinimumGrade(found.minimumGrade);
    });
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const parsedWeight = parseAcademicNumber(weight);
    const parsedGrade = grade.trim() ? parseAcademicNumber(grade) : null;

    let hasError = false;

    if (!trimmedName) {
      setNameError(strings.createEvaluation.nameRequired);
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (parsedWeight === null || parsedWeight <= 0 || parsedWeight > 100) {
      setWeightError(strings.createEvaluation.weightRangeError);
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
        strings.createEvaluation.gradeRangeError(MIN_GRADE, MAX_GRADE),
      );
      hasError = true;
    } else {
      setGradeError(undefined);
    }

    if (hasError) return;

    setSaving(true);
    try {
      await addEvaluation({
        subjectId: params.id,
        name: trimmedName,
        weight: parsedWeight!,
        grade: parsedGrade,
        minimumGrade: subjectMinimumGrade,
      });
      router.back();
    } catch {
      setSaving(false);
    }
  };

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: strings.createEvaluation.stackTitle }} />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">
            {strings.createEvaluation.headerTitle}
          </AppText>
          <AppText tone="secondary">
            {strings.createEvaluation.headerDescription}
          </AppText>
        </View>

        <AppCard title={strings.createEvaluation.dataTitle}>
          <AppInput
            label={strings.createEvaluation.nameLabel}
            value={name}
            onChangeText={setName}
            placeholder={strings.createEvaluation.namePlaceholder}
            error={nameError}
          />

          <AppInput
            label={strings.createEvaluation.weightLabel}
            value={weight}
            onChangeText={setWeight}
            placeholder={strings.createEvaluation.weightPlaceholder}
            keyboardType="decimal-pad"
            error={weightError}
          />

          <AppInput
            label={strings.createEvaluation.gradeLabel}
            value={grade}
            onChangeText={setGrade}
            placeholder=""
            keyboardType="decimal-pad"
            error={gradeError}
          />
        </AppCard>

        <AppCard
          title={strings.createEvaluation.pendingTitle}
          style={{ backgroundColor: undefined }}
        >
          <AppText tone="secondary">
            {strings.createEvaluation.pendingDescription}
          </AppText>
        </AppCard>

        <View style={styles.actionsRow}>
          <AppButton
            label={
              saving
                ? strings.createEvaluation.saving
                : strings.createEvaluation.saveEvaluation
            }
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
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
});

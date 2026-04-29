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
import { MAX_GRADE, MIN_GRADE } from "@/src/domain/rules";
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

  const parseDecimal = (value: string): number | null => {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const parsedWeight = parseDecimal(weight);
    const parsedGrade = grade.trim() ? parseDecimal(grade) : null;

    let hasError = false;

    if (!trimmedName) {
      setNameError("El nombre de la evaluación es obligatorio.");
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (parsedWeight === null || parsedWeight <= 0 || parsedWeight > 100) {
      setWeightError("La ponderación debe estar entre 1 y 100.");
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
      setGradeError(`La nota debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`);
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
      <Stack.Screen options={{ title: "Agregar evaluación" }} />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Agregar evaluación</AppText>
          <AppText tone="secondary">
            Registra una evaluación para este ramo. La nota puede quedar
            pendiente si aún no la tienes.
          </AppText>
        </View>

        <AppCard title="Datos de la evaluación">
          <AppInput
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ej: Prueba 1"
            error={nameError}
          />

          <AppInput
            label="Ponderación (%)"
            value={weight}
            onChangeText={setWeight}
            placeholder="Ej: 30"
            keyboardType="decimal-pad"
            error={weightError}
          />

          <AppInput
            label="Nota (dejar vacío si es pendiente)"
            value={grade}
            onChangeText={setGrade}
            placeholder=""
            keyboardType="decimal-pad"
            error={gradeError}
          />
        </AppCard>

        <AppCard
          title="¿La nota es pendiente?"
          style={{ backgroundColor: undefined }}
        >
          <AppText tone="secondary">
            Si aún no tienes la nota, deja el campo vacío. Podrás editarla
            después desde el detalle del ramo.
          </AppText>
        </AppCard>

        <View style={styles.actionsRow}>
          <AppButton
            label={saving ? "Guardando…" : "Guardar evaluación"}
            style={styles.actionButton}
            onPress={handleSave}
          />
          <AppButton
            label="Cancelar"
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

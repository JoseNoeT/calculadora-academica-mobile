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
          setLoadError("La evaluación no existe o no pertenece a este ramo.");
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
        setLoadError("No se pudo cargar la evaluación.");
        setIsLoading(false);
      }
    };

    void loadEvaluation();

    return () => {
      isMounted = false;
    };
  }, [params.evaluationId, params.id]);

  const parseDecimal = (value: string): number | null => {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) {
      return null;
    }
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

    if (parsedWeight === null || parsedWeight < 0 || parsedWeight > 100) {
      setWeightError("La ponderación debe estar entre 0 y 100.");
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
          : "No se pudo guardar los cambios de la evaluación.",
      );
    }
  };

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: "Editar evaluación" }} />
      <View style={styles.container}>
        {isLoading ? (
          <AppCard title="Cargando evaluación...">
            <AppText tone="secondary">Espera un momento.</AppText>
          </AppCard>
        ) : loadError ? (
          <AppCard title="No disponible">
            <AppText tone="secondary">{loadError}</AppText>
            <AppButton
              label="Volver"
              variant="outline"
              style={styles.backButton}
              onPress={() => router.back()}
            />
          </AppCard>
        ) : (
          <>
            <View style={styles.headerSection}>
              <AppText variant="title">Editar evaluación</AppText>
              <AppText tone="secondary">
                Actualiza nombre, nota y ponderación para este ramo.
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
                label="Nota (vacía = pendiente)"
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
                label={isSaving ? "Guardando..." : "Guardar cambios"}
                style={styles.actionButton}
                onPress={() => void handleSave()}
              />
              <AppButton
                label="Cancelar"
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

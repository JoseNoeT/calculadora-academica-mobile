import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
    AppButton,
    AppCard,
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { MAX_GRADE, MIN_GRADE } from "@/src/domain/rules";
import {
    getSubjectById,
    updateSubject,
} from "@/src/features/subjects/services/subjectService";
import { spacing, useAppTheme } from "@/src/theme";

type SubjectColorOption = {
  id: string;
  name: string;
  value: string;
};

const COLOR_OPTIONS: SubjectColorOption[] = [
  { id: "blue", name: "Azul", value: "#2563EB" },
  { id: "cyan", name: "Cian", value: "#06B6D4" },
  { id: "emerald", name: "Verde", value: "#10B981" },
  { id: "amber", name: "Amarillo", value: "#F59E0B" },
  { id: "rose", name: "Rosado", value: "#F43F5E" },
];

export default function EditSubjectScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subjectName, setSubjectName] = useState("");
  const [minimumGradeInput, setMinimumGradeInput] = useState("");
  const [selectedColorValue, setSelectedColorValue] = useState(
    COLOR_OPTIONS[0].value,
  );

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
          setLoadError("El ramo no existe o fue eliminado.");
          setIsLoading(false);
          return;
        }

        setSubjectName(subject.name);
        setMinimumGradeInput(subject.minimumGrade.toFixed(1));
        setSelectedColorValue(subject.color);
        setIsLoading(false);
      } catch {
        if (!isMounted) {
          return;
        }
        setLoadError("No se pudo cargar el ramo.");
        setIsLoading(false);
      }
    };

    void loadSubject();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const selectedColorId = useMemo(() => {
    return COLOR_OPTIONS.find((option) => option.value === selectedColorValue)
      ?.id;
  }, [selectedColorValue]);

  const handleSave = async () => {
    const normalizedName = subjectName.trim();
    const parsedMinimumGrade = Number(
      minimumGradeInput.replace(",", ".").trim(),
    );

    let hasError = false;

    if (!normalizedName) {
      setNameError("El nombre del ramo es obligatorio.");
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (
      Number.isNaN(parsedMinimumGrade) ||
      parsedMinimumGrade < MIN_GRADE ||
      parsedMinimumGrade > MAX_GRADE
    ) {
      setMinimumGradeError(
        `La nota mínima debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`,
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
        minimumGrade: parsedMinimumGrade,
        color: selectedColorValue,
      });

      router.back();
    } catch (error) {
      setIsSaving(false);
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar los cambios.",
      );
    }
  };

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: "Editar ramo" }} />
      <View style={styles.container}>
        {isLoading ? (
          <AppCard title="Cargando ramo...">
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
              <AppText variant="title">Editar ramo</AppText>
              <AppText tone="secondary">
                Actualiza el nombre, nota mínima y color del ramo.
              </AppText>
            </View>

            <AppCard title="Datos del ramo">
              <AppInput
                label="Nombre del ramo"
                value={subjectName}
                onChangeText={setSubjectName}
                placeholder="Ej: Matemáticas I"
                error={nameError}
              />

              <AppInput
                label="Nota mínima de aprobación"
                value={minimumGradeInput}
                onChangeText={setMinimumGradeInput}
                placeholder="4.0"
                keyboardType="decimal-pad"
                error={minimumGradeError}
              />

              <View style={styles.colorSection}>
                <AppText variant="caption">
                  Color identificador del ramo
                </AppText>
                <View style={styles.colorRow}>
                  {COLOR_OPTIONS.map((option) => {
                    const isSelected = option.id === selectedColorId;

                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => setSelectedColorValue(option.value)}
                        style={[
                          styles.colorOption,
                          {
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                            backgroundColor: theme.surface,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: option.value },
                          ]}
                        />
                        <AppText
                          variant="caption"
                          tone={isSelected ? "primary" : "secondary"}
                        >
                          {option.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
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
  colorSection: {
    gap: spacing.sm,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorOption: {
    minWidth: 88,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  colorDot: {
    width: 16,
    height: 16,
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

import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
    AppButton,
    AppCard,
    AppInput,
    AppScreen,
    AppText,
} from "@/src/components/ui";
import { MAX_GRADE, MIN_GRADE } from "@/src/domain/rules";
import { createSubject } from "@/src/features/subjects/services/subjectService";
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

export default function CreateSubjectScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [subjectName, setSubjectName] = useState("");
  const [passingGrade, setPassingGrade] = useState("4.0");
  const [selectedColorId, setSelectedColorId] = useState("blue");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [passingGradeError, setPassingGradeError] = useState<
    string | undefined
  >(undefined);

  const selectedColor =
    COLOR_OPTIONS.find((option) => option.id === selectedColorId) ??
    COLOR_OPTIONS[0];

  const handleSave = async () => {
    const normalizedName = subjectName.trim();
    const parsedMinimumGrade = Number(passingGrade.replace(",", ".").trim());

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
      setPassingGradeError(
        `La nota mínima debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`,
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
        minimumGrade: parsedMinimumGrade,
        color: selectedColor.value,
      });

      setSaveMessage("Ramo guardado localmente en el dispositivo.");
      router.back();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el ramo localmente.";
      setSaveMessage(errorMessage);
    }
  };

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <AppText variant="title">Agregar ramo</AppText>
          <AppText tone="secondary">
            Configura una asignatura para controlar tus notas durante el
            semestre.
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
            value={passingGrade}
            onChangeText={setPassingGrade}
            placeholder="4.0"
            keyboardType="decimal-pad"
            error={passingGradeError}
          />

          <View style={styles.colorSection}>
            <AppText variant="caption">Color identificador del ramo</AppText>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((option) => {
                const isSelected = option.id === selectedColorId;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedColorId(option.id)}
                    style={[
                      styles.colorOption,
                      {
                        borderColor: isSelected ? theme.primary : theme.border,
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

        <AppCard
          title="¿Por qué crear un ramo?"
          style={{ backgroundColor: theme.surfaceElevated }}
        >
          <AppText tone="secondary">
            Al crear un ramo podrás agregar evaluaciones, registrar notas
            pendientes, revisar tu avance y calcular la nota necesaria para
            aprobar.
          </AppText>
        </AppCard>

        {saveMessage ? (
          <AppCard style={{ backgroundColor: theme.surfaceElevated }}>
            <AppText tone="info">{saveMessage}</AppText>
          </AppCard>
        ) : null}

        <View style={styles.actionsRow}>
          <AppButton
            label="Guardar ramo"
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
});

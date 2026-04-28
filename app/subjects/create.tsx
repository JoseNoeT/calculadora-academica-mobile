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

  const handleSave = () => {
    // TODO: conectar guardado real cuando exista persistencia local en una fase posterior.
    setSaveMessage("La persistencia se agregará en la siguiente fase.");
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
          />

          <AppInput
            label="Nota mínima de aprobación"
            value={passingGrade}
            onChangeText={setPassingGrade}
            placeholder="4.0"
            keyboardType="decimal-pad"
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

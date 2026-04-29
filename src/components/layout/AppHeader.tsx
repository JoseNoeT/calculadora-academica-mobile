import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  hideSettingsAction?: boolean;
};

function resolveHeaderCopy(pathname: string): {
  title: string;
  subtitle: string;
} {
  if (pathname === "/") {
    return {
      title: "Inicio",
      subtitle: "Tu avance academico en claro",
    };
  }

  if (pathname === "/subjects") {
    return {
      title: "Mis ramos",
      subtitle: "Organiza y sigue tu progreso",
    };
  }

  if (pathname === "/calculator/quick") {
    return {
      title: "Calculadora",
      subtitle: "Calculo rapido y preciso",
    };
  }

  if (/^\/subjects\/[^/]+$/.test(pathname)) {
    return {
      title: "Detalle del ramo",
      subtitle: "Metricas y evaluaciones del ramo",
    };
  }

  if (pathname === "/simulator") {
    return {
      title: "Simulador",
      subtitle: "Proyecciones sin alterar tus datos",
    };
  }

  if (pathname === "/settings") {
    return {
      title: "Configuracion",
      subtitle: "Personaliza tu experiencia",
    };
  }

  return {
    title: "Academica",
    subtitle: "Tu avance academico en claro",
  };
}

export function AppHeader({
  title,
  subtitle,
  hideSettingsAction = false,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useAppTheme();

  const autoCopy = resolveHeaderCopy(pathname);
  const resolvedTitle = title ?? autoCopy.title;
  const resolvedSubtitle = subtitle ?? autoCopy.subtitle;

  const isSettingsRoute = pathname === "/settings";
  const shouldShowSettingsAction = !hideSettingsAction && !isSettingsRoute;

  const headerBackground =
    theme.mode === "dark" ? "rgba(30, 41, 59, 0.98)" : theme.surface;
  const headerBorder =
    theme.mode === "dark"
      ? "rgba(148, 163, 184, 0.4)"
      : "rgba(100, 116, 139, 0.22)";
  const iconSurface =
    theme.mode === "dark" ? "rgba(15, 23, 42, 1)" : theme.surfaceElevated;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: headerBackground,
          borderColor: headerBorder,
          shadowOpacity: theme.mode === "dark" ? 0.2 : 0.08,
          elevation: theme.mode === "dark" ? 4 : 2,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoBubble,
              {
                backgroundColor: iconSurface,
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(148,163,184,0.26)"
                    : "rgba(100,116,139,0.2)",
              },
            ]}
          >
            <AppText style={styles.logoIcon}>🎓</AppText>
          </View>

          <View style={styles.textStack}>
            <AppText
              variant="h2"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[styles.brandName, { color: theme.textPrimary }]}
            >
              {resolvedTitle}
            </AppText>
            <AppText
              variant="caption"
              style={[styles.brandSubtitle, { color: theme.textPrimary }]}
              numberOfLines={2}
            >
              {resolvedSubtitle}
            </AppText>
          </View>
        </View>

        {shouldShowSettingsAction ? (
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [
              styles.actionButton,
              {
                borderColor: theme.border,
                backgroundColor: iconSurface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <AppText style={[styles.actionIcon, { color: theme.textPrimary }]}>
              ⚙️
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    minHeight: 88,
    justifyContent: "center",
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  logoBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  textStack: {
    flex: 1,
    paddingTop: 0,
    gap: 1,
  },
  brandName: {
    marginRight: spacing.xs,
    fontFamily: "Syne_800ExtraBold",
    fontSize: 22,
    lineHeight: 29,
    letterSpacing: 0.1,
    transform: [{ scaleX: 0.93 }],
  },
  brandSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13.5,
    lineHeight: 19,
    opacity: 0.74,
    transform: [{ scaleX: 0.95 }],
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
});

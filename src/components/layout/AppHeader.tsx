import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components/ui";
import { spacing, useAppTheme } from "@/src/theme";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  hideSettingsAction?: boolean;
  compact?: boolean;
};

function resolveHeaderCopy(pathname: string): {
  title: string;
  subtitle: string;
} {
  if (pathname === "/" || pathname.endsWith("/index")) {
    return {
      title: "Inicio",
      subtitle: "Tu avance académico",
    };
  }

  if (pathname.endsWith("/calculator/quick")) {
    return {
      title: "Calculadora",
      subtitle: "Calcula tu escenario",
    };
  }

  if (/\/subjects\/[^/]+$/.test(pathname)) {
    return {
      title: "Detalle del ramo",
      subtitle: "Métricas y evaluaciones del ramo",
    };
  }

  if (pathname.endsWith("/subjects")) {
    return {
      title: "Ramos",
      subtitle: "Tus asignaturas",
    };
  }

  if (pathname.endsWith("/simulator")) {
    return {
      title: "Simulador",
      subtitle: "Proyecciones académicas",
    };
  }

  if (pathname.endsWith("/settings")) {
    return {
      title: "Configuración",
      subtitle: "Ajustes de la app",
    };
  }

  return {
    title: "Académica",
    subtitle: "Tu avance académico",
  };
}

export function AppHeader({
  title,
  subtitle,
  hideSettingsAction = false,
  compact = false,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useAppTheme();

  const autoCopy = resolveHeaderCopy(pathname);
  const resolvedTitle = title ?? autoCopy.title;
  const resolvedSubtitle = subtitle ?? autoCopy.subtitle;

  const isSettingsRoute = pathname === "/settings";
  const shouldShowSettingsAction = !hideSettingsAction && !isSettingsRoute;

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
        compact && styles.containerCompact,
        {
          backgroundColor: theme.background,
          borderColor: headerBorder,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoBubble,
              compact && styles.logoBubbleCompact,
              {
                backgroundColor: iconSurface,
                borderColor:
                  theme.mode === "dark"
                    ? "rgba(148,163,184,0.26)"
                    : "rgba(100,116,139,0.2)",
              },
            ]}
          >
            <AppText style={[styles.logoIcon, compact && styles.logoIconCompact]}>
              🎓
            </AppText>
          </View>

          <View style={styles.textStack}>
            <AppText
              variant="navTitle"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[
                styles.brandName,
                compact && styles.brandNameCompact,
                { color: theme.textPrimary },
              ]}
            >
              {resolvedTitle}
            </AppText>
            {!compact && (
              <AppText
                variant="navSubtitle"
                style={[styles.brandSubtitle, { color: theme.textPrimary }]}
                numberOfLines={2}
              >
                {resolvedSubtitle}
              </AppText>
            )}
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
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    minHeight: 68,
    justifyContent: "center",
  },
  containerCompact: {
    borderRadius: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
    minHeight: 54,
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
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBubbleCompact: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  logoIcon: {
    fontSize: 19,
    lineHeight: 22,
  },
  logoIconCompact: {
    fontSize: 17,
    lineHeight: 20,
  },
  textStack: {
    flex: 1,
    paddingTop: 0,
    gap: 1,
  },
  brandName: {
    marginRight: spacing.xs,
    transform: [{ scaleX: 1 }],
  },
  brandNameCompact: {},
  brandSubtitle: {
    opacity: 0.58,
    transform: [{ scaleX: 1 }],
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
});

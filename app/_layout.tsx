import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
} from "@expo-google-fonts/syne";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { AnimatedSplash } from "@/src/components/splash/AnimatedSplash";
import { strings } from "@/src/constants/strings";
import { ThemeProvider as AppThemeProvider, useAppTheme } from "@/src/theme";

// Prevent the native splash from auto-hiding before fonts + theme are ready.
SplashScreen.preventAutoHideAsync();
// Configure native splash transition (only applies in production builds, not Expo Go).
SplashScreen.setOptions({ duration: 800, fade: true });

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { theme } = useAppTheme();
  const [splashDone, setSplashDone] = useState(false);
  const navigationTheme = theme.mode === "dark" ? DarkTheme : DefaultTheme;

  // Hide the native splash as soon as fonts are ready — our AnimatedSplash
  // overlay takes over seamlessly so there is no blank frame.
  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Always render the Stack so Expo Router can initialise navigation.
  // The splash is an absolute overlay that sits on top until it finishes.
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="subjects/create"
          options={{ title: strings.createSubject.headerTitle }}
        />
        <Stack.Screen
          name="subjects/[id]/index"
          options={{ title: strings.subjectDetail.stackTitle }}
        />
        <Stack.Screen
          name="subjects/[id]/create-evaluation"
          options={{ title: strings.createEvaluation.stackTitle }}
        />
        <Stack.Screen
          name="subjects/[id]/evaluations/[evaluationId]/edit"
          options={{ title: strings.editEvaluation.stackTitle }}
        />
        <Stack.Screen
          name="subjects/[id]/edit"
          options={{ title: strings.editSubject.stackTitle }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: strings.modal.title }}
        />
      </Stack>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />

      {/* Splash overlay — covers the navigation until ready */}
      {!splashDone ? (
        <View style={[StyleSheet.absoluteFill, styles.splashOverlay]}>
          {fontsLoaded ? (
            <AnimatedSplash onFinished={() => setSplashDone(true)} />
          ) : (
            // Solid background while fonts load — matches the native splash colour
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.background },
              ]}
            />
          )}
        </View>
      ) : null}
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    zIndex: 999,
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AppContent fontsLoaded={fontsLoaded} />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

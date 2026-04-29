import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useColorScheme } from "react-native";

import {
    getThemePreference,
    saveThemePreference,
} from "../storage/settingsStorage";
import { darkTheme } from "./themes/darkTheme";
import { lightTheme } from "./themes/lightTheme";
import type { AppTheme } from "./themes/theme.types";

export type ThemeName = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeName;
  setThemeName: (themeName: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>("system");

  useEffect(() => {
    let isMounted = true;

    const hydrateThemePreference = async () => {
      const storedPreference = await getThemePreference();

      if (!isMounted || !storedPreference) {
        return;
      }

      setThemeName(storedPreference);
    };

    void hydrateThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetThemeName = useCallback((nextThemeName: ThemeName) => {
    setThemeName(nextThemeName);
    void saveThemePreference(nextThemeName);
  }, []);

  const resolvedMode =
    themeName === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeName;

  const theme: AppTheme = resolvedMode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      themeName,
      setThemeName: handleSetThemeName,
    }),
    [handleSetThemeName, theme, themeName],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

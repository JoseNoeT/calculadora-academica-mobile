import React, { createContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { darkTheme } from "./themes/darkTheme";
import { lightTheme } from "./themes/lightTheme";

export type ThemeName = "light" | "dark" | "system";

export type AppTheme = typeof lightTheme;

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

  const resolvedMode =
    themeName === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeName;

  const theme = resolvedMode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      themeName,
      setThemeName,
    }),
    [theme, themeName],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

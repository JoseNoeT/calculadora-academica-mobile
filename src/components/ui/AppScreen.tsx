import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { spacing, useAppTheme } from "../../theme";

type AppScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  scrollable?: boolean;
};

export function AppScreen({
  children,
  style,
  padded = true,
  scrollable = false,
}: AppScreenProps) {
  const { theme } = useAppTheme();

  const content = (
    <SafeAreaView
      style={[
        styles.base,
        { backgroundColor: theme.background },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );

  if (!scrollable) {
    return content;
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.scrollContent}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  padded: {
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

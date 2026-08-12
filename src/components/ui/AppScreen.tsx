import React from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { spacing, useAppTheme } from "../../theme";

type AppScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  scrollable?: boolean;
  stickyHeader?: React.ReactNode;
};

export function AppScreen({
  children,
  style,
  padded = true,
  scrollable = false,
  stickyHeader,
}: AppScreenProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const stickyContentBottom = Math.max(80, insets.bottom + 72);

  if (scrollable && stickyHeader) {
    return (
      <SafeAreaView
        edges={["left", "right"]}
        style={[styles.base, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.stickyHeaderZone,
            { paddingTop: insets.top + spacing.xs },
          ]}
        >
          {stickyHeader}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.stickyScrollContent,
            { paddingBottom: stickyContentBottom },
            style,
          ]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const content = (
    <SafeAreaView
      edges={["top", "left", "right"]}
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
      showsVerticalScrollIndicator={false}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stickyHeaderZone: {
    paddingHorizontal: spacing.lg,
  },
  stickyScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

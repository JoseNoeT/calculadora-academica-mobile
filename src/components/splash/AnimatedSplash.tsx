import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

import { AppText } from "@/src/components/ui";
import { useAppTheme } from "@/src/theme";

type AnimatedSplashProps = {
  onFinished: () => void;
};

// Timings
const FADE_IN_MS = 350;
const PROGRESS_DELAY_MS = 200;
const PROGRESS_MS = 1100;
// Total before calling onFinished (allow a brief hold after bar completes)
const TOTAL_MS = FADE_IN_MS + PROGRESS_DELAY_MS + PROGRESS_MS + 200;

export function AnimatedSplash({ onFinished }: AnimatedSplashProps) {
  const { theme } = useAppTheme();

  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);
  // Shared value so useAnimatedStyle worklet can read it without JS bridge
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.quad),
    });

    progress.value = withDelay(
      PROGRESS_DELAY_MS,
      withTiming(1, {
        duration: PROGRESS_MS,
        easing: Easing.inOut(Easing.ease),
      }),
    );

    const timer = setTimeout(onFinished, TOTAL_MS);
    return () => clearTimeout(timer);
    // onFinished is stable (set in state, same reference); disable exhaustive-deps intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * trackWidth.value,
  }));

  return (
    <Animated.View
      style={[styles.root, wrapperStyle, { backgroundColor: theme.background }]}
    >
      {/* Subtle radial-ish gradient from top */}
      <LinearGradient
        colors={[theme.primary + "18", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.content}>
        {/* Logo bubble */}
        <View
          style={[
            styles.logoBubble,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <AppText style={styles.logoEmoji}>🎓</AppText>
          </LinearGradient>
        </View>

        {/* App name */}
        <AppText style={[styles.title, { color: theme.primary }]}>
          Académica
        </AppText>

        {/* Subtitle */}
        <AppText tone="secondary" align="center" style={styles.subtitle}>
          Preparando tu avance académico
        </AppText>

        {/* Orange accent dot */}
        <View style={[styles.accentDot, { backgroundColor: theme.warning }]} />

        {/* Progress track */}
        <View
          style={[styles.progressTrack, { backgroundColor: theme.border }]}
          onLayout={(e) => {
            trackWidth.value = e.nativeEvent.layout.width;
          }}
        >
          <Animated.View style={[styles.progressFill, fillStyle]}>
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
    width: "80%",
    maxWidth: 320,
  },
  logoBubble: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 42,
    lineHeight: 52,
  },
  title: {
    fontFamily: "Syne_700Bold",
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    lineHeight: 22,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
});

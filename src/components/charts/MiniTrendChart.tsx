import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/src/theme";

type MiniTrendChartProps = {
  points: number[];
  height?: number;
  duration?: number;
};

export function MiniTrendChart({
  points,
  height = 52,
  duration = 800,
}: MiniTrendChartProps) {
  const { theme } = useAppTheme();
  const safePoints = useMemo(
    () => points.map((point) => Math.max(0, Math.min(100, point))),
    [points],
  );
  const animatedValuesRef = useRef<Animated.Value[]>([]);

  // Keep one Animated.Value per point available before render.
  if (animatedValuesRef.current.length !== safePoints.length) {
    animatedValuesRef.current = safePoints.map(
      (_, index) => animatedValuesRef.current[index] ?? new Animated.Value(0),
    );
  }

  useEffect(() => {
    if (safePoints.length === 0) {
      return;
    }

    const animations = safePoints.map((point, index) =>
      Animated.timing(animatedValuesRef.current[index], {
        toValue: point,
        duration,
        delay: index * 70,
        useNativeDriver: false,
      }),
    );

    Animated.parallel(animations).start();
  }, [duration, safePoints]);

  if (safePoints.length === 0) {
    return null;
  }

  return (
    <View style={[styles.row, { height }]}>
      {safePoints.map((_, index) => {
        const barHeight = animatedValuesRef.current[index].interpolate({
          inputRange: [0, 100],
          outputRange: [4, height],
        });

        return (
          <View key={`${index}-${safePoints[index]}`} style={styles.barCol}>
            <Animated.View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor:
                    index % 3 === 2
                      ? theme.warning
                      : index % 2 === 0
                        ? theme.primary
                        : theme.secondary,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    width: "100%",
  },
  barCol: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  bar: {
    borderRadius: 6,
    minHeight: 4,
  },
});

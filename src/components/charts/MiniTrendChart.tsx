import { useEffect, useRef } from "react";
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
  const safePoints = points.length > 0 ? points : [10, 18, 24, 30, 22];
  const animatedValues = useRef(
    safePoints.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = safePoints.map((point, index) =>
      Animated.timing(animatedValues[index], {
        toValue: Math.max(0, Math.min(100, point)),
        duration,
        delay: index * 70,
        useNativeDriver: false,
      }),
    );

    Animated.parallel(animations).start();
  }, [animatedValues, duration, safePoints]);

  return (
    <View style={[styles.row, { height }]}>
      {safePoints.map((_, index) => {
        const barHeight = animatedValues[index].interpolate({
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

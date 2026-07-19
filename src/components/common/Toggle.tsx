import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#E2E8F0", "#6366F1"],
    ),
    shadowColor: "#6366F1",
    shadowOpacity: progress.value * 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: progress.value * 4,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 18 }],
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={[
          {
            width: 44,
            height: 26,
            borderRadius: 13,
            padding: 3,
            justifyContent: "center",
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "white",
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

import { EASE_STANDARD } from "@/src/constants/motion";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function usePressScale(targetScale: number) {
  const reduced = useReducedMotion();
  const pressScale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const onPressIn = () => {
    pressScale.value = reduced
      ? targetScale
      : withTiming(targetScale, { duration: 130, easing: EASE_STANDARD });
  };

  const onPressOut = () => {
    pressScale.value = reduced
      ? 1
      : withTiming(1, { duration: 240, easing: EASE_STANDARD });
  };

  return { style, onPressIn, onPressOut };
}

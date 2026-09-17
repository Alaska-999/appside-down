import {
  EASE_STANDARD,
  FINISH_BLOOM_SCALE,
  FINISH_INTRO_MS,
  FINISH_RISE,
} from "@/src/constants/motion";
import { ReactNode, useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type StaggerVariant = "rise" | "bloom";

interface StaggerInProps {
  delay?: number;
  variant?: StaggerVariant;
  children: ReactNode;
  style?: ViewStyle;
}

export function StaggerIn({
  delay = 0,
  variant = "rise",
  children,
  style,
}: StaggerInProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: FINISH_INTRO_MS, easing: EASE_STANDARD }),
    );
  }, [delay, reducedMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform:
      variant === "bloom"
        ? [
            {
              scale:
                FINISH_BLOOM_SCALE + progress.value * (1 - FINISH_BLOOM_SCALE),
            },
          ]
        : [{ translateY: (1 - progress.value) * FINISH_RISE }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

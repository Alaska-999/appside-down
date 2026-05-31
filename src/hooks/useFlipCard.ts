import { useEffect, useRef, useState } from "react";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseFlipCardOptions {
  direction?: "horizontal" | "vertical";
  duration?: number;
  resetKey?: string | number;
}

interface UseFlipCardResult {
  isFront: boolean;
  flip: () => void;
  reset: () => void;
  frontAnimatedStyle: object;
  backAnimatedStyle: object;
}

export function useFlipCard({
  direction = "horizontal",
  duration = 400,
  resetKey,
}: UseFlipCardOptions = {}): UseFlipCardResult {
  const flipRotation = useSharedValue(0);
  const isFrontRef = useRef(true);
  const [isFront, setIsFront] = useState(true);

  const reset = () => {
    isFrontRef.current = true;
    flipRotation.value = withTiming(0, { duration: 0 });
    setIsFront(true);
  };

  const flip = () => {
    const next = !isFrontRef.current;
    isFrontRef.current = next;
    flipRotation.value = withTiming(next ? 0 : 180, { duration });
    setIsFront(next);
  };

  useEffect(() => {
    reset();
  }, [resetKey]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipRotation.value, [0, 180], [0, 180]);
    const transform =
      direction === "vertical"
        ? [{ rotateX: `${spin}deg` }]
        : [{ rotateY: `${spin}deg` }];
    return { transform, backfaceVisibility: "hidden" };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipRotation.value, [0, 180], [180, 360]);
    const transform =
      direction === "vertical"
        ? [{ rotateX: `${spin}deg` }]
        : [{ rotateY: `${spin}deg` }];
    return { transform, backfaceVisibility: "hidden" };
  });

  return { isFront, flip, reset, frontAnimatedStyle, backAnimatedStyle };
}

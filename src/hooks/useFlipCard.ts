import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseFlipCardOptions {
  direction?: "horizontal" | "vertical";
  resetKey?: string | number;
}

interface UseFlipCardResult {
  isFront: boolean;
  flip: () => void;
  reset: () => void;
  frontAnimatedStyle: object;
  backAnimatedStyle: object;
}

const FLIP_TIMING = {
  duration: 550,
  easing: Easing.bezier(0.2, 0.6, 0.4, 1),
};

export function useFlipCard({
  direction = "horizontal",
  resetKey,
}: UseFlipCardOptions = {}): UseFlipCardResult {
  const reducedMotion = useReducedMotion();
  const flipRotation = useSharedValue(0);
  const isFrontRef = useRef(true);
  const [isFront, setIsFront] = useState(true);

  const reset = useCallback(() => {
    isFrontRef.current = true;
    flipRotation.value = 0;
    setIsFront(true);
  }, [flipRotation]);

  const flip = () => {
    const next = !isFrontRef.current;
    isFrontRef.current = next;
    flipRotation.value = reducedMotion
      ? next
        ? 0
        : 180
      : withTiming(next ? 0 : 180, FLIP_TIMING);
    setIsFront(next);
  };

  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipRotation.value, [0, 180], [0, 180]);
    const transform =
      direction === "vertical"
        ? [{ perspective: 1000 }, { rotateX: `${spin}deg` }]
        : [{ perspective: 1000 }, { rotateY: `${spin}deg` }];
    return { transform, backfaceVisibility: "hidden" };
  }, [direction]);

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipRotation.value, [0, 180], [180, 360]);
    const transform =
      direction === "vertical"
        ? [{ perspective: 1000 }, { rotateX: `${spin}deg` }]
        : [{ perspective: 1000 }, { rotateY: `${spin}deg` }];
    return { transform, backfaceVisibility: "hidden" };
  }, [direction]);

  return { isFront, flip, reset, frontAnimatedStyle, backAnimatedStyle };
}

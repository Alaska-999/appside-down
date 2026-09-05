import { useCallback, useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type SwipeDecision = "idle" | "dragRight" | "dragLeft" | "know" | "learning";

const DEAD_ZONE = 10;
const COMMIT_THRESHOLD = 100;
const DECISION_OFFSET = 52;
const DECISION_ROTATE = 6;
const SNAP_DURATION = 140;
const EXIT_DURATION = 260;
const CANCEL_SPRING = { damping: 16, stiffness: 180 };
const EASE = Easing.out(Easing.cubic);

interface UseSwipeCardOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap: () => void;
  onDecisionChange?: (decision: SwipeDecision) => void;
  resetKey?: string | number;
  revertKey?: number;
  revertDirection?: "left" | "right";
}

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, value));
}

export function useSwipeCard({
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onDecisionChange,
  resetKey,
  revertKey,
  revertDirection = "right",
}: UseSwipeCardOptions) {
  const { width: screenWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const liveState = useSharedValue<0 | 1 | 2>(0);
  const [decision, setDecision] = useState<SwipeDecision>("idle");

  const updateDecision = useCallback(
    (next: SwipeDecision) => {
      setDecision(next);
      onDecisionChange?.(next);
    },
    [onDecisionChange],
  );

  const setLiveDecision = useCallback(
    (state: 0 | 1 | 2) => {
      updateDecision(state === 1 ? "dragRight" : state === 2 ? "dragLeft" : "idle");
    },
    [updateDecision],
  );

  useEffect(() => {
    translateX.value = 0;
    rotateZ.value = 0;
    liveState.value = 0;
    updateDecision("idle");
  }, [resetKey, translateX, rotateZ, liveState, updateDecision]);

  useEffect(() => {
    if (!revertKey) return;

    const sign = revertDirection === "left" ? -1 : 1;
    updateDecision(sign > 0 ? "know" : "learning");
    liveState.value = 0;

    if (reducedMotion) {
      translateX.value = 0;
      rotateZ.value = 0;
      updateDecision("idle");
      return;
    }

    translateX.value = sign * screenWidth * 1.3;
    rotateZ.value = sign * DECISION_ROTATE;
    translateX.value = withSequence(
      withTiming(sign * DECISION_OFFSET, { duration: SNAP_DURATION, easing: EASE }),
      withTiming(0, { duration: SNAP_DURATION, easing: EASE }, (finished) => {
        if (finished) runOnJS(updateDecision)("idle");
      }),
    );
    rotateZ.value = withTiming(0, { duration: SNAP_DURATION * 2, easing: EASE });
  }, [revertKey]);

  const commit = useCallback(
    (direction: "left" | "right") => {
      const sign = direction === "right" ? 1 : -1;
      const callback = direction === "right" ? onSwipeRight : onSwipeLeft;
      updateDecision(direction === "right" ? "know" : "learning");

      if (reducedMotion) {
        callback?.();
        return;
      }

      translateX.value = withSequence(
        withTiming(sign * DECISION_OFFSET, { duration: SNAP_DURATION, easing: EASE }),
        withTiming(sign * screenWidth * 1.3, { duration: EXIT_DURATION, easing: EASE }, (finished) => {
          if (finished && callback) runOnJS(callback)();
        }),
      );
      rotateZ.value = withTiming(sign * DECISION_ROTATE, { duration: SNAP_DURATION, easing: EASE });
    },
    [onSwipeRight, onSwipeLeft, reducedMotion, screenWidth, translateX, rotateZ, updateDecision],
  );

  const cancel = useCallback(() => {
    translateX.value = withSpring(0, CANCEL_SPRING);
    rotateZ.value = withSpring(0, CANCEL_SPRING);
    updateDecision("idle");
  }, [translateX, rotateZ, updateDecision]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      rotateZ.value = clamp(
        e.translationX * (DECISION_ROTATE / DECISION_OFFSET),
        -DECISION_ROTATE,
        DECISION_ROTATE,
      );

      let next: 0 | 1 | 2 = 0;
      if (e.translationX > DEAD_ZONE) next = 1;
      else if (e.translationX < -DEAD_ZONE) next = 2;

      if (next !== liveState.value) {
        liveState.value = next;
        runOnJS(setLiveDecision)(next);
      }
    })
    .onEnd((e) => {
      if (e.translationX > COMMIT_THRESHOLD) {
        runOnJS(commit)("right");
      } else if (e.translationX < -COMMIT_THRESHOLD) {
        runOnJS(commit)("left");
      } else {
        liveState.value = 0;
        runOnJS(cancel)();
      }
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onTap)();
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  return { gesture, cardAnimatedStyle, decision };
}

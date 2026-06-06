import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SWIPE_THRESHOLD = 100;

interface UseSwipeCardOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap: () => void;
  resetKey?: string | number;
  revertKey?: number;
  revertDirection?: "left" | "right";

}

export function useSwipeCard({
  onSwipeLeft,
  onSwipeRight,
  onTap,
  resetKey,
  revertKey,
  revertDirection = "right",
}: UseSwipeCardOptions) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
  }, [resetKey]);

  useEffect(() => {
    if (!revertKey) return;

    const startX = revertDirection === "left" ? -screenWidth * 1.3 : screenWidth * 1.3;
    translateX.value = startX;
    translateX.value = withTiming(0, { duration: 250 });

  }, [revertKey]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(screenWidth * 1.3, { duration: 250 }, (finished) => {
          if (finished && onSwipeRight) {
            runOnJS(onSwipeRight)();

          }
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-screenWidth * 1.3, { duration: 250 }, (finished) => {
          if (finished && onSwipeLeft) {
            runOnJS(onSwipeLeft)();
          }
        });
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onTap)();
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15]
    );
    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotation}deg` },
      ],
    };
  });

  const backgroundCardStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      ["#DC2626", "#F8FAFC", "#059669"]
    );
    return { backgroundColor };
  });

  return { gesture, cardAnimatedStyle, backgroundCardStyle };
}
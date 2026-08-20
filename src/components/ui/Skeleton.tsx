import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

const SHIMMER_DURATION = 1600;
const SWEEP_WIDTH_PERCENT = 60;
const SWEEP_TRAVEL_PERCENT = 180;
const SWEEP_START_PERCENT = -60;

const SHIMMER_GRADIENT_START = { x: 0.0076, y: 0.4132 };
const SHIMMER_GRADIENT_END = { x: 0.9924, y: 0.5868 };

function useShimmerProgress() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: SHIMMER_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [progress]);

  return progress;
}

interface SkeletonProps extends Omit<YStackProps, "width" | "height"> {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({
  width = "100%",
  height = 14,
  borderRadius = 8,
  ...rest
}: SkeletonProps) {
  const progress = useShimmerProgress();

  const shimmerStyle = useAnimatedStyle(() => ({
    left: `${SWEEP_START_PERCENT + progress.value * SWEEP_TRAVEL_PERCENT}%`,
  }));

  return (
    <YStack
      width={width as YStackProps["width"]}
      height={height}
      br={borderRadius}
      bg="$glassBgStrong"
      overflow="hidden"
      pos="relative"
      {...rest}
    >
      <Animated.View
        style={[
          styles.sweep,
          { width: `${SWEEP_WIDTH_PERCENT}%` },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(94,234,212,0.16)", "transparent"]}
          start={SHIMMER_GRADIENT_START}
          end={SHIMMER_GRADIENT_END}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  sweep: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
});

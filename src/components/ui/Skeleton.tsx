import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
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

type SkeletonVariant = "default" | "states";

const VARIANT_STYLES: Record<
  SkeletonVariant,
  { bg: string; shimmerColor: string; highlight: boolean }
> = {
  default: { bg: "$glassBgStrong", shimmerColor: "rgba(94,234,212,0.16)", highlight: false },
  states: { bg: "rgba(220,255,245,0.045)", shimmerColor: "rgba(220,255,245,0.09)", highlight: true },
};

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

type SkeletonLayoutProps = Pick<
  YStackProps,
  "mt" | "mb" | "ml" | "mr" | "f" | "flex" | "ai" | "als" | "pos" | "zIndex" | "testID"
>;

interface SkeletonProps extends SkeletonLayoutProps {
  width?: number | string;
  height?: number;
  borderRadius?: YStackProps["br"];
  variant?: SkeletonVariant;
}

export function Skeleton({
  width = "100%",
  height = 14,
  borderRadius = 8,
  variant = "default",
  ...rest
}: SkeletonProps) {
  const progress = useShimmerProgress();
  const variantStyle = VARIANT_STYLES[variant];

  const shimmerStyle = useAnimatedStyle(() => ({
    left: `${SWEEP_START_PERCENT + progress.value * SWEEP_TRAVEL_PERCENT}%`,
  }));

  return (
    <YStack
      width={width as YStackProps["width"]}
      height={height}
      br={borderRadius}
      bg={variantStyle.bg}
      overflow="hidden"
      pos="relative"
      {...rest}
    >
      {variantStyle.highlight && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      )}
      <Animated.View
        style={[
          styles.sweep,
          { width: `${SWEEP_WIDTH_PERCENT}%` },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={["transparent", variantStyle.shimmerColor, "transparent"]}
          start={SHIMMER_GRADIENT_START}
          end={SHIMMER_GRADIENT_END}
          style={StyleSheet.absoluteFill}
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

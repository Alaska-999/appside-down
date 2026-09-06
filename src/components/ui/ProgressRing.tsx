import {
  Canvas,
  Circle,
  Group,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { ICON_LIME, ICON_MINT, ICON_NEAR_BLACK } from "@/src/constants/iconColors";
import { EASE_STANDARD } from "@/src/constants/motion";
import { SURFACE_BORDER } from "@/src/constants/surfaceAlpha";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "tamagui";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  labelFontSize?: number;
  caption?: string;
  animated?: boolean;
  duration?: number;
}

const TRACK = SURFACE_BORDER;
const HOLE = ICON_NEAR_BLACK;

export function ProgressRing({
  progress,
  size = 62,
  strokeWidth = 5,
  label,
  labelFontSize = 15,
  caption,
  animated = false,
  duration = 1700,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const center = size / 2;

  const animatedProgress = useSharedValue(animated ? 0 : clamped);

  useEffect(() => {
    animatedProgress.value = withTiming(clamped, {
      duration: animated ? duration : 0,
      easing: EASE_STANDARD,
    });
  }, [clamped, animated, duration, animatedProgress]);

  const positions = useDerivedValue(() => {
    const p = Math.max(animatedProgress.value, 0.0001);
    return [0, p, p, 1];
  });

  return (
    <View width={size} height={size} ai="center" jc="center">
      <Canvas style={[StyleSheet.absoluteFill]}>
        <Group transform={[{ rotate: -Math.PI / 2 }]} origin={vec(center, center)}>
          <Circle cx={center} cy={center} r={center}>
            <SweepGradient
              c={vec(center, center)}
              colors={[ICON_LIME, ICON_MINT, TRACK, TRACK]}
              positions={positions}
            />
          </Circle>
        </Group>
        <Circle cx={center} cy={center} r={center - strokeWidth} color={HOLE} />
      </Canvas>
      {label && (
        <Text fontSize={labelFontSize} fontWeight="800" color="$color">
          {label}
        </Text>
      )}
      {caption && (
        <Text fontSize={11} color="$colorMuted" mt={-2}>
          {caption}
        </Text>
      )}
    </View>
  );
}

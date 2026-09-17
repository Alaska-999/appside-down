import {
  Canvas,
  Circle,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
} from "@/src/constants/iconColors";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { EASE_STANDARD } from "@/src/constants/motion";
import { SCRIM_BASE_SOFT } from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";
import { ratio } from "@/src/utils/progress";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { XStack } from "tamagui";

export type ProgressBarSize = "md" | "sm";
export type ProgressBarVariant = "split" | "plain";

const BAR_HEIGHT: Record<ProgressBarSize, number> = { md: 8, sm: 4 };
const GLOW_WIDTH = 8;
const GLOW_PAD = 8;
const MASTERED_FILL = ICON_LIME_LIGHT;
const LEARNING_FILL = withAlpha(ICON_MINT, 0.42);
const PLAIN_START = { x: 0, y: 0.5 };
const PLAIN_END = { x: 1, y: 0.5 };
const FILL_MS = 320;

function useAnimatedWidth(target: number) {
  const reducedMotion = useReducedMotion();
  const width = useSharedValue(target);

  useEffect(() => {
    width.value = reducedMotion
      ? target
      : withTiming(target, { duration: FILL_MS, easing: EASE_STANDARD });
  }, [target, reducedMotion, width]);

  return useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
}

function EdgeGlow({ size }: { size: ProgressBarSize }) {
  const height = BAR_HEIGHT[size] + GLOW_PAD;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        right: -1,
        top: -GLOW_PAD / 2,
        width: GLOW_WIDTH,
        height,
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle cx={GLOW_WIDTH / 2} cy={height / 2} r={GLOW_WIDTH / 2}>
          <RadialGradient
            c={vec(GLOW_WIDTH / 2, height / 2)}
            r={GLOW_WIDTH / 2}
            colors={[
              withAlpha(ICON_MINT_LIGHT, 0.9),
              withAlpha(ICON_MINT_LIGHT, 0),
            ]}
            positions={[0, 0.75]}
          />
        </Circle>
      </Canvas>
    </View>
  );
}

function Divider() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: SCRIM_BASE_SOFT,
      }}
    />
  );
}

export function ProgressSplitBar({
  mastered,
  learning,
  total,
  size = "md",
  variant = "split",
}: {
  mastered: number;
  learning: number;
  total: number;
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
}) {
  const safeTotal = total > 0 ? total : 1;
  const plain = variant === "plain";
  const masteredRatio = ratio(plain ? mastered + learning : mastered, total);
  const learningRatio = plain
    ? 0
    : Math.max(0, Math.min(1 - masteredRatio, learning / safeTotal));

  const masteredStyle = useAnimatedWidth(masteredRatio);
  const learningStyle = useAnimatedWidth(learningRatio);

  return (
    <XStack
      h={BAR_HEIGHT[size]}
      br={999}
      overflow="hidden"
      bg="$glassBorderFaint"
      accessibilityRole="progressbar"
      accessibilityLabel={
        plain
          ? `${mastered + learning} of ${total} cards done`
          : `${mastered} of ${total} cards mastered`
      }
      accessibilityValue={{
        min: 0,
        max: safeTotal,
        now: plain ? mastered + learning : mastered,
      }}
    >
      <Animated.View
        style={[
          styles.fill,
          plain ? null : { backgroundColor: MASTERED_FILL },
          masteredStyle,
        ]}
      >
        {plain && (
          <LinearGradient
            colors={GRADIENT_PRIMARY}
            start={PLAIN_START}
            end={PLAIN_END}
            style={StyleSheet.absoluteFill}
          />
        )}
        {masteredRatio > 0 && learningRatio === 0 && <EdgeGlow size={size} />}
      </Animated.View>
      {!plain && (
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: LEARNING_FILL },
            learningStyle,
          ]}
        >
          {masteredRatio > 0 && <Divider />}
          {learningRatio > 0 && <EdgeGlow size={size} />}
        </Animated.View>
      )}
    </XStack>
  );
}

const styles = StyleSheet.create({
  fill: { position: "relative", height: "100%" },
});

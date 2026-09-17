import { EASE_STANDARD } from "@/src/constants/motion";
import { ICON_LIME, ICON_LIME_LIGHT } from "@/src/constants/iconColors";
import { withAlpha } from "@/src/utils/withAlpha";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

export const COMBO_MIN = 2;

const PILL_HEIGHT = 22;
const PILL_PAD_X = 7;
const PILL_RADIUS = 11;
const TEXT_SIZE = 12.5;
const MAX_FONT_SCALE = 1.2;

const HIDDEN_SCALE = 0.7;
const POP_SCALE = 1.4;
const POP_MS = 120;
const FADE_IN_MS = 140;
const FADE_OUT_MS = 130;
const SPRING = { damping: 10, stiffness: 230 };

const FLARE_SCALE = 2.1;
const FLARE_MS = 420;

export function MatchCombo({ combo }: { combo: number }) {
  const reducedMotion = useReducedMotion();
  const visible = combo >= COMBO_MIN;

  const appear = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : HIDDEN_SCALE);
  const flare = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      appear.value = withTiming(0, { duration: FADE_OUT_MS });
      scale.value = withTiming(HIDDEN_SCALE, { duration: FADE_OUT_MS });
      flare.value = 0;
      return;
    }
    if (reducedMotion) {
      appear.value = 1;
      scale.value = 1;
      return;
    }
    appear.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: EASE_STANDARD,
    });
    scale.value = withSequence(
      withTiming(POP_SCALE, { duration: POP_MS, easing: EASE_STANDARD }),
      withSpring(1, SPRING),
    );
    flare.value = 1;
    flare.value = withTiming(0, { duration: FLARE_MS, easing: EASE_STANDARD });
  }, [combo, visible, reducedMotion, appear, scale, flare]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: scale.value }],
  }));

  const flareStyle = useAnimatedStyle(() => ({
    opacity: flare.value * 0.55,
    transform: [{ scale: 1 + (1 - flare.value) * (FLARE_SCALE - 1) }],
  }));

  return (
    <Animated.View style={pillStyle} pointerEvents="none">
      <YStack pos="relative" ai="center" jc="center">
        <Animated.View
          style={[StyleSheet.absoluteFill, flareStyle]}
          pointerEvents="none"
        >
          <YStack f={1} br={PILL_RADIUS} bg={withAlpha(ICON_LIME_LIGHT, 0.4)} />
        </Animated.View>
        <XStack
          h={PILL_HEIGHT}
          px={PILL_PAD_X}
          br={PILL_RADIUS}
          ai="center"
          jc="center"
          bg={withAlpha(ICON_LIME, 0.18)}
          borderWidth={1}
          borderColor={withAlpha(ICON_LIME_LIGHT, 0.55)}
          shadowColor={ICON_LIME_LIGHT}
          shadowOpacity={0.5}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 0 }}
        >
          <Text
            fontSize={TEXT_SIZE}
            fontWeight="800"
            color={ICON_LIME_LIGHT}
            fontVariant={["tabular-nums"]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            accessibilityLabel={`Combo ${combo} in a row`}
          >
            ×{combo}
          </Text>
        </XStack>
      </YStack>
    </Animated.View>
  );
}

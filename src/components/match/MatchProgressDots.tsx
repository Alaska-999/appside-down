import { EASE_STANDARD } from "@/src/constants/motion";
import { ICON_LIME_LIGHT, ICON_TEXT } from "@/src/constants/iconColors";
import { withAlpha } from "@/src/utils/withAlpha";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { XStack } from "tamagui";

const DOT_SIZE = 8;
const DOT_GAP = 6;
const DOT_EMPTY = withAlpha(ICON_TEXT, 0.16);
const FILL_MS = 200;
const POP_SCALE = 1.5;
const POP_MS = 130;
const SPRING = { damping: 11, stiffness: 240 };

function Dot({ filled }: { filled: boolean }) {
  const reducedMotion = useReducedMotion();
  const fill = useSharedValue(filled ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      fill.value = filled ? 1 : 0;
      return;
    }
    fill.value = withTiming(filled ? 1 : 0, {
      duration: FILL_MS,
      easing: EASE_STANDARD,
    });
    if (!filled) return;
    scale.value = withSequence(
      withTiming(POP_SCALE, { duration: POP_MS, easing: EASE_STANDARD }),
      withSpring(1, SPRING),
    );
  }, [filled, reducedMotion, fill, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <XStack
      w={DOT_SIZE}
      h={DOT_SIZE}
      br={DOT_SIZE / 2}
      bg={DOT_EMPTY}
      pos="relative"
    >
      <Animated.View style={style}>
        <XStack
          w={DOT_SIZE}
          h={DOT_SIZE}
          br={DOT_SIZE / 2}
          bg={ICON_LIME_LIGHT}
          shadowColor={ICON_LIME_LIGHT}
          shadowOpacity={0.6}
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 0 }}
        />
      </Animated.View>
    </XStack>
  );
}

export function MatchProgressDots({
  total,
  matched,
}: {
  total: number;
  matched: number;
}) {
  return (
    <XStack
      gap={DOT_GAP}
      ai="center"
      accessibilityRole="progressbar"
      accessibilityLabel={`${matched} of ${total} pairs matched`}
    >
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} filled={index < matched} />
      ))}
    </XStack>
  );
}

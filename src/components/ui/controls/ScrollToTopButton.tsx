import { IconButton } from "@/src/components/ui/IconButton";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { screenGutter } from "@/tamagui.config";
import { ArrowUp } from "lucide-react-native";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ScrollToTopButtonProps {
  scrollY: SharedValue<number>;
  onPress: () => void;
  bottomOffset: number;
  thresholdMultiplier?: number;
}

export function ScrollToTopButton({
  scrollY,
  onPress,
  bottomOffset,
  thresholdMultiplier = 1.7,
}: ScrollToTopButtonProps) {
  const { height: windowHeight } = useWindowDimensions();
  const reduced = useReducedMotion();
  const threshold = windowHeight * thresholdMultiplier;
  const shown = useSharedValue(0);
  const [active, setActive] = useState(false);

  useAnimatedReaction(
    () => scrollY.value > threshold,
    (isPast, wasPast) => {
      if (isPast === wasPast) return;
      shown.value = withTiming(isPast ? 1 : 0, {
        duration: reduced ? 0 : 220,
      });
      runOnJS(setActive)(isPast);
    },
    [threshold, reduced],
  );

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ scale: 0.85 + shown.value * 0.15 }],
  }));

  return (
    <Animated.View
      pointerEvents={active ? "auto" : "none"}
      style={[
        {
          position: "absolute",
          right: screenGutter,
          bottom: bottomOffset,
        },
        style,
      ]}
    >
      <IconButton
        variant="liquidGlass"
        icon={<ArrowUp size={20} color={ICON_ON_GLASS} strokeWidth={2.1} />}
        onPress={onPress}
        accessibilityLabel="Scroll to top"
      />
    </Animated.View>
  );
}

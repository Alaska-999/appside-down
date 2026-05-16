import { useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import { Text, YStack } from "tamagui";

interface FlashcardSmProps {
  term: string;
  definition: string;
}

export function FlashcardSm({ term, definition }: FlashcardSmProps) {
  const flipProgress = useSharedValue(0);

  const onPress = useCallback(() => {
    flipProgress.value = withSpring(flipProgress.value === 0 ? 1 : 0, {
      damping: 20,
      stiffness: 180,
    });
  }, [flipProgress]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${interpolate(flipProgress.value, [0, 0.5, 1], [0, -90, -90])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.49, 0.5, 1], [1, 1, 0, 0]),
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${interpolate(flipProgress.value, [0, 0.5, 1], [90, 90, 0])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.5, 0.51, 1], [0, 0, 1, 1]),
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  }));

  return (
    <Pressable onPress={onPress} style={{ width: "90%", maxWidth: 400 }}>
      <YStack bg="$backgroundCard" br="$4" h="$13" w="100%" position="relative">
        <Animated.View style={frontStyle}>
          <Text fontSize="$4" color="$colorSecondary" textAlign="center">
            {term}
          </Text>
        </Animated.View>

        <Animated.View style={backStyle}>
          <Text fontSize="$4" color="$colorSecondary" textAlign="center">
            {definition}
          </Text>
        </Animated.View>
      </YStack>
    </Pressable>
  );
}

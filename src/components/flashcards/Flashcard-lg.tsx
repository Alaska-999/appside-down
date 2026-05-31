import { useFlipCard } from "@/src/hooks/useFlipCard";
import { Flashcard } from "@/src/types";
import { Star, Volume2 } from "@tamagui/lucide-icons";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button, Card, Text, XStack, YStack } from "tamagui";

interface FlashcardLgProps {
  card: Flashcard | undefined;
  direction?: "horizontal" | "vertical";
  onTts?: () => void;
  onStar?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);
const SWIPE_THRESHOLD = 100;

export function FlashcardLg({
  card,
  direction = "horizontal",
  onTts,
  onStar,
  onSwipeLeft,
  onSwipeRight,
}: FlashcardLgProps) {
  const { flip, frontAnimatedStyle, backAnimatedStyle } = useFlipCard({
    direction,
    resetKey: card?.id,
  });

  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
  }, [card?.id]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 }, () => {
          if (onSwipeRight) runOnJS(onSwipeRight)();
          translateX.value = 0;
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 }, () => {
          if (onSwipeLeft) runOnJS(onSwipeLeft)();
          translateX.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(flip)();
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const swipeAnimatedStyle = useAnimatedStyle(() => {
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

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ flex: 1, margin: 20, position: "relative" }, swipeAnimatedStyle]}>
        <AnimatedCard
          style={frontAnimatedStyle}
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="$cardSurface"
          br="$6"
          backfaceVisibility="hidden"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.08}
          shadowRadius={12}
          elevation={4}
        >
          <XStack justifyContent="space-between" alignItems="center" p="$5" pb="$3">
            <Button
              icon={<Volume2 size="$1" color="$colorMuted" />}
              circular
              size="$3"
              bg="$backgroundSoft"
              onPress={(e) => {
                e.stopPropagation();
                onTts?.();
              }}
            />
            <Button
              icon={<Star size="$1" color="$colorMuted" />}
              circular
              size="$3"
              bg="$backgroundSoft"
              onPress={(e) => {
                e.stopPropagation();
                onStar?.();
              }}
            />
          </XStack>
          <YStack f={1} alignItems="center" justifyContent="center" px="$5" gap="$3">
            <Text
              fontSize="$1"
              color="$colorMuted"
              letterSpacing={1.5}
              textTransform="uppercase"
            >
              Term
            </Text>
            <Text
              fontSize="$7"
              color="$color"
              textAlign="center"
              numberOfLines={6}
              ellipsizeMode="tail"
            >
              {card?.term}
            </Text>
          </YStack>
          <XStack justifyContent="center" pb="$5">
            <Text fontSize="$2" color="$colorMuted">
              Tap to reveal
            </Text>
          </XStack>
        </AnimatedCard>

        <AnimatedCard
          style={backAnimatedStyle}
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="$cardBack"
          br="$6"
          backfaceVisibility="hidden"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.08}
          shadowRadius={12}
          elevation={4}
        >
          <YStack f={1} alignItems="center" justifyContent="center" px="$5" gap="$3">
            <Text
              fontSize="$1"
              color="$colorMuted"
              letterSpacing={1.5}
              textTransform="uppercase"
            >
              Definition
            </Text>
            <Text
              fontSize="$7"
              color="$color"
              textAlign="center"
              numberOfLines={6}
              ellipsizeMode="tail"
            >
              {card?.definition}
            </Text>
          </YStack>
        </AnimatedCard>
      </Animated.View>
    </GestureDetector>
  );
}

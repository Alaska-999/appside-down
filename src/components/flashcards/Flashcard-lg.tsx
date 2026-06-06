import { useFlipCard } from "@/src/hooks/useFlipCard";
import { useSwipeCard } from "@/src/hooks/useSwipeCard";
import { Flashcard } from "@/src/types";
import { Star, Volume2 } from "@tamagui/lucide-icons";
import { useEffect, useRef } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button, Card, Text, XStack, YStack } from "tamagui";

interface FlashcardLgProps {
  card: Flashcard | undefined;
  revertCard?: Flashcard;
  revertDirection?: "left" | "right";
  direction?: "horizontal" | "vertical";
  onTts?: () => void;
  onStar?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onRevert?: () => void;
  revertKey?: number;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function FlashcardLg({
  card,
  revertCard,
  revertDirection = "right",
  direction = "horizontal",
  onTts,
  onStar,
  onSwipeLeft,
  onSwipeRight,
  onRevert,
  revertKey,
}: FlashcardLgProps) {
  const { width: screenWidth } = useWindowDimensions();

  const { flip, frontAnimatedStyle, backAnimatedStyle } = useFlipCard({
    direction,
    resetKey: card?.id,
  });

  const { gesture, cardAnimatedStyle, backgroundCardStyle } = useSwipeCard({
    onSwipeLeft,
    onSwipeRight,
    onTap: flip,
    resetKey: card?.id,
    revertKey,
    revertDirection,
  });

  const revertDirectionRef = useRef(revertDirection);
  revertDirectionRef.current = revertDirection;

  const overlayX = useSharedValue(screenWidth * 2);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: overlayX.value }],
  }));

  useEffect(() => {
    if (!revertKey) return;
    const startX =
      revertDirectionRef.current === "left"
        ? -screenWidth * 1.5
        : screenWidth * 1.5;
    overlayX.value = startX;
    overlayX.value = withTiming(
      0,
      { duration: 320, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (!finished) return;
        if (onRevert) runOnJS(onRevert)();
        overlayX.value = screenWidth * 2;
      },
    );
  }, [revertKey]);

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.backgroundCard,
            backgroundCardStyle,
          ]}
        />
        <Animated.View style={[styles.mainCard, cardAnimatedStyle]}>
          <AnimatedCard
            style={frontAnimatedStyle}
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="$backgroundCard"
            br="$6"
            backfaceVisibility="hidden"
            border={"2px solid"}
            borderColor="$colorMuted"
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
              p="$5"
              pb="$3"
            >
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
            <YStack
              f={1}
              alignItems="center"
              justifyContent="center"
              px="$5"
              gap="$3"
            >
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
            bg="$backgroundCard"
            br="$6"
            backfaceVisibility="hidden"
            border={"2px solid"}
            borderColor="$colorMuted"
          >
            <YStack
              f={1}
              alignItems="center"
              justifyContent="center"
              px="$5"
              gap="$3"
            >
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
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, margin: 20 },
  backgroundCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  mainCard: { flex: 1, position: "relative" },
  overlayButtonSpacer: { height: 60 },
});

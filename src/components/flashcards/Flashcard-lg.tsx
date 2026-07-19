import { useFlipCard } from "@/src/hooks/useFlipCard";
import { useSwipeCard } from "@/src/hooks/useSwipeCard";
import { Flashcard } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { Star, Volume2 } from "@tamagui/lucide-icons";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Button, Card, Text, XStack, YStack } from "tamagui";

interface FlashcardLgProps {
  card: Flashcard | undefined;
  revertDirection?: "left" | "right";
  direction?: "horizontal" | "vertical";
  showDefinitionFirst?: boolean;
  onTts?: () => void;
  onStar?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  revertKey?: number;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function FlashcardLg({
  card,
  revertDirection = "right",
  direction = "horizontal",
  showDefinitionFirst = false,
  onTts,
  onStar,
  onSwipeLeft,
  onSwipeRight,
  revertKey,
}: FlashcardLgProps) {
  const front = showDefinitionFirst
    ? { label: "Definition", text: cardSideText(card?.definition) }
    : { label: "Term", text: cardSideText(card?.term) };
  const back = showDefinitionFirst
    ? { label: "Term", text: cardSideText(card?.term) }
    : { label: "Definition", text: cardSideText(card?.definition) };
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
                {front.label}
              </Text>
              <Text
                fontSize="$7"
                color="$color"
                textAlign="center"
                numberOfLines={6}
                ellipsizeMode="tail"
              >
                {front.text}
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
                {back.label}
              </Text>
              <Text
                fontSize="$7"
                color="$color"
                textAlign="center"
                numberOfLines={6}
                ellipsizeMode="tail"
              >
                {back.text}
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

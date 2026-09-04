import { useFlipCard } from "@/src/hooks/useFlipCard";
import { useSwipeCard } from "@/src/hooks/useSwipeCard";
import { Flashcard } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { Star, Volume2 } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 235;
const CARD_RADIUS = 22 * MOCKUP_SCALE;
const BORDER_WIDTH = 1.5;

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

function CardFace({ style, text }: { style: object; text: string }) {
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: CARD_RADIUS + BORDER_WIDTH,
          shadowColor: "#2dd4bf",
          shadowOpacity: 0.25,
          shadowRadius: 34 * MOCKUP_SCALE,
          shadowOffset: { width: 0, height: 0 },
          elevation: 0,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={["#2DD4BF", "rgba(99,102,241,0.7)", "#A3E635"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.18, y: 0.12 }}
        end={{ x: 0.82, y: 0.88 }}
        style={{
          flex: 1,
          borderRadius: CARD_RADIUS + BORDER_WIDTH,
          padding: BORDER_WIDTH,
        }}
      >
        <YStack
          f={1}
          br={CARD_RADIUS}
          bg="rgba(13,17,26,0.96)"
          overflow="hidden"
          ai="center"
          jc="center"
          p={20 * MOCKUP_SCALE}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 16,
            }}
            pointerEvents="none"
          />

          <YStack alignItems="center" justifyContent="center">
            <Text
              fontSize={24 * MOCKUP_SCALE}
              fontWeight="800"
              color="$color"
              textAlign="center"
              numberOfLines={6}
              ellipsizeMode="tail"
            >
              {text}
            </Text>
            <Text
              fontSize={9.5 * MOCKUP_SCALE}
              color="#5EEAD4"
              tt="uppercase"
              letterSpacing={1.4}
              fontWeight="700"
              mt={8 * MOCKUP_SCALE}
            >
              tap to flip
            </Text>
          </YStack>
        </YStack>
      </LinearGradient>
    </Animated.View>
  );
}

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
    ? cardSideText(card?.definition)
    : cardSideText(card?.term);
  const back = showDefinitionFirst
    ? cardSideText(card?.term)
    : cardSideText(card?.definition);
  const { flip, isFront, frontAnimatedStyle, backAnimatedStyle } = useFlipCard({
    direction,
    resetKey: card?.id,
  });

  const iconsRow = (
    <XStack
      pos="absolute"
      top={12 * MOCKUP_SCALE}
      right={12 * MOCKUP_SCALE}
      gap={12 * MOCKUP_SCALE}
    >
      {onTts && (
        <Pressable hitSlop={12} onPress={onTts}>
          <Volume2 size={16 * MOCKUP_SCALE} color="$colorMuted" />
        </Pressable>
      )}
      <Pressable hitSlop={12} onPress={onStar}>
        <Star
          size={16 * MOCKUP_SCALE}
          color={card?.isStarred ? "#A3E635" : "$colorMuted"}
          fill={card?.isStarred ? "#A3E635" : "none"}
        />
      </Pressable>
    </XStack>
  );

  const { gesture, cardAnimatedStyle, backgroundCardStyle } = useSwipeCard({
    onSwipeLeft,
    onSwipeRight,
    onTap: flip,
    resetKey: card?.id,
    revertKey,
    revertDirection,
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.gestureArea}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backgroundCard,
              backgroundCardStyle,
            ]}
          />
          <Animated.View style={[styles.mainCard, cardAnimatedStyle]}>
            <CardFace style={frontAnimatedStyle} text={front} />
            <CardFace style={backAnimatedStyle} text={back} />
          </Animated.View>
        </View>
      </GestureDetector>

      <Animated.View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, cardAnimatedStyle]}
      >
        <Animated.View
          pointerEvents={isFront ? "box-none" : "none"}
          style={[StyleSheet.absoluteFill, frontAnimatedStyle]}
        >
          {iconsRow}
        </Animated.View>
        <Animated.View
          pointerEvents={isFront ? "none" : "box-none"}
          style={[StyleSheet.absoluteFill, backAnimatedStyle]}
        >
          {iconsRow}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, margin: 20 },
  gestureArea: { flex: 1 },
  backgroundCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  mainCard: { flex: 1, position: "relative" },
});

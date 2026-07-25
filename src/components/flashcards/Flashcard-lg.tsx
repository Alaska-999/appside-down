import { useFlipCard } from "@/src/hooks/useFlipCard";
import { useSwipeCard } from "@/src/hooks/useSwipeCard";
import { Flashcard } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { Star, Volume2 } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Card, Text, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

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

function CardFace({ style, text }: { style: object; text: string }) {
  return (
    <AnimatedCard
      style={style}
      pos="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(220,255,245,0.07)"
      borderWidth={1}
      borderColor="$glassBorder"
      br={22 * MOCKUP_SCALE}
      shadowColor="#2dd4bf"
      shadowOpacity={0.13}
      shadowRadius={28 * MOCKUP_SCALE}
      shadowOffset={{ width: 0, height: 0 }}
      elevation={0}
      p={20 * MOCKUP_SCALE}
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
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
          fontSize={22 * MOCKUP_SCALE}
          fontWeight="800"
          color="$color"
          textAlign="center"
          numberOfLines={6}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
        <Text
          fontSize={10 * MOCKUP_SCALE}
          color="$colorMuted"
          tt="uppercase"
          letterSpacing={0.5 * MOCKUP_SCALE}
          mt={10 * MOCKUP_SCALE}
        >
          tap to flip
        </Text>
      </YStack>
    </AnimatedCard>
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
              StyleSheet.absoluteFillObject,
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
        style={[StyleSheet.absoluteFillObject, cardAnimatedStyle]}
      >
        <Animated.View
          pointerEvents={isFront ? "box-none" : "none"}
          style={[StyleSheet.absoluteFillObject, frontAnimatedStyle]}
        >
          {iconsRow}
        </Animated.View>
        <Animated.View
          pointerEvents={isFront ? "none" : "box-none"}
          style={[StyleSheet.absoluteFillObject, backAnimatedStyle]}
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

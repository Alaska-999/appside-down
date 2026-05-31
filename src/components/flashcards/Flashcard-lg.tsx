import { useFlipCard } from "@/src/hooks/useFlipCard";
import { Flashcard } from "@/src/types";
import { Star, Volume2 } from "@tamagui/lucide-icons";
import Animated from "react-native-reanimated";
import { Button, Card, Text, XStack } from "tamagui";

interface FlashcardLgProps {
  card: Flashcard | undefined;
  direction?: "horizontal" | "vertical";
  onTts?: () => void;
  onStar?: () => void;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function FlashcardLg({
  card,
  direction = "horizontal",
  onTts,
  onStar,
}: FlashcardLgProps) {
  const { flip, frontAnimatedStyle, backAnimatedStyle } = useFlipCard({
    direction,
    resetKey: card?.id,
  });

  return (
    <Card
      bg="transparent"
      m={20}
      f={1}
      pos="relative"
    >
      <AnimatedCard
        style={frontAnimatedStyle}
        pos="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="$gameCard"
        p="$5"
        onPress={flip}
      >
        <XStack justifyContent="space-between" alignItems="center" pb="$3">
          <Button
            icon={<Volume2 size="$1" color="$colorMuted" />}
            circular
            size="$3"
            bg="$backgroundSoft"
            onPress={(e) => { e.stopPropagation(); onTts?.(); }}
          />
          <Button
            icon={<Star size="$1" color="$colorMuted" />}
            circular
            size="$3"
            bg="$backgroundSoft"
            onPress={(e) => { e.stopPropagation(); onStar?.(); }}
          />
        </XStack>
        <XStack f={1} alignItems="center" justifyContent="center">
          <Text
            fontSize="$6"
            color="$color"
            textAlign="center"
            numberOfLines={6}
            ellipsizeMode="tail"
          >
            {card?.term}
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
        bg="$gameCard"
        p="$5"
        alignItems="center"
        justifyContent="center"
        onPress={flip}
      >
        <Text
          fontSize="$6"
          color="$color"
          textAlign="center"
          numberOfLines={6}
          ellipsizeMode="tail"
        >
          {card?.definition}
        </Text>
      </AnimatedCard>
    </Card>
  );
}

import { useFlipCard } from "@/src/hooks/useFlipCard";
import Animated from "react-native-reanimated";
import { Card, Text } from "tamagui";

interface FlashcardSmProps {
  term: string;
  definition: string;
  direction?: "horizontal" | "vertical";
  width?: number;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function FlashcardSm({
  term,
  definition,
  direction = "vertical",
  width,
}: FlashcardSmProps) {
  const { flip, frontAnimatedStyle, backAnimatedStyle } = useFlipCard({
    direction,
    duration: 400,
  });

  return (
    <Card
      h="$13"
      bg="transparent"
      onPress={flip}
      pos="relative"
      {...(width ? { width } : { w: "90%" })}
    >
      <AnimatedCard
        style={frontAnimatedStyle}
        pos="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="$backgroundCard"
        p="$4"
        br="$4"
        alignItems="center"
        justifyContent="center"
        backfaceVisibility="hidden"
      >
        <Text
          fontSize="$6"
          color="$color"
          textAlign="center"
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {term}
        </Text>
      </AnimatedCard>
      <AnimatedCard
        style={backAnimatedStyle}
        pos="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="$backgroundCard"
        p="$4"
        br="$4"
        alignItems="center"
        justifyContent="center"
        backfaceVisibility="hidden"
      >
        <Text
          fontSize="$6"
          color="$color"
          textAlign="center"
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {definition}
        </Text>
      </AnimatedCard>
    </Card>
  );
}

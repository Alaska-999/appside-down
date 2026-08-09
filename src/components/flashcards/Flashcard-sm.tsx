import { useFlipCard } from "@/src/hooks/useFlipCard";
import { cardSideText } from "@/src/utils/cardText";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Card, Text } from "tamagui";

interface FlashcardSmProps {
  term: string;
  definition: string;
  direction?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  relativeProgress?: SharedValue<number>;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

function CardFace({
  style,
  text,
  textStyle,
}: {
  style: object;
  text: string;
  textStyle: object;
}) {
  return (
    <AnimatedCard
      style={style}
      pos="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(13,17,26,0.96)"
      borderWidth={1}
      borderColor="$glassBorder"
      br={24}
      shadowColor="#2dd4bf"
      shadowOpacity={0.1}
      shadowRadius={27}
      shadowOffset={{ width: 0, height: 0 }}
      elevation={0}
      p="$4"
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
      <Animated.View style={[{ alignItems: "center" }, textStyle]}>
        <Text
          fontSize={20}
          fontWeight="800"
          color="$color"
          textAlign="center"
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
        <Text
          fontSize={13}
          color="$colorMuted"
          tt="uppercase"
          letterSpacing={0.5}
          mt={11}
        >
          tap to flip
        </Text>
      </Animated.View>
    </AnimatedCard>
  );
}

export function FlashcardSm({
  term,
  definition,
  direction = "vertical",
  width,
  height,
  relativeProgress,
}: FlashcardSmProps) {
  const { flip, frontAnimatedStyle, backAnimatedStyle } = useFlipCard({
    direction,
    duration: 400,
  });

  const fallbackProgress = useSharedValue(0);
  const progress = relativeProgress ?? fallbackProgress;

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(progress.value),
      [0, 0.4],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Card
      h={height ?? "$13"}
      bg="transparent"
      onPress={flip}
      pos="relative"
      {...(width ? { width } : { w: "90%" })}
    >
      <CardFace
        style={frontAnimatedStyle}
        textStyle={textAnimatedStyle}
        text={cardSideText(term)}
      />
      <CardFace
        style={backAnimatedStyle}
        textStyle={textAnimatedStyle}
        text={cardSideText(definition)}
      />
    </Card>
  );
}

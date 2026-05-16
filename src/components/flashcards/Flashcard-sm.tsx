import { useState } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Card, Text } from "tamagui";

interface FlashcardSmProps {
  term: string;
  definition: string;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function FlashcardSm({ term, definition }: FlashcardSmProps) {
  const [isFront, setIsFront] = useState(true);

  const flipRotation = useSharedValue(0);

  const handlePress = () => {
    flipRotation.value = withTiming(isFront ? 180 : 0, { duration: 400 });
    setIsFront(!isFront);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipRotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateX: `${spin}deg` }],
      backfaceVisibility: "hidden",
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipRotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateX: `${spin}deg` }],
      backfaceVisibility: "hidden",
    };
  });
  console.log("adwdawdawd");
  return (
    <Card
      //   w="90%"
      maxWidth="$25"
      h="$13"
      bg="transparent"
      onPress={handlePress}
      pos="relative"
    >
      <AnimatedCard
        style={[frontAnimatedStyle]}
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
          color="$colorPrimary"
          textAlign="center"
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {term}
        </Text>
      </AnimatedCard>
      <AnimatedCard
        style={[backAnimatedStyle]}
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
          color="$colorPrimary"
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

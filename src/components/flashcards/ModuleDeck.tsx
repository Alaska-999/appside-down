import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { Lamp } from "@/src/components/ui/GlowSurface";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const DECK_HEIGHT = 212;
const CARD_TOP = 14;
const CARD_WIDTH = 294;
const CARD_HEIGHT = 182;
const CARD_RADIUS = 24;
const NEIGHBOUR_GAP = 18;
const NEIGHBOUR_OFFSET = CARD_WIDTH + NEIGHBOUR_GAP;
const NEIGHBOUR_OPACITY = 0.4;
const SWIPE_THRESHOLD = 60;
const SLIDE_DURATION = 420;
const FLIP_DURATION = 700;
const EASE = Easing.bezier(0.2, 0.85, 0.3, 1);

export type DeckCard = { id: string; term: string; definition: string };

const FACE = {
  position: "absolute" as const,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  backfaceVisibility: "hidden" as const,
};

function CardSurface({ children }: { children: ReactNode }) {
  return (
    <YStack
      w={CARD_WIDTH}
      h={CARD_HEIGHT}
      br={CARD_RADIUS}
      pos="relative"
      overflow="hidden"
    >
      <LiquidGlass
        intensity={45}
        tint="default"
        borderRadius={CARD_RADIUS}
        backgroundColor="rgba(20,28,34,0.6)"
      />
      <Lamp color="rgba(45,212,191,0.2)" />
      <GradientBorder
        radius={CARD_RADIUS}
        angle={138}
        colors={[
          "rgba(94,234,212,0.45)",
          "rgba(94,234,212,0.06)",
          "rgba(220,255,245,0.03)",
        ]}
        positions={[0, 0.46, 1]}
      />
      <YStack f={1} zIndex={2}>
        {children}
      </YStack>
    </YStack>
  );
}

function FaceText({ text }: { text: string }) {
  return (
    <YStack f={1} ai="center" jc="center" p={20}>
      <Text
        fontSize={20}
        fontWeight="700"
        lineHeight={26}
        textAlign="center"
        color="$color"
      >
        {text}
      </Text>
    </YStack>
  );
}

function DeckCardView({
  card,
  interactive,
}: {
  card: DeckCard;
  interactive: boolean;
}) {
  const spin = useSharedValue(0);
  const [hasBack, setHasBack] = useState(false);

  const toggle = useCallback(() => {
    hapticTap();
    setHasBack(true);
    spin.value = withTiming(spin.value < 90 ? 180 : 0, {
      duration: FLIP_DURATION,
      easing: EASE,
    });
  }, [spin]);

  useEffect(() => {
    if (!interactive) {
      spin.value = withTiming(0, { duration: FLIP_DURATION, easing: EASE });
    }
  }, [interactive, spin]);

  const tap = Gesture.Tap()
    .enabled(interactive)
    .maxDistance(10)
    .onEnd(() => {
      runOnJS(toggle)();
    });

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${spin.value}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${spin.value + 180}deg` }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        <Animated.View style={[FACE, frontStyle]}>
          <CardSurface>
            <FaceText text={card.term} />
          </CardSurface>
        </Animated.View>
        {hasBack && (
          <Animated.View style={[FACE, backStyle]}>
            <CardSurface>
              <FaceText text={card.definition} />
            </CardSurface>
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}

function DeckSlot({
  cardIndex,
  progress,
  children,
}: {
  cardIndex: number;
  progress: SharedValue<number>;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const x = (cardIndex - progress.value) * NEIGHBOUR_OFFSET;
    const distance = Math.min(Math.abs(x) / NEIGHBOUR_OFFSET, 1);
    return {
      transform: [{ translateX: x }],
      opacity: interpolate(distance, [0, 1], [1, NEIGHBOUR_OPACITY]),
    };
  }, [cardIndex]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: CARD_TOP,
          left: "50%",
          marginLeft: -CARD_WIDTH / 2,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Dots({ count, index }: { count: number; index: number }) {
  const visible = Math.min(count, 8);
  const start = Math.max(0, Math.min(index - Math.floor(visible / 2), count - visible));

  return (
    <XStack gap={5} jc="center" mt={10}>
      {Array.from({ length: visible }, (_, i) => {
        const actual = start + i;
        const on = actual === index;
        return (
          <YStack
            key={actual}
            w={on ? 18 : 5}
            h={5}
            br={on ? 3 : 999}
            bg={on ? undefined : "rgba(220,255,245,0.2)"}
            overflow="hidden"
          >
            {on && (
              <LinearGradient
                colors={["#2DD4BF", "#A3E635"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            )}
          </YStack>
        );
      })}
    </XStack>
  );
}

export function ModuleDeck({ cards }: { cards: DeckCard[] }) {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const progress = useSharedValue(0);
  const last = cards.length - 1;

  const gesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      runOnJS(setDragging)(true);
    })
    .onUpdate((e) => {
      const raw = index - e.translationX / NEIGHBOUR_OFFSET;
      if (raw < 0) progress.value = raw * 0.25;
      else if (raw > last) progress.value = last + (raw - last) * 0.25;
      else progress.value = raw;
    })
    .onEnd((e) => {
      const forward = e.translationX < -SWIPE_THRESHOLD && index < last;
      const back = e.translationX > SWIPE_THRESHOLD && index > 0;
      const target = forward ? index + 1 : back ? index - 1 : index;

      if (target !== index) runOnJS(setIndex)(target);

      progress.value = withTiming(target, {
        duration: target === index ? 240 : SLIDE_DURATION,
        easing: EASE,
      });
    })
    .onFinalize(() => {
      runOnJS(setDragging)(false);
    });

  if (!cards.length) return null;

  const reach = dragging ? 2 : 1;
  const window: number[] = [];
  for (let i = index - reach; i <= index + reach; i++) {
    if (i >= 0 && i <= last) window.push(i);
  }

  return (
    <YStack>
      <GestureDetector gesture={gesture}>
        <YStack h={DECK_HEIGHT} overflow="hidden">
          {window.map((i) => (
            <DeckSlot key={cards[i].id} cardIndex={i} progress={progress}>
              <DeckCardView card={cards[i]} interactive={i === index} />
            </DeckSlot>
          ))}
        </YStack>
      </GestureDetector>

      <Dots count={cards.length} index={index} />

      <XStack jc="center" mt={8} gap={3}>
        <Text fontSize={11.5} fontWeight="700" color="#5A6B7A">
          {index + 1}
        </Text>
        <Text fontSize={11.5} color="#5A6B7A">
          / {cards.length}
        </Text>
      </XStack>
    </YStack>
  );
}

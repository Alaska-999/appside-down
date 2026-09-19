import { Lamp } from "@/src/components/ui/surface/GlowSurface";
import { GradientBorder } from "@/src/components/ui/surface/GradientBorder";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { ICON_MINT, ICON_MINT_LIGHT } from "@/src/constants/iconColors";
import { EASE_STANDARD } from "@/src/constants/motion";
import { MODULE_DECK_EDGE_LIME } from "@/src/constants/rawColors";
import { SURFACE_CARD_HARD } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const CARD_TOP = 14;
export const DECK_CARD_RADIUS = 25;
const CARD_RATIO = 309 / 191;
const CARD_MAX_WIDTH = 346;
const DECK_SIDE_MARGIN = 42;
const DECK_BOTTOM_PAD = 17;
const NEIGHBOUR_GAP = 18;
const NEIGHBOUR_OPACITY = 0.4;
const SWIPE_THRESHOLD = 60;
const SLIDE_DURATION = 420;
const FLIP_DURATION = 700;

export type DeckCard = { id: string; term: string; definition: string };

export type DeckMetrics = {
  cardWidth: number;
  cardHeight: number;
  deckHeight: number;
  neighbourOffset: number;
};

export function useDeckMetrics(): DeckMetrics {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    const cardWidth = Math.min(
      CARD_MAX_WIDTH,
      Math.round(width - DECK_SIDE_MARGIN * 2),
    );
    const cardHeight = Math.round(cardWidth / CARD_RATIO);
    return {
      cardWidth,
      cardHeight,
      deckHeight: CARD_TOP + cardHeight + DECK_BOTTOM_PAD,
      neighbourOffset: cardWidth + NEIGHBOUR_GAP,
    };
  }, [width]);
}

function CardSurface({
  children,
  metrics,
}: {
  children: ReactNode;
  metrics: DeckMetrics;
}) {
  return (
    <YStack
      w={metrics.cardWidth}
      h={metrics.cardHeight}
      br={DECK_CARD_RADIUS}
      pos="relative"
      overflow="hidden"
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: SURFACE_CARD_HARD },
        ]}
      />
      <Lamp color={withAlpha(ICON_MINT, 0.2)} />
      <GradientBorder
        radius={DECK_CARD_RADIUS}
        angle={160}
        colors={[
          MODULE_DECK_EDGE_LIME,
          withAlpha(ICON_MINT_LIGHT, 0.6),
          withAlpha(ICON_MINT_LIGHT, 0.1),
        ]}
        positions={[0, 0.2, 0.9]}
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
  metrics,
}: {
  card: DeckCard;
  interactive: boolean;
  metrics: DeckMetrics;
}) {
  const spin = useSharedValue(0);
  const [hasBack, setHasBack] = useState(false);

  const toggle = useCallback(() => {
    hapticTap();
    setHasBack(true);
    spin.value = withTiming(spin.value < 90 ? 180 : 0, {
      duration: FLIP_DURATION,
      easing: EASE_STANDARD,
    });
  }, [spin]);

  useEffect(() => {
    if (!interactive) {
      spin.value = withTiming(0, {
        duration: FLIP_DURATION,
        easing: EASE_STANDARD,
      });
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

  const face = useMemo(
    () => ({
      position: "absolute" as const,
      width: metrics.cardWidth,
      height: metrics.cardHeight,
      backfaceVisibility: "hidden" as const,
    }),
    [metrics.cardWidth, metrics.cardHeight],
  );

  return (
    <GestureDetector gesture={tap}>
      <View
        collapsable={false}
        style={{ width: metrics.cardWidth, height: metrics.cardHeight }}
      >
        <Animated.View style={[face, frontStyle]}>
          <CardSurface metrics={metrics}>
            <FaceText text={card.term} />
          </CardSurface>
        </Animated.View>
        {hasBack && (
          <Animated.View style={[face, backStyle]}>
            <CardSurface metrics={metrics}>
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
  metrics,
  children,
}: {
  cardIndex: number;
  progress: SharedValue<number>;
  metrics: DeckMetrics;
  children: ReactNode;
}) {
  const offset = metrics.neighbourOffset;
  const style = useAnimatedStyle(() => {
    const x = (cardIndex - progress.value) * offset;
    const distance = Math.min(Math.abs(x) / offset, 1);
    return {
      transform: [{ translateX: x }],
      opacity: interpolate(distance, [0, 1], [1, NEIGHBOUR_OPACITY]),
    };
  }, [cardIndex, offset]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: CARD_TOP,
          left: "50%",
          marginLeft: -metrics.cardWidth / 2,
          width: metrics.cardWidth,
          height: metrics.cardHeight,
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
  const start = Math.max(
    0,
    Math.min(index - Math.floor(visible / 2), count - visible),
  );

  return (
    <XStack gap={6} jc="center" mt={5}>
      {Array.from({ length: visible }, (_, i) => {
        const actual = start + i;
        const on = actual === index;
        return (
          <YStack
            key={actual}
            w={on ? 18 : 6}
            h={6}
            br={on ? 3 : 999}
            bg={on ? undefined : "$mintGlassBorder"}
            overflow="hidden"
          >
            {on && (
              <LinearGradient
                colors={GRADIENT_PRIMARY}
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
  const metrics = useDeckMetrics();
  const offset = metrics.neighbourOffset;

  const gesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      runOnJS(setDragging)(true);
    })
    .onUpdate((e) => {
      const raw = index - e.translationX / offset;
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
        easing: EASE_STANDARD,
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
        <YStack h={metrics.deckHeight} overflow="hidden" collapsable={false}>
          {window.map((i) => (
            <DeckSlot
              key={cards[i].id}
              cardIndex={i}
              progress={progress}
              metrics={metrics}
            >
              <DeckCardView
                card={cards[i]}
                interactive={i === index}
                metrics={metrics}
              />
            </DeckSlot>
          ))}
        </YStack>
      </GestureDetector>

      <Dots count={cards.length} index={index} />

      {/* <XStack jc="center" mt={8} gap={3}>
        <Text fontSize={11.5} fontWeight="700" color="$mutedLight">
          {index + 1}
        </Text>
        <Text fontSize={11.5} color="$mutedLight">
          / {cards.length}
        </Text>
      </XStack> */}
    </YStack>
  );
}

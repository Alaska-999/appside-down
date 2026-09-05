import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_ACCENT,
  ICON_INDIGO,
  ICON_INDIGO_LIGHT,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MUTED,
  ICON_MUTED_LIGHT,
  ICON_WARNING,
} from "@/src/constants/iconColors";
import { useFlipCard } from "@/src/hooks/useFlipCard";
import {
  DEAD_ZONE,
  SwipeDecision,
  useSwipeCard,
} from "@/src/hooks/useSwipeCard";
import { Flashcard } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { hapticTap } from "@/src/utils/haptics";
import {
  BlurMask,
  Canvas,
  Group,
  RoundedRect,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { Star, Volume2 } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const STAMP_RAMP_DISTANCE = 70;

const CARD_RADIUS = 32;
const CARD_ACTION_INSET = 14;
const DRAG_SHADOW_DISTANCE = 60;
const LEARNING_SHADE = { distance: 140, maxOpacity: 0.3 };
const KNOW_GLOW = {
  distance: 140,
  margin: 64,
  spread: -14,
  blur: 30,
  color: "rgba(163,230,53,0.65)",
};

function useActionTaps(onStar?: () => void) {
  const star = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      hapticTap();
      onStar?.();
    });
  const tts = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      hapticTap();
    });
  return { star, tts };
}

const CALM_EDGE = {
  width: 1.6,
  angle: 158,
  colors: [
    "#9CFCEC",
    "rgba(94,234,212,0.55)",
    "rgba(94,234,212,0.08)",
    "rgba(220,255,245,0.02)",
    "rgba(163,230,53,0.16)",
  ],
  positions: [0, 0.18, 0.42, 0.7, 1],
};

const LIVE_EDGE = {
  width: 2.2,
  colors: [ICON_LIME_LIGHT, ICON_ACCENT, "rgba(94,234,212,0.25)", ICON_LIME_LIGHT],
  positions: [0, 0.3, 0.58, 1],
};

const LEARNING_EDGE = {
  width: 2.2,
  colors: [ICON_INDIGO_LIGHT, ICON_INDIGO, "rgba(129,140,248,0.2)", ICON_INDIGO_LIGHT],
  positions: [0, 0.34, 0.62, 1],
};

const STAMP_STYLES = {
  know: {
    solid: undefined as string | undefined,
    color: "$nearBlack",
    borderColor: undefined as string | undefined,
    shadowColor: "rgba(163,230,53,0.85)" as string | undefined,
  },
  learning: {
    solid: "rgba(67,56,202,0.5)" as string | undefined,
    color: "#C7D2FE",
    borderColor: "rgba(129,140,248,0.7)" as string | undefined,
    shadowColor: undefined as string | undefined,
  },
};

interface FlashcardLgProps {
  card: Flashcard | undefined;
  revertDirection?: "left" | "right";
  direction?: "horizontal" | "vertical";
  showDefinitionFirst?: boolean;
  onStar?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDecisionChange?: (decision: SwipeDecision) => void;
  revertKey?: number;
}

function Ghosts() {
  return (
    <>
      <View pointerEvents="none" style={styles.ghostG2} />
      <View pointerEvents="none" style={styles.ghost} />
    </>
  );
}

function Edge({ decision }: { decision: SwipeDecision }) {
  if (decision === "learning" || decision === "dragLeft") {
    return (
      <GradientBorder
        radius={CARD_RADIUS}
        width={LEARNING_EDGE.width}
        sweep
        sweepStartDeg={210}
        colors={LEARNING_EDGE.colors}
        positions={LEARNING_EDGE.positions}
      />
    );
  }
  if (decision === "dragRight" || decision === "know") {
    return (
      <GradientBorder
        radius={CARD_RADIUS}
        width={LIVE_EDGE.width}
        sweep
        sweepStartDeg={210}
        colors={LIVE_EDGE.colors}
        positions={LIVE_EDGE.positions}
      />
    );
  }
  return (
    <GradientBorder
      radius={CARD_RADIUS}
      width={CALM_EDGE.width}
      angle={CALM_EDGE.angle}
      colors={CALM_EDGE.colors}
      positions={CALM_EDGE.positions}
    />
  );
}

function StampFace({
  isKnow,
  progress,
  reducedMotion,
}: {
  isKnow: boolean;
  progress: SharedValue<number>;
  reducedMotion: boolean;
}) {
  const style = STAMP_STYLES[isKnow ? "know" : "learning"];

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const scale = reducedMotion ? 1 : 0.92 + p * 0.08;
    return {
      opacity: p,
      transform: [{ scale }],
      ...(isKnow ? { shadowOpacity: p } : null),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.stamp,
        {
          backgroundColor: style.solid,
          borderWidth: style.borderColor ? 1.4 : 0,
          borderColor: style.borderColor,
          shadowColor: style.shadowColor,
          shadowRadius: 13,
          shadowOffset: { width: 0, height: 0 },
        },
        animatedStyle,
      ]}
    >
      {isKnow && (
        <LinearGradient
          colors={[ICON_MINT, ICON_LIME]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.4 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text
        fontSize={15}
        fontWeight="700"
        letterSpacing={1.2}
        tt="uppercase"
        color={style.color}
        zIndex={1}
      >
        {isKnow ? "Know" : "Learning"}
      </Text>
    </Animated.View>
  );
}

function StampPair({
  translateX,
  reducedMotion,
}: {
  translateX: SharedValue<number>;
  reducedMotion: boolean;
}) {
  const knowProgress = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [DEAD_ZONE, DEAD_ZONE + STAMP_RAMP_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
  });
  const learningProgress = useDerivedValue(() => {
    return interpolate(
      -translateX.value,
      [DEAD_ZONE, DEAD_ZONE + STAMP_RAMP_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
  });

  return (
    <>
      <StampFace isKnow progress={knowProgress} reducedMotion={reducedMotion} />
      <StampFace
        isKnow={false}
        progress={learningProgress}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

type GlowRecipe = typeof KNOW_GLOW;

function DragGlow({
  translateX,
  recipe,
  sign,
}: {
  translateX: SharedValue<number>;
  recipe: GlowRecipe;
  sign: 1 | -1;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const opacity = useDerivedValue(() =>
    interpolate(
      sign * translateX.value,
      [DEAD_ZONE, DEAD_ZONE + recipe.distance],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  );
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height)
      setSize({ width, height });
  };
  const inset = recipe.margin - recipe.spread;
  const cardClip = rrect(
    rect(recipe.margin, recipe.margin, size.width, size.height),
    CARD_RADIUS,
    CARD_RADIUS,
  );

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
    >
      {size.width > 0 && (
        <Canvas
          style={{
            position: "absolute",
            top: -recipe.margin,
            left: -recipe.margin,
            width: size.width + recipe.margin * 2,
            height: size.height + recipe.margin * 2,
          }}
        >
          <Group opacity={opacity} clip={cardClip} invertClip>
            <RoundedRect
              x={inset}
              y={inset}
              width={size.width + recipe.spread * 2}
              height={size.height + recipe.spread * 2}
              r={CARD_RADIUS + recipe.spread}
              color={recipe.color}
            >
              <BlurMask blur={recipe.blur} style="normal" />
            </RoundedRect>
          </Group>
        </Canvas>
      )}
    </View>
  );
}

function LearningShade({ translateX }: { translateX: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      -translateX.value,
      [DEAD_ZONE, DEAD_ZONE + LEARNING_SHADE.distance],
      [0, LEARNING_SHADE.maxOpacity],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.learningShade, style]}
    />
  );
}

function CardFace({
  style,
  text,
  weak,
  active,
  actions,
  decision,
  translateX,
}: {
  style: object;
  text: string;
  weak?: boolean;
  active: boolean;
  actions: ReactNode;
  decision: SwipeDecision;
  translateX: SharedValue<number>;
}) {
  return (
    <Animated.View
      style={[styles.face, style]}
      pointerEvents={active ? "auto" : "none"}
    >
      <YStack f={1} br={CARD_RADIUS} overflow="hidden">
        <LiquidGlass
          intensity={22}
          backgroundColor="rgba(12,20,24,.5)"
          borderRadius={CARD_RADIUS}
        />
        <LearningShade translateX={translateX} />
        <View pointerEvents="none" style={styles.topHighlight} />
        {actions}
        <YStack f={1} ai="center" jc="center" pt={64} px={26} pb={30}>
          <Text
            fontSize={weak ? 25 : 32}
            fontWeight={weak ? "400" : "600"}
            letterSpacing={-0.32}
            lineHeight={weak ? 32 : 39}
            color={weak ? "#DCEBF2" : "$color"}
            textAlign="center"
            numberOfLines={8}
            ellipsizeMode="tail"
          >
            {text}
          </Text>
        </YStack>
      </YStack>
      <Edge decision={decision} />
    </Animated.View>
  );
}

export function FlashcardLg({
  card,
  revertDirection = "right",
  direction = "horizontal",
  showDefinitionFirst = false,
  onStar,
  onSwipeLeft,
  onSwipeRight,
  onDecisionChange,
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

  const frontTaps = useActionTaps(onStar);
  const backTaps = useActionTaps(onStar);

  const { gesture, cardAnimatedStyle, decision, translateX, reducedMotion } =
    useSwipeCard({
      onSwipeLeft,
      onSwipeRight,
      onTap: flip,
      onDecisionChange,
      resetKey: card?.id,
      revertKey,
      revertDirection,
      tapBlockers: [frontTaps.star, frontTaps.tts, backTaps.star, backTaps.tts],
    });

  const dragShadowStyle = useAnimatedStyle(() => {
    const drag = Math.min(Math.abs(translateX.value) / DRAG_SHADOW_DISTANCE, 1);
    return {
      shadowOpacity: interpolate(drag, [0, 1], [0.5, 0.78]),
      shadowRadius: interpolate(drag, [0, 1], [30, 40]),
      shadowOffset: { width: 0, height: interpolate(drag, [0, 1], [18, 30]) },
    };
  });

  const renderActions = (
    taps: ReturnType<typeof useActionTaps>,
    ttsColor: string,
  ) => (
    <XStack
      pos="absolute"
      top={CARD_ACTION_INSET}
      left={CARD_ACTION_INSET}
      right={CARD_ACTION_INSET}
      ai="center"
      jc="space-between"
      zIndex={5}
      p={1}
    >
      <GestureDetector gesture={taps.star}>
        <YStack
          w={40}
          h={40}
          br="$cardSoft"
          ai="center"
          jc="center"
          bg="rgba(220,255,245,0.05)"
        >
          <Star
            size={20}
            color={card?.isStarred ? ICON_WARNING : ICON_MUTED}
            strokeWidth={card?.isStarred ? 2.1 : 1.8}
          />
        </YStack>
      </GestureDetector>
      <GestureDetector gesture={taps.tts}>
        <YStack
          w={40}
          h={40}
          br="$cardSoft"
          ai="center"
          jc="center"
          bg="rgba(220,255,245,0.05)"
        >
          <Volume2 size={20} color={ttsColor} strokeWidth={1.8} />
        </YStack>
      </GestureDetector>
    </XStack>
  );

  return (
    <View style={styles.container}>
      <Ghosts />

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.bigcardWrap,
            cardAnimatedStyle,
            dragShadowStyle,
          ]}
        >
          <DragGlow translateX={translateX} recipe={KNOW_GLOW} sign={1} />
          <CardFace
            style={frontAnimatedStyle}
            text={front}
            active={isFront}
            actions={renderActions(frontTaps, "#3E4C57")}
            decision={decision}
            translateX={translateX}
          />
          <CardFace
            style={backAnimatedStyle}
            text={back}
            weak
            active={!isFront}
            actions={renderActions(backTaps, ICON_MUTED_LIGHT)}
            decision={decision}
            translateX={translateX}
          />
          <StampPair translateX={translateX} reducedMotion={reducedMotion} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  bigcardWrap: {
    borderRadius: CARD_RADIUS,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
  },
  face: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: CARD_RADIUS,
    backfaceVisibility: "hidden",
  },
  learningShade: {
    backgroundColor: "rgb(0, 10, 5)",
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  ghost: {
    position: "absolute",
    left: 11,
    right: 11,
    top: 14,
    bottom: -14,
    borderRadius: 30,
    zIndex: 1,
    backgroundColor: "rgba(14,24,28,0.45)",
  },
  ghostG2: {
    position: "absolute",
    left: 22,
    right: 22,
    top: 27,
    bottom: -27,
    borderRadius: 30,
    zIndex: 0,
    backgroundColor: "rgba(14,24,28,0.32)",
  },
  stamp: {
    position: "absolute",
    top: 40,
    zIndex: 6,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    overflow: "hidden",
    alignSelf: "center",
  },
});

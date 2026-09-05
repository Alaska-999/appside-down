import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { useFlipCard } from "@/src/hooks/useFlipCard";
import {
  DEAD_ZONE,
  SwipeDecision,
  useSwipeCard,
} from "@/src/hooks/useSwipeCard";
import { Flashcard } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { LinearGradient } from "expo-linear-gradient";
import { Star, Volume2 } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
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
  colors: ["#BEF264", "#5EEAD4", "rgba(94,234,212,0.25)", "#BEF264"],
  positions: [0, 0.3, 0.58, 1],
};

const LEARNING_EDGE = {
  width: 2.2,
  colors: ["#818CF8", "#4338CA", "rgba(129,140,248,0.2)", "#818CF8"],
  positions: [0, 0.34, 0.62, 1],
};

const STAMP_STYLES = {
  know: {
    solid: undefined as string | undefined,
    color: "#0D1117",
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
      transform: [{ rotate: isKnow ? "9deg" : "-9deg" }, { scale }],
      ...(isKnow ? { shadowOpacity: p } : null),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.stamp,
        isKnow ? styles.stampR : styles.stampL,
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
          colors={["#2DD4BF", "#A3E635"]}
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

function CardFace({
  style,
  text,
  weak,
}: {
  style: object;
  text: string;
  weak?: boolean;
}) {
  return (
    <Animated.View style={[styles.face, style]}>
      <YStack
        f={1}
        br={CARD_RADIUS}
        overflow="hidden"
        bg="rgba(7, 21, 29, 0.45)"
      >
        <LiquidGlass intensity={40} tint="default" borderRadius={CARD_RADIUS} />
        <View pointerEvents="none" style={styles.topHighlight} />
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

  const { gesture, cardAnimatedStyle, decision, translateX, reducedMotion } =
    useSwipeCard({
      onSwipeLeft,
      onSwipeRight,
      onTap: flip,
      onDecisionChange,
      resetKey: card?.id,
      revertKey,
      revertDirection,
    });

  const ttsColor = isFront ? "#3E4C57" : "#B7CEDA";

  return (
    <View style={styles.container}>
      <Ghosts />

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.bigcardWrap,
            cardAnimatedStyle,
          ]}
        >
          <CardFace style={frontAnimatedStyle} text={front} />
          <CardFace style={backAnimatedStyle} text={back} weak />
          <Edge decision={decision} />
          <StampPair translateX={translateX} reducedMotion={reducedMotion} />

          <XStack
            pos="absolute"
            top={0}
            left={0}
            right={0}
            height={60}
            ai="center"
            jc="space-between"
            px={12}
            zIndex={5}
          >
            <YStack
              w={40}
              h={40}
              br={20}
              ai="center"
              jc="center"
              bg="rgba(220,255,245,0.05)"
              onPress={onStar}
              pressStyle={{ scale: 0.9 }}
              hitSlop={4}
            >
              <Star
                size={20}
                color={card?.isStarred ? "#FCD34D" : "#8FA8B8"}
                fill={card?.isStarred ? "rgba(252,211,77,0.85)" : "none"}
                strokeWidth={1.8}
              />
            </YStack>
            <YStack
              w={40}
              h={40}
              br={20}
              ai="center"
              jc="center"
              bg="rgba(220,255,245,0.05)"
              hitSlop={4}
            >
              <Volume2 size={20} color={ttsColor} strokeWidth={1.8} />
            </YStack>
          </XStack>
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
    backgroundColor: "rgba(14,24,28,0.5)",
  },
  ghostG2: {
    position: "absolute",
    left: 22,
    right: 22,
    top: 26,
    bottom: -26,
    borderRadius: 30,
    zIndex: 0,
    backgroundColor: "rgba(14,24,28,0.32)",
  },
  stamp: {
    position: "absolute",
    top: 70,
    zIndex: 6,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    overflow: "hidden",
  },
  stampR: { right: 26 },
  stampL: { left: 26 },
});

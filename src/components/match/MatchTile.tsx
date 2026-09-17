import {
  GlowSurface,
  GlowSurfaceProps,
  LightLevel,
} from "@/src/components/ui/surface/GlowSurface";
import { RING_GLOW_BORDER } from "@/src/constants/focus";
import {
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_STATUS_DANGER,
  ICON_TEXT,
} from "@/src/constants/iconColors";
import {
  GLASS_SHEEN_TOP_LINE,
  TEXT_LIME_PALEST,
  TRANSPARENT_WHITE,
} from "@/src/constants/rawColors";
import { SURFACE_CARD } from "@/src/constants/surfaceAlpha";
import { MatchTileState } from "@/src/types";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "tamagui";

const TILE_RADIUS = 20;
const TILE_PAD_Y = 12;
const TILE_PAD_X = 8;
const TILE_BLUR = 30;
const RING_WIDTH = 1.5;
const TILE_GLOW: LightLevel = 2;

const TEXT_SIZE = 15;
const TEXT_LINE_HEIGHT = 19.2;
const TEXT_LETTER_SPACING = -0.15;
const TEXT_MIN_SCALE = 0.73;
const TEXT_MAX_LINES = 5;
const TEXT_MAX_FONT_SCALE = 1.2;

const MATCHED_HOLD_MS = 420;
const SETTLE_MS = 220;
const PRESS_SCALE = 0.982;
const PRESS_OPACITY = 0.82;

const SHAKE_EASING = Easing.bezier(0.36, 0.07, 0.19, 0.97);
const SHAKE_STEPS = [
  { x: -6, ms: 64 },
  { x: 5, ms: 80 },
  { x: -3, ms: 80 },
  { x: 2, ms: 64 },
  { x: 0, ms: 32 },
];

type TileVisual = MatchTileState;

type TileStyle = Partial<GlowSurfaceProps> & { textColor: string };

const STATE_STYLES: Record<TileVisual, TileStyle> = {
  idle: {
    fill: SURFACE_CARD,
    glow: TILE_GLOW,
    blurIntensity: TILE_BLUR,
    textColor: ICON_TEXT,
  },
  selected: {
    fill: withAlpha(ICON_MINT, 0.16),
    glow: 0,
    blurIntensity: TILE_BLUR,
    borderAngle: 138,
    borderColors: [TRANSPARENT_WHITE, TRANSPARENT_WHITE],
    borderPositions: [0, 1],
    textColor: ICON_TEXT,
  },
  wrong: {
    fill: withAlpha(ICON_STATUS_DANGER, 0.12),
    glow: 0,
    blurIntensity: TILE_BLUR,
    borderAngle: 150,
    borderColors: [TRANSPARENT_WHITE, TRANSPARENT_WHITE],
    borderPositions: [0, 1],
    textColor: ICON_TEXT,
  },
  matched: {
    fill: withAlpha(ICON_LIME, 0.14),
    glow: 0,
    blurIntensity: TILE_BLUR,
    borderAngle: 138,
    borderColors: [
      withAlpha(ICON_LIME_LIGHT, 0.6),
      withAlpha(ICON_LIME_LIGHT, 0.6),
    ],
    borderPositions: [0, 1],
    shadowColor: ICON_LIME_LIGHT,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 13,
    shadowOpacity: 0.9,
    textColor: TEXT_LIME_PALEST,
  },
};

const RING_COLORS: Partial<Record<TileVisual, string>> = {
  selected: RING_GLOW_BORDER,
  wrong: withAlpha(ICON_STATUS_DANGER, 0.7),
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  edgeLine: { position: "absolute", left: 0, right: 0, height: 1 },
  topSheen: { top: 0, backgroundColor: GLASS_SHEEN_TOP_LINE },
  ring: { borderRadius: TILE_RADIUS, borderWidth: RING_WIDTH, zIndex: 4 },
});

function TileUnderlay({ visual }: { visual: TileVisual }) {
  if (visual === "matched") {
    return (
      <View pointerEvents="none" style={[styles.edgeLine, styles.topSheen]} />
    );
  }
  return null;
}

function TileSurface({
  visual,
  text,
  onPress,
  reducedMotion,
}: {
  visual: TileVisual;
  text?: string;
  onPress?: () => void;
  reducedMotion?: boolean;
}) {
  const { textColor, ...surface } = STATE_STYLES[visual];
  const ringColor = RING_COLORS[visual];
  return (
    <GlowSurface
      f={1}
      radius={TILE_RADIUS}
      py={TILE_PAD_Y}
      px={TILE_PAD_X}
      ai="center"
      jc="center"
      tone="teal"
      underlay={<TileUnderlay visual={visual} />}
      overlay={
        ringColor ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.ring,
              { borderColor: ringColor },
            ]}
          />
        ) : undefined
      }
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? text : undefined}
      accessibilityState={
        onPress ? { selected: visual === "selected" } : undefined
      }
      {...surface}
      {...(onPress
        ? {
            onPress,
            pressStyle: reducedMotion
              ? { opacity: PRESS_OPACITY }
              : { scale: PRESS_SCALE },
            transition: "press",
          }
        : null)}
    >
      {text ? (
        <Text
          fontSize={TEXT_SIZE}
          fontWeight="600"
          lineHeight={TEXT_LINE_HEIGHT}
          letterSpacing={TEXT_LETTER_SPACING}
          color={textColor}
          ta="center"
          numberOfLines={TEXT_MAX_LINES}
          maxFontSizeMultiplier={TEXT_MAX_FONT_SCALE}
          adjustsFontSizeToFit
          minimumFontScale={TEXT_MIN_SCALE}
        >
          {text}
        </Text>
      ) : null}
    </GlowSurface>
  );
}

export function MatchTile({
  text,
  state,
  onPress,
}: {
  text: string;
  state: MatchTileState;
  onPress: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const shake = useSharedValue(0);
  const flash = useSharedValue(state === "matched" ? 0 : 1);
  const matched = state === "matched";

  useEffect(() => {
    if (state !== "wrong" || reducedMotion) {
      shake.value = 0;
      return;
    }
    shake.value = withSequence(
      ...SHAKE_STEPS.map((step) =>
        withTiming(step.x, { duration: step.ms, easing: SHAKE_EASING }),
      ),
    );
  }, [state, reducedMotion, shake]);

  useEffect(() => {
    if (state !== "matched") {
      flash.value = 1;
      return;
    }
    flash.value = 1;
    flash.value = withDelay(
      MATCHED_HOLD_MS,
      withTiming(0, { duration: reducedMotion ? 0 : SETTLE_MS }),
    );
  }, [state, reducedMotion, flash]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const handlePress = () => {
    hapticTap();
    onPress();
  };

  if (matched) {
    return (
      <View
        style={styles.root}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View style={[StyleSheet.absoluteFill, flashStyle]}>
          <TileSurface visual="matched" text={text} />
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.root, shakeStyle]}>
      <TileSurface
        visual={state}
        text={text}
        onPress={handlePress}
        reducedMotion={reducedMotion}
      />
    </Animated.View>
  );
}

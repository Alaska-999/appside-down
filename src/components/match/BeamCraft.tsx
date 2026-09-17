import {
  ICON_HERO_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_MINT_TINT_DARK,
  ICON_TEAL,
  ICON_TEAL_BRIGHT,
  ICON_TEXT,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import {
  GLASS_SHEEN_MED,
  PLANET_LIME_BRIGHT,
  PLANET_LIME_DARKEST,
  PLANET_LIME_DEEP,
  PLANET_LIME_MID,
  PLANET_TERMINATOR,
  SPARK_CORE,
  TEXT_LIME_PALEST,
  WHITE_SHEEN_MED,
} from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";
import {
  Blur,
  Canvas,
  Circle,
  Group,
  Skia,
  LinearGradient as SkiaLinearGradient,
  Path as SkiaPath,
  RadialGradient as SkiaRadialGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

export type BeamCraftTone = "record" | "chase";

const SCENE = 262;
const CENTER_X = SCENE / 2;
const PAD = 40;

const HULL_W = 168;
const HULL_H = 40;
const HULL_TOP = 46;
const DOME_W = 76;
const DOME_H = 44;
const DOME_TOP = 16;

const BEAM_TOP = 88;
const SOFT_W = 248;
const SOFT_H = 158;
const SOFT_BLUR = 9;
const CORE_W = 184;
const CORE_H = 152;
const CORE_BLUR = 4;
const POOL_TOP = 224;
const POOL_BLUR = 12;

const HOVER_LIFT = 5;
const HOVER_HALF_MS = 2600;
const BEAM_PULSE_LOW = 0.88;
const MOTE_RISE_MS = 4200;
const MOTE_RISE_PX = 92;
const MOTE_STAGGER_MS = 700;
const MOTE_LIT_SIZE = 7;
const MOTE_DIM_SIZE = 5;

const MOTE_SLOTS: { x: number; y: number }[] = [
  { x: 112, y: 206 },
  { x: 140, y: 214 },
  { x: 160, y: 200 },
  { x: 96, y: 196 },
  { x: 128, y: 190 },
  { x: 150, y: 184 },
];

type GradientStop = { offset: number; color: string };

interface ToneStyle {
  hullStops: GradientStop[];
  domeStops: GradientStop[];
  bloomColor: string;
  bloomSigma: number;
  rimUnder: string;
  softStops: GradientStop[];
  coreStops: GradientStop[];
  poolWidth: number;
  poolHeight: number;
  poolStops: GradientStop[];
  moteLit: string;
  moteLitGlow: string;
  moteDim: string;
}

const TONE_STYLES: Record<BeamCraftTone, ToneStyle> = {
  record: {
    hullStops: [
      { offset: 0, color: PLANET_LIME_BRIGHT },
      { offset: 0.22, color: PLANET_LIME_MID },
      { offset: 0.52, color: PLANET_LIME_DEEP },
      { offset: 0.88, color: PLANET_LIME_DARKEST },
    ],
    domeStops: [
      { offset: 0, color: TEXT_LIME_PALEST },
      { offset: 0.26, color: ICON_LIME_LIGHT },
      { offset: 0.58, color: ICON_HERO_LIME },
      { offset: 0.96, color: PLANET_LIME_DARKEST },
    ],
    bloomColor: withAlpha(ICON_LIME_LIGHT, 0.42),
    bloomSigma: 31,
    rimUnder: withAlpha(ICON_LIME_LIGHT, 0.18),
    softStops: [
      { offset: 0, color: withAlpha(ICON_MINT_LIGHT, 0.62) },
      { offset: 0.44, color: withAlpha(ICON_MINT_LIGHT, 0.34) },
      { offset: 0.78, color: withAlpha(ICON_LIME_LIGHT, 0.2) },
      { offset: 0.9, color: withAlpha(ICON_LIME_LIGHT, 0.065) },
      { offset: 1, color: withAlpha(ICON_LIME_LIGHT, 0) },
    ],
    coreStops: [
      { offset: 0, color: withAlpha(ICON_TEXT, 0.6) },
      { offset: 0.46, color: withAlpha(ICON_TEXT, 0.26) },
      { offset: 0.74, color: withAlpha(ICON_MINT_LIGHT, 0.167) },
      { offset: 0.9, color: withAlpha(ICON_MINT_LIGHT, 0.04) },
      { offset: 1, color: withAlpha(ICON_MINT_LIGHT, 0) },
    ],
    poolWidth: 210,
    poolHeight: 26,
    poolStops: [
      { offset: 0, color: withAlpha(ICON_LIME_LIGHT, 0.85) },
      { offset: 0.52, color: withAlpha(ICON_MINT_LIGHT, 0.4) },
      { offset: 0.78, color: withAlpha(ICON_MINT_LIGHT, 0) },
    ],
    moteLit: SPARK_CORE,
    moteLitGlow: withAlpha(ICON_LIME_LIGHT, 0.85),
    moteDim: withAlpha(ICON_TEXT, 0.16),
  },
  chase: {
    hullStops: [
      { offset: 0, color: ICON_MINT_LIGHT },
      { offset: 0.24, color: ICON_TEAL_BRIGHT },
      { offset: 0.54, color: PLANET_LIME_DEEP },
      { offset: 0.88, color: PLANET_LIME_DARKEST },
    ],
    domeStops: [
      { offset: 0, color: ICON_TEXT },
      { offset: 0.26, color: ICON_MINT_LIGHT },
      { offset: 0.58, color: ICON_TEAL },
      { offset: 0.96, color: PLANET_LIME_DARKEST },
    ],
    bloomColor: withAlpha(ICON_TEAL_BRIGHT, 0.34),
    bloomSigma: 22,
    rimUnder: withAlpha(ICON_MINT_LIGHT, 0.18),
    softStops: [
      { offset: 0, color: withAlpha(ICON_MINT_LIGHT, 0.44) },
      { offset: 0.48, color: withAlpha(ICON_MINT_LIGHT, 0.22) },
      { offset: 0.74, color: withAlpha(ICON_MINT, 0.13) },
      { offset: 0.9, color: withAlpha(ICON_MINT, 0.043) },
      { offset: 1, color: withAlpha(ICON_MINT, 0) },
    ],
    coreStops: [
      { offset: 0, color: withAlpha(ICON_TEXT, 0.38) },
      { offset: 0.46, color: withAlpha(ICON_TEXT, 0.16) },
      { offset: 0.74, color: withAlpha(ICON_MINT_LIGHT, 0.1) },
      { offset: 0.9, color: withAlpha(ICON_MINT_LIGHT, 0.036) },
      { offset: 1, color: withAlpha(ICON_MINT_TINT_DARK, 0) },
    ],
    poolWidth: 190,
    poolHeight: 22,
    poolStops: [
      { offset: 0, color: withAlpha(ICON_MINT_LIGHT, 0.6) },
      { offset: 0.54, color: withAlpha(ICON_TEAL_BRIGHT, 0.26) },
      { offset: 0.8, color: withAlpha(ICON_TEAL_BRIGHT, 0) },
    ],
    moteLit: ICON_TEXT,
    moteLitGlow: withAlpha(ICON_MINT_LIGHT, 0.8),
    moteDim: withAlpha(ICON_TEXT, 0.16),
  },
};

function conePath(
  width: number,
  height: number,
  topRatioLeft: number,
  topRatioRight: number,
  bottomRatioLeft: number,
  bottomRatioRight: number,
) {
  const left = CENTER_X - width / 2 + PAD;
  const top = BEAM_TOP + PAD;
  const path = Skia.Path.Make();
  path.moveTo(left + width * topRatioLeft, top);
  path.lineTo(left + width * topRatioRight, top);
  path.lineTo(left + width * bottomRatioRight, top + height);
  path.lineTo(left + width * bottomRatioLeft, top + height);
  path.close();
  return path;
}

function BeamField({
  tone,
  hover,
  reducedMotion,
}: {
  tone: BeamCraftTone;
  hover: SharedValue<number>;
  reducedMotion: boolean;
}) {
  const t = TONE_STYLES[tone];
  const pulse = useSharedValue(reducedMotion ? 1 : BEAM_PULSE_LOW);

  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(
      withTiming(1, {
        duration: HOVER_HALF_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [reducedMotion, pulse]);

  const softPath = useMemo(
    () => conePath(SOFT_W, SOFT_H, 0.38, 0.62, 0, 1),
    [],
  );
  const corePath = useMemo(
    () => conePath(CORE_W, CORE_H, 0.45, 0.55, 0.26, 0.74),
    [],
  );

  const bloomTransform = useDerivedValue(() => [{ translateY: hover.value }]);

  const poolCx = CENTER_X + PAD;
  const poolR = t.poolWidth / 2;
  const poolCy = POOL_TOP + PAD + t.poolHeight / 2;
  const hullCx = CENTER_X + PAD;
  const hullCy = HULL_TOP + PAD + HULL_H / 2;

  const beamTopY = BEAM_TOP + PAD;

  return (
    <Canvas
      style={{
        position: "absolute",
        left: -PAD,
        top: -PAD,
        width: SCENE + PAD * 2,
        height: SCENE + PAD * 2,
      }}
      pointerEvents="none"
    >
      <Group
        origin={vec(poolCx, poolCy)}
        transform={[{ scaleY: t.poolHeight / t.poolWidth }]}
      >
        <Group>
          <Blur blur={POOL_BLUR} />
          <Circle cx={poolCx} cy={poolCy} r={poolR}>
            <SkiaRadialGradient
              c={vec(poolCx, poolCy)}
              r={poolR}
              colors={t.poolStops.map((s) => s.color)}
              positions={t.poolStops.map((s) => s.offset)}
            />
          </Circle>
        </Group>
      </Group>

      <Group opacity={pulse}>
        <SkiaPath path={softPath}>
          <Blur blur={SOFT_BLUR} />
          <SkiaLinearGradient
            start={vec(0, beamTopY)}
            end={vec(0, beamTopY + SOFT_H)}
            colors={t.softStops.map((s) => s.color)}
            positions={t.softStops.map((s) => s.offset)}
          />
        </SkiaPath>
        <SkiaPath path={corePath}>
          <Blur blur={CORE_BLUR} />
          <SkiaLinearGradient
            start={vec(0, beamTopY)}
            end={vec(0, beamTopY + CORE_H)}
            colors={t.coreStops.map((s) => s.color)}
            positions={t.coreStops.map((s) => s.offset)}
          />
        </SkiaPath>
      </Group>

      <Group transform={bloomTransform}>
        <Group
          origin={vec(hullCx, hullCy)}
          transform={[{ scaleY: HULL_H / HULL_W }]}
        >
          <Group>
            <Blur blur={t.bloomSigma} />
            <Circle
              cx={hullCx}
              cy={hullCy}
              r={HULL_W / 2}
              color={t.bloomColor}
            />
          </Group>
        </Group>
      </Group>
    </Canvas>
  );
}

function Hull({ tone }: { tone: BeamCraftTone }) {
  const t = TONE_STYLES[tone];
  const cx = HULL_W / 2;
  const cy = HULL_H / 2;

  return (
    <Svg width={HULL_W} height={HULL_H} viewBox={`0 0 ${HULL_W} ${HULL_H}`}>
      <Defs>
        <RadialGradient id="craftHull" cx="34%" cy="22%" rx="65.5%" ry="150%">
          {t.hullStops.map((s) => (
            <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </RadialGradient>
        <LinearGradient id="craftHullTerm" x1="60%" y1="0%" x2="40%" y2="100%">
          <Stop offset="0" stopColor={PLANET_TERMINATOR} stopOpacity={0.66} />
          <Stop offset="0.56" stopColor={PLANET_TERMINATOR} stopOpacity={0} />
        </LinearGradient>
        <Filter id="craftHullSpec" x="-60%" y="-60%" width="220%" height="220%">
          <FeGaussianBlur stdDeviation={4} />
        </Filter>
        <Filter
          id="craftHullUnder"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <FeGaussianBlur stdDeviation={3} />
        </Filter>
        <ClipPath id="craftHullClip">
          <Ellipse cx={cx} cy={cy} rx={cx} ry={cy} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#craftHullClip)">
        <Rect
          x={0}
          y={0}
          width={HULL_W}
          height={HULL_H}
          fill="url(#craftHull)"
        />
        <Ellipse
          cx={50}
          cy={9}
          rx={25}
          ry={4}
          fill={WHITE_SHEEN_MED}
          filter="url(#craftHullSpec)"
          transform="rotate(-8 50 9)"
        />
        <Rect
          x={0}
          y={0}
          width={HULL_W}
          height={HULL_H}
          fill="url(#craftHullTerm)"
        />
        <Path
          d={`M 2 ${cy} A 82 18 0 0 0 166 ${cy}`}
          stroke={t.rimUnder}
          strokeWidth={2}
          fill="none"
          filter="url(#craftHullUnder)"
        />
      </G>
      <Path
        d={`M 0.5 ${cy} A ${cx - 0.5} ${cy - 0.5} 0 0 1 ${HULL_W - 0.5} ${cy}`}
        stroke={GLASS_SHEEN_MED}
        strokeWidth={1}
        fill="none"
      />
    </Svg>
  );
}

const DOME_TOP_RX = 34.83;
const DOME_TOP_RY = 40.33;
const DOME_BOTTOM_RX = 5.5;
const DOME_BOTTOM_RY = 3.67;
const DOME_PATH = [
  `M 0 ${DOME_TOP_RY}`,
  `A ${DOME_TOP_RX} ${DOME_TOP_RY} 0 0 1 ${DOME_TOP_RX} 0`,
  `L ${DOME_W - DOME_TOP_RX} 0`,
  `A ${DOME_TOP_RX} ${DOME_TOP_RY} 0 0 1 ${DOME_W} ${DOME_TOP_RY}`,
  `A ${DOME_BOTTOM_RX} ${DOME_BOTTOM_RY} 0 0 1 ${DOME_W - DOME_BOTTOM_RX} ${DOME_H}`,
  `L ${DOME_BOTTOM_RX} ${DOME_H}`,
  `A ${DOME_BOTTOM_RX} ${DOME_BOTTOM_RY} 0 0 1 0 ${DOME_TOP_RY}`,
  "Z",
].join(" ");

function Dome({ tone }: { tone: BeamCraftTone }) {
  const t = TONE_STYLES[tone];

  return (
    <Svg width={DOME_W} height={DOME_H} viewBox={`0 0 ${DOME_W} ${DOME_H}`}>
      <Defs>
        <RadialGradient id="craftDome" cx="32%" cy="20%" rx="79%" ry="123%">
          {t.domeStops.map((s) => (
            <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </RadialGradient>
        <Filter id="craftDomeSpec" x="-60%" y="-60%" width="220%" height="220%">
          <FeGaussianBlur stdDeviation={4} />
        </Filter>
        <ClipPath id="craftDomeClip">
          <Path d={DOME_PATH} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#craftDomeClip)">
        <Rect
          x={0}
          y={0}
          width={DOME_W}
          height={DOME_H}
          fill="url(#craftDome)"
        />
        <Ellipse
          cx={27}
          cy={13.5}
          rx={13}
          ry={6.5}
          fill={WHITE_SHEEN_MED}
          filter="url(#craftDomeSpec)"
          transform="rotate(-18 27 13.5)"
        />
      </G>
      <Path
        d={DOME_PATH}
        stroke={withAlpha(ICON_WHITE, 0.14)}
        strokeWidth={1}
        fill="none"
      />
    </Svg>
  );
}

function Craft({
  tone,
  hover,
}: {
  tone: BeamCraftTone;
  hover: SharedValue<number>;
}) {
  const hoverStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hover.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 0,
        },
        hoverStyle,
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: DOME_TOP,
          left: CENTER_X - DOME_W / 2,
          width: DOME_W,
          height: DOME_H,
        }}
      >
        <Dome tone={tone} />
      </View>
      <View
        style={{
          position: "absolute",
          top: HULL_TOP,
          left: CENTER_X - HULL_W / 2,
          width: HULL_W,
          height: HULL_H,
        }}
      >
        <Hull tone={tone} />
      </View>
    </Animated.View>
  );
}

function Mote({
  slot,
  lit,
  tone,
  delay,
  reducedMotion,
}: {
  slot: { x: number; y: number };
  lit: boolean;
  tone: BeamCraftTone;
  delay: number;
  reducedMotion: boolean;
}) {
  const t = TONE_STYLES[tone];
  const size = lit ? MOTE_LIT_SIZE : MOTE_DIM_SIZE;
  const rise = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    rise.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: MOTE_RISE_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false,
      ),
    );
  }, [reducedMotion, delay, rise]);

  const riseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rise.value, [0, 0.18, 0.82, 1], [0, 1, 0.6, 0]),
    transform: [{ translateY: -MOTE_RISE_PX * rise.value }],
  }));

  const base = {
    position: "absolute" as const,
    left: slot.x,
    top: slot.y,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: lit ? t.moteLit : t.moteDim,
    ...(lit
      ? {
          shadowColor: t.moteLitGlow,
          shadowOpacity: 1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
        }
      : null),
  };

  if (reducedMotion) {
    return <View pointerEvents="none" style={base} />;
  }

  return <Animated.View pointerEvents="none" style={[base, riseStyle]} />;
}

interface BeamCraftProps {
  tone: BeamCraftTone;
  pairs: number;
  clean: number;
}

export function BeamCraft({ tone, pairs, clean }: BeamCraftProps) {
  const reducedMotion = useReducedMotion();
  const hover = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    hover.value = withRepeat(
      withSequence(
        withTiming(-HOVER_LIFT, {
          duration: HOVER_HALF_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: HOVER_HALF_MS,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, hover]);

  const slots = MOTE_SLOTS.slice(
    0,
    Math.max(0, Math.min(pairs, MOTE_SLOTS.length)),
  );
  const litCount = Math.max(0, Math.min(clean, slots.length));

  return (
    <View style={{ width: SCENE, height: SCENE }} pointerEvents="none">
      <BeamField tone={tone} hover={hover} reducedMotion={reducedMotion} />
      {slots.map((slot, index) => (
        <Mote
          key={`${slot.x}-${slot.y}`}
          slot={slot}
          lit={index < litCount}
          tone={tone}
          delay={index * MOTE_STAGGER_MS}
          reducedMotion={reducedMotion}
        />
      ))}
      <Craft tone={tone} hover={hover} />
    </View>
  );
}

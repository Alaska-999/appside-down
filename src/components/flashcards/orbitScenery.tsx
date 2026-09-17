import { CENTER } from "@/src/components/flashcards/OrbitProgress";
import {
  ellipseTable,
  pointAt,
} from "@/src/components/flashcards/orbitGeometry";
import {
  ORBIT_STATE_STYLES,
  OrbitState,
} from "@/src/components/flashcards/orbitState";
import {
  ICON_HERO_LIME,
  ICON_LIME,
  ICON_MINT,
  ICON_TEAL,
} from "@/src/constants/iconColors";
import { SPARK_CORE } from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";
import {
  Blur,
  Circle,
  Group,
  RadialGradient as SkiaRadialGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  Easing,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const TWO_PI = Math.PI * 2;

const NEBULA_R = 148;
const NEBULA_BLUR = 34;
const NEBULA_MS = 26000;
const NEBULA_SHIFT = 12;

const NEBULA_COLORS: Record<OrbitState, string[]> = {
  cool: [
    withAlpha(ICON_MINT, 0.09),
    withAlpha(ICON_TEAL, 0.05),
    withAlpha(ICON_TEAL, 0),
  ],
  green: [
    withAlpha(ICON_LIME, 0.09),
    withAlpha(ICON_HERO_LIME, 0.05),
    withAlpha(ICON_HERO_LIME, 0),
  ],
};

export function OrbitNebula({
  state,
  reducedMotion,
}: {
  state: OrbitState;
  reducedMotion: boolean;
}) {
  const clock = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    clock.value = withRepeat(
      withTiming(1, { duration: NEBULA_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reducedMotion, clock]);

  const shift = useDerivedValue(() => [
    { translateX: NEBULA_SHIFT * Math.sin(TWO_PI * clock.value) },
    { translateY: NEBULA_SHIFT * 0.6 * Math.cos(TWO_PI * clock.value) },
  ]);

  return (
    <Group transform={shift}>
      <Blur blur={NEBULA_BLUR} />
      <Circle cx={CENTER} cy={CENTER} r={NEBULA_R}>
        <SkiaRadialGradient
          c={vec(CENTER, CENTER)}
          r={NEBULA_R}
          colors={NEBULA_COLORS[state]}
          positions={[0, 0.55, 1]}
        />
      </Circle>
    </Group>
  );
}

const DUST_RX = 128;
const DUST_RATIO = 0.3;
const DUST_TILT = 24;
const DUST_MS = 9000;
const DUST_BLUR = 2;

interface DustSpeck {
  offset: number;
  r: number;
  alpha: number;
  flicker: number;
}

const DUST_SPECKS: DustSpeck[] = [
  { offset: 0, r: 2.5, alpha: 0.75, flicker: 1 },
  { offset: 0.19, r: 1.8, alpha: 0.5, flicker: 1.6 },
  { offset: 0.37, r: 2.2, alpha: 0.62, flicker: 0.8 },
  { offset: 0.58, r: 1.6, alpha: 0.45, flicker: 2.1 },
  { offset: 0.79, r: 2.8, alpha: 0.7, flicker: 1.3 },
];

function DustSpeckDot({
  speck,
  clock,
  table,
  color,
}: {
  speck: DustSpeck;
  clock: SharedValue<number>;
  table: ReturnType<typeof ellipseTable>;
  color: string;
}) {
  const at = useDerivedValue(() => (clock.value + speck.offset) % 1);
  const cx = useDerivedValue(() => pointAt(table, at.value).x);
  const cy = useDerivedValue(() => pointAt(table, at.value).y);
  const opacity = useDerivedValue(() => {
    const wave = Math.sin(
      TWO_PI * (clock.value * speck.flicker + speck.offset),
    );
    return speck.alpha * (0.4 + 0.6 * wave);
  });

  return <Circle cx={cx} cy={cy} r={speck.r} opacity={opacity} color={color} />;
}

export function OrbitDust({
  state,
  reducedMotion,
}: {
  state: OrbitState;
  reducedMotion: boolean;
}) {
  const clock = useSharedValue(0);
  const table = useMemo(
    () =>
      ellipseTable(CENTER, CENTER, DUST_RX, DUST_RX * DUST_RATIO, DUST_TILT),
    [],
  );

  useEffect(() => {
    if (reducedMotion) return;
    clock.value = withRepeat(
      withTiming(1, { duration: DUST_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reducedMotion, clock]);

  return (
    <Group>
      <Blur blur={DUST_BLUR} />
      {DUST_SPECKS.map((speck) => (
        <DustSpeckDot
          key={speck.offset}
          speck={speck}
          clock={clock}
          table={table}
          color={ORBIT_STATE_STYLES[state].beadGlow}
        />
      ))}
    </Group>
  );
}

const SPARK_MS = 5200;
const SPARK_BLUR = 2;

interface SparkSlot {
  x: number;
  y: number;
  r: number;
  rise: number;
  phase: number;
}

const SPARK_SLOTS: SparkSlot[] = [
  { x: 52, y: 206, r: 2.2, rise: 58, phase: 0 },
  { x: 88, y: 232, r: 3.2, rise: 84, phase: 0.31 },
  { x: 126, y: 214, r: 2.6, rise: 70, phase: 0.62 },
  { x: 158, y: 240, r: 3.6, rise: 92, phase: 0.14 },
  { x: 196, y: 208, r: 2.4, rise: 64, phase: 0.45 },
  { x: 228, y: 228, r: 2.9, rise: 78, phase: 0.76 },
  { x: 70, y: 178, r: 1.8, rise: 52, phase: 0.22 },
  { x: 212, y: 182, r: 2, rise: 56, phase: 0.88 },
];

function RisingSpark({
  slot,
  clock,
}: {
  slot: SparkSlot;
  clock: SharedValue<number>;
}) {
  const at = useDerivedValue(() => (clock.value + slot.phase) % 1);
  const cy = useDerivedValue(() => slot.y - slot.rise * at.value);
  const opacity = useDerivedValue(() => {
    const t = at.value;
    if (t < 0.18) return t / 0.18;
    if (t > 0.82) return ((1 - t) / 0.18) * 0.6;
    return 1 - ((t - 0.18) / 0.64) * 0.4;
  });

  return (
    <Circle
      cx={slot.x}
      cy={cy}
      r={slot.r}
      opacity={opacity}
      color={SPARK_CORE}
    />
  );
}

export function RisingSparks({ reducedMotion }: { reducedMotion: boolean }) {
  const clock = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    clock.value = withRepeat(
      withTiming(1, { duration: SPARK_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reducedMotion, clock]);

  return (
    <Group>
      <Blur blur={SPARK_BLUR} />
      {SPARK_SLOTS.map((slot) => (
        <RisingSpark key={slot.phase} slot={slot} clock={clock} />
      ))}
    </Group>
  );
}

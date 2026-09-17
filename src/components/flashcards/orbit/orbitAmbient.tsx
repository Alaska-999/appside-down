import { CENTER, PLANET_R } from "@/src/components/flashcards/orbit/orbitLayout";
import {
  ellipseTable,
  pointAt,
} from "@/src/components/flashcards/orbit/orbitGeometry";
import { TWO_PI, clamp01 } from "@/src/components/flashcards/orbit/orbitMath";
import { OrbitState } from "@/src/components/flashcards/orbit/orbitState";
import {
  ICON_ACCENT,
  ICON_CYAN_TEAL,
  ICON_HERO_LIME,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_TINT_DARK,
  ICON_TEAL,
  ICON_TEXT,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import { SPARK_CORE, TEXT_LIME_PALE } from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";
import type { SkPath } from "@shopify/react-native-skia";
import {
  Blur,
  Circle,
  Group,
  Path as SkiaPath,
  RadialGradient as SkiaRadialGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  Easing,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const CLOSURE_AT = 0.999;
const CLOSURE_MS = 1100;
const CLOSURE_ATTACK = 0.18;
const CLOSURE_REST = 0.22;
const FLASH_BLOOM_W = 20;
const FLASH_BLOOM_BLUR = 10;
const FLASH_BLOOM_PEAK = 0.2;
const FLASH_CORE_W = 7;
const FLASH_CORE_BLUR = 2;
const GLOW_BREATHE = 1.12;
const GLOW_PULSE_LOW = 0.68;
const GLOW_BREATHE_MS = 1600;

const GLOW_INNER_K = 0.77;
const GLOW_BAND_K = { near: 0.32, far: 0.68, edge: 1 };

type GlowSlot = "core" | "inner" | "limb" | keyof typeof GLOW_BAND_K;

interface GlowShape {
  spread: number;
  blur: number;
}

const GLOW_SHAPE: Record<OrbitState, GlowShape> = {
  cool: { spread: 19, blur: 19 },
  green: { spread: 19, blur: 19 },
};

function glowRadius(slot: GlowSlot, spread: number) {
  if (slot === "core") return 0;
  if (slot === "inner") return PLANET_R * GLOW_INNER_K;
  if (slot === "limb") return PLANET_R;
  return PLANET_R + spread * GLOW_BAND_K[slot];
}

interface GlowStop {
  slot: GlowSlot;
  color: string;
  alpha: number;
}

const GLOW_STOPS: Record<OrbitState, GlowStop[]> = {
  cool: [
    { slot: "inner", color: ICON_ACCENT, alpha: 0.2 },
    { slot: "limb", color: ICON_MINT, alpha: 0.13 },
    { slot: "near", color: ICON_TEAL, alpha: 0.3 },
    { slot: "far", color: ICON_CYAN_TEAL, alpha: 0.35 },
    { slot: "edge", color: ICON_MINT_TINT_DARK, alpha: 0.07 },
  ],
  green: [
    { slot: "core", color: ICON_TEXT, alpha: 0.6 },
    { slot: "inner", color: TEXT_LIME_PALE, alpha: 0.12 },
    { slot: "limb", color: ICON_LIME_LIGHT, alpha: 0.13 },
    { slot: "near", color: ICON_LIME, alpha: 0.14 },
    { slot: "far", color: ICON_HERO_LIME, alpha: 0.15 },
    { slot: "edge", color: ICON_HERO_LIME, alpha: 0 },
  ],
};
function envelope(t: number) {
  "worklet";
  const attack = t < CLOSURE_ATTACK ? t / CLOSURE_ATTACK : 1;
  const tail = (t - CLOSURE_ATTACK) / (1 - CLOSURE_ATTACK);
  const settle = clamp01(tail);
  return { attack, settle };
}

export function useRingClosure(
  travelled: SharedValue<number>,
  hot: boolean,
  reducedMotion: boolean,
) {
  const closure = useSharedValue(0);

  useAnimatedReaction(
    () => hot && travelled.value >= CLOSURE_AT,
    (closed, wasClosed) => {
      if (!closed) return;
      if (wasClosed === null || reducedMotion) {
        closure.value = 1;
        return;
      }
      if (wasClosed) return;
      closure.value = withTiming(1, {
        duration: CLOSURE_MS,
        easing: Easing.linear,
      });
    },
    [hot, reducedMotion],
  );

  return closure;
}

export function ClosureFlash({
  path,
  closure,
}: {
  path: SkPath;
  closure: SharedValue<number>;
}) {
  const bloom = useDerivedValue(() => {
    const { attack, settle } = envelope(closure.value);
    return attack * (1 + (CLOSURE_REST - 1) * settle) * FLASH_BLOOM_PEAK;
  });
  const core = useDerivedValue(() => {
    const { attack, settle } = envelope(closure.value);
    return attack * (1 - settle);
  });

  return (
    <>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={FLASH_BLOOM_W}
        strokeCap="round"
        opacity={bloom}
        color={ICON_LIME_LIGHT}
      >
        <Blur blur={FLASH_BLOOM_BLUR} />
      </SkiaPath>
      <SkiaPath
        path={path}
        style="stroke"
        strokeWidth={FLASH_CORE_W}
        strokeCap="round"
        opacity={core}
        color={ICON_TEXT}
      >
        <Blur blur={FLASH_CORE_BLUR} />
      </SkiaPath>
    </>
  );
}

export function PlanetGlow({
  cx,
  cy,
  state,
  reducedMotion,
}: {
  cx: number;
  cy: number;
  state: OrbitState;
  reducedMotion: boolean;
}) {
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    breathe.value = withRepeat(
      withTiming(GLOW_BREATHE, {
        duration: GLOW_BREATHE_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [reducedMotion, breathe]);

  const swell = useDerivedValue(() => [{ scale: breathe.value }]);
  const pulse = useDerivedValue(() => {
    const phase = (breathe.value - 1) / (GLOW_BREATHE - 1);
    return GLOW_PULSE_LOW + (1 - GLOW_PULSE_LOW) * phase;
  });
  const stops = GLOW_STOPS[state];
  const shape = GLOW_SHAPE[state];
  const radius = PLANET_R + shape.spread;

  return (
    <Group transform={swell} origin={vec(cx, cy)} opacity={pulse}>
      <Blur blur={shape.blur} />
      <Circle cx={cx} cy={cy} r={radius}>
        <SkiaRadialGradient
          c={vec(cx, cy)}
          r={radius}
          colors={stops.map((stop) => withAlpha(stop.color, stop.alpha))}
          positions={stops.map(
            (stop) => glowRadius(stop.slot, shape.spread) / radius,
          )}
        />
      </Circle>
    </Group>
  );
}

interface MoteSpec {
  x: number;
  y: number;
  r: number;
  ampX: number;
  ampY: number;
  phase: number;
  opacity: number;
}

const MOTES: MoteSpec[] = [
  { x: 40, y: 72, r: 3.4, ampX: 9, ampY: 14, phase: 0, opacity: 0.5 },
  { x: 214, y: 58, r: 2.6, ampX: 12, ampY: 9, phase: 0.18, opacity: 0.38 },
  { x: 236, y: 178, r: 3.8, ampX: 8, ampY: 16, phase: 0.36, opacity: 0.44 },
  { x: 28, y: 186, r: 2.8, ampX: 13, ampY: 10, phase: 0.55, opacity: 0.34 },
  { x: 132, y: 28, r: 2.4, ampX: 10, ampY: 12, phase: 0.72, opacity: 0.3 },
  { x: 120, y: 236, r: 3.2, ampX: 11, ampY: 11, phase: 0.88, opacity: 0.4 },
  { x: 74, y: 18, r: 1.6, ampX: 7, ampY: 9, phase: 0.08, opacity: 0.26 },
  { x: 250, y: 108, r: 1.9, ampX: 6, ampY: 12, phase: 0.24, opacity: 0.32 },
  { x: 16, y: 126, r: 2.1, ampX: 9, ampY: 7, phase: 0.42, opacity: 0.28 },
  { x: 196, y: 244, r: 1.7, ampX: 8, ampY: 11, phase: 0.61, opacity: 0.24 },
  { x: 62, y: 250, r: 2.3, ampX: 10, ampY: 8, phase: 0.78, opacity: 0.3 },
  { x: 178, y: 14, r: 1.5, ampX: 6, ampY: 10, phase: 0.14, opacity: 0.22 },
  { x: 8, y: 48, r: 1.8, ampX: 11, ampY: 6, phase: 0.49, opacity: 0.26 },
  { x: 244, y: 218, r: 2.0, ampX: 7, ampY: 13, phase: 0.94, opacity: 0.28 },
];

function Mote({ spec, clock }: { spec: MoteSpec; clock: { value: number } }) {
  const cx = useDerivedValue(
    () => spec.x + spec.ampX * Math.sin(TWO_PI * (clock.value + spec.phase)),
  );
  const cy = useDerivedValue(
    () => spec.y + spec.ampY * Math.cos(TWO_PI * (clock.value + spec.phase)),
  );
  const opacity = useDerivedValue(() => {
    const wave = Math.sin(TWO_PI * (clock.value * 2 + spec.phase));
    return spec.opacity * (0.55 + 0.45 * wave);
  });

  return (
    <Circle cx={cx} cy={cy} r={spec.r} opacity={opacity} color={ICON_TEXT} />
  );
}

export function DriftMotes({ reducedMotion }: { reducedMotion: boolean }) {
  const clock = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    clock.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reducedMotion, clock]);

  return (
    <Group>
      <Blur blur={3.5} />
      {MOTES.map((spec) => (
        <Mote key={`${spec.x}-${spec.y}`} spec={spec} clock={clock} />
      ))}
    </Group>
  );
}

const COMET_MS = 48000;
const COMET_HIDDEN_SHARE = 0.07;
const COMET_HEAD_R = 5;
const COMET_GLOW_R = 10;
const COMET_GLOW_BLUR = 7;
const COMET_TAIL_BLUR = 3;
const COMET_HIDE_FADE = 14;
const COMET_SPEC_R = 1.9;
const COMET_SPEC_DX = -1.7;
const COMET_SPEC_DY = -1.9;
const COMET_SPEC_BLUR = 1.2;

interface CometDot {
  back: number;
  r: number;
  alpha: number;
}

const COMET_TAIL: CometDot[] = [
  { back: 0.007, r: 4.6, alpha: 0.72 },
  { back: 0.015, r: 3.8, alpha: 0.54 },
  { back: 0.024, r: 3, alpha: 0.38 },
  { back: 0.034, r: 2.3, alpha: 0.19 },
  { back: 0.045, r: 1.7, alpha: 0.1 },
];

function cometWarp(u: number, h0: number, h1: number) {
  "worklet";
  if (h1 <= h0) return u;
  const visible = 1 - (h1 - h0);
  if (visible <= 0) return u;
  const a = (h0 / visible) * (1 - COMET_HIDDEN_SHARE);
  const b = a + COMET_HIDDEN_SHARE;
  if (u < a) return a > 0 ? (u / a) * h0 : h0;
  if (u < b) return h0 + ((u - a) / COMET_HIDDEN_SHARE) * (h1 - h0);
  return h1 + ((u - b) / (1 - b)) * (1 - h1);
}

function hiddenSpan(table: ReturnType<typeof ellipseTable>) {
  let first = -1;
  let last = -1;
  const half = Math.floor((table.xs.length - 1) / 2);
  for (let i = 0; i <= half; i++) {
    const dx = table.xs[i] - CENTER;
    const dy = table.ys[i] - CENTER;
    if (Math.sqrt(dx * dx + dy * dy) < PLANET_R) {
      if (first < 0) first = i;
      last = i;
    }
  }
  if (first < 0) return { h0: 0, h1: 0 };
  const n = table.xs.length - 1;
  return { h0: first / n, h1: last / n };
}

function useCometPoint(
  table: ReturnType<typeof ellipseTable>,
  clock: SharedValue<number>,
  back: number,
  alpha: number,
) {
  const at = useDerivedValue(() => {
    const t = clock.value - back;
    return t < 0 ? t + 1 : t;
  });
  const point = useDerivedValue(() => pointAt(table, at.value));
  const cx = useDerivedValue(() => point.value.x);
  const cy = useDerivedValue(() => point.value.y);
  const opacity = useDerivedValue(() => {
    const p = point.value;
    const dx = p.x - CENTER;
    const dy = p.y - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (at.value >= 0.5) return alpha;
    const room = (dist - PLANET_R) / COMET_HIDE_FADE;
    return alpha * clamp01(room);
  });
  return { cx, cy, opacity };
}

function CometTailDot({
  table,
  clock,
  dot,
}: {
  table: ReturnType<typeof ellipseTable>;
  clock: SharedValue<number>;
  dot: CometDot;
}) {
  const { cx, cy, opacity } = useCometPoint(table, clock, dot.back, dot.alpha);
  return (
    <Circle cx={cx} cy={cy} r={dot.r} opacity={opacity} color={ICON_LIME} />
  );
}

export function OrbitComet({
  rx,
  ry,
  reducedMotion,
}: {
  rx: number;
  ry: number;
  reducedMotion: boolean;
}) {
  const clock = useSharedValue(0);
  const table = useMemo(
    () => ellipseTable(CENTER, CENTER, rx, ry, 0),
    [rx, ry],
  );

  useEffect(() => {
    if (reducedMotion) return;
    clock.value = withRepeat(
      withTiming(1, { duration: COMET_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reducedMotion, clock]);

  const { h0, h1 } = useMemo(() => hiddenSpan(table), [table]);
  const warped = useDerivedValue(() => cometWarp(clock.value, h0, h1));
  const head = useCometPoint(table, warped, 0, 1);
  const headCenter = useDerivedValue(() => vec(head.cx.value, head.cy.value));
  const specX = useDerivedValue(() => head.cx.value + COMET_SPEC_DX);
  const specY = useDerivedValue(() => head.cy.value + COMET_SPEC_DY);

  return (
    <Group>
      <Group>
        <Blur blur={COMET_TAIL_BLUR} />
        {COMET_TAIL.map((dot) => (
          <CometTailDot key={dot.back} table={table} clock={warped} dot={dot} />
        ))}
      </Group>
      <Group>
        <Blur blur={COMET_GLOW_BLUR} />
        <Circle
          cx={head.cx}
          cy={head.cy}
          r={COMET_GLOW_R}
          opacity={head.opacity}
          color={withAlpha(ICON_LIME, 0.8)}
        />
      </Group>
      <Circle cx={head.cx} cy={head.cy} r={COMET_HEAD_R} opacity={head.opacity}>
        <SkiaRadialGradient
          c={headCenter}
          r={COMET_HEAD_R}
          colors={[SPARK_CORE, ICON_LIME, ICON_HERO_LIME]}
          positions={[0, 0.5, 1]}
        />
      </Circle>
      <Group>
        <Blur blur={COMET_SPEC_BLUR} />
        <Circle
          cx={specX}
          cy={specY}
          r={COMET_SPEC_R}
          opacity={head.opacity}
          color={withAlpha(ICON_WHITE, 0.85)}
        />
      </Group>
    </Group>
  );
}

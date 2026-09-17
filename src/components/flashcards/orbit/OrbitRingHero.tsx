import {
  CENTER,
  ORB_SIZE,
  PLANET_R,
} from "@/src/components/flashcards/orbit/orbitLayout";
import { Planet } from "@/src/components/flashcards/orbit/OrbitProgress";
import {
  ClosureFlash,
  DriftMotes,
  OrbitComet,
  PlanetGlow,
  useRingClosure,
} from "@/src/components/flashcards/orbit/orbitAmbient";
import {
  ellipseTable,
  pointAt,
} from "@/src/components/flashcards/orbit/orbitGeometry";
import {
  clamp01,
  clampTo,
  toRad,
} from "@/src/components/flashcards/orbit/orbitMath";
import { halfPath } from "@/src/components/flashcards/orbit/orbitPaths";
import { orbitStateFor } from "@/src/components/flashcards/orbit/orbitState";
import {
  ICON_CYAN_TEAL,
  ICON_HERO_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_TEXT,
} from "@/src/constants/iconColors";
import { PLANET_TERMINATOR, TEXT_LIME_PALE } from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";
import type { SkPath } from "@shopify/react-native-skia";
import {
  Blur,
  Canvas,
  DashPathEffect,
  Group,
  Skia,
  LinearGradient as SkiaLinearGradient,
  Path as SkiaPath,
  Rect as SkiaRect,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import {
  Easing,
  SharedValue,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { OrbitBead } from "./OrbitBead";

const PAD = 40;
const CANVAS_BOX = ORB_SIZE + PAD * 2;
const CANVAS_STYLE = {
  position: "absolute",
  left: -PAD,
  top: -PAD,
  width: CANVAS_BOX,
  height: CANVAS_BOX,
} as const;
const RING_RX = 119;
const RING_RY = 37;
const RING_TILT = -14;
const SHADOW_W = PLANET_R * 2;
const BODY_W = 7;
const GLOW_W = 9;
const GLOW_BLUR = 6;
const GLOW_OPACITY = 0.5;
const GLOW_LAG = 0.12;
const TIP_FADE = 0.16;
const LEAD_BLOOM = 0.05;
const RING_START = 270;
const BEAD_REVEAL = 16;
const BLOOM_W = 11;
const BLOOM_BLUR = 10;
const BLOOM_OPACITY = 0.1;
const ARC_COLORS = [ICON_MINT, ICON_MINT_LIGHT, ICON_LIME_LIGHT, ICON_TEXT];
const ARC_POSITIONS = [0, 0.38, 0.78, 1];
const GHOST_W = 7;
const GHOST_OPACITY = 0.2;
const GHOST_GLOW_W = 14;
const GHOST_GLOW_BLUR = 3;
const GHOST_DASH_W = 1.2;
const GHOST_DASH: [number, number] = [2, 7];
const GHOST_COLORS = [ICON_CYAN_TEAL, ICON_HERO_LIME, ICON_MINT_LIGHT];
const GHOST_POSITIONS = [0, 0.5, 1];
const GHOST_DASH_COLORS = [
  withAlpha(ICON_TEXT, 0.38),
  withAlpha(TEXT_LIME_PALE, 0.28),
  withAlpha(ICON_HERO_LIME, 0.18),
];
const GHOST_DRIFT_MS = 9000;
const GHOST_DRIFT_SPAN = 46;
const GHOST_GLOW_LOW = 0.07;
const GHOST_GLOW_HIGH = 0.16;
const FADE_STEPS = [
  { from: 1, to: 0.875, blur: 1.2, body: 0.96, glow: 0.5 },
  { from: 0.875, to: 0.75, blur: 1.4, body: 0.88, glow: 0.48 },
  { from: 0.75, to: 0.625, blur: 1.6, body: 0.76, glow: 0.45 },
  { from: 0.625, to: 0.5, blur: 1.8, body: 0.62, glow: 0.41 },
  { from: 0.5, to: 0.375, blur: 2, body: 0.46, glow: 0.35 },
  { from: 0.375, to: 0.25, blur: 2.2, body: 0.31, glow: 0.28 },
  { from: 0.25, to: 0.125, blur: 2.4, body: 0.18, glow: 0.2 },
  { from: 0.125, to: 0, blur: 2.6, body: 0.07, glow: 0.12 },
];
const SHADOW_H = 18;

const BOB_PX = 2;
const BOB_PERIOD = 1.8;
const LOW_PROGRESS_AT = 0.3;
const LOW_GLOW_BOOST = 1.6;
const LOW_ORBIT_BOOST = 1.45;
const TILT_SWING_DEG = 9;
const TILT_PERIOD = 2.4;

interface ThinOrbit {
  rx: number;
  ratio: number;
  tilt: number;
  color: string;
  width: number;
  dash: [number, number];
  pulseMs: number;
  delayMs: number;
  comet?: boolean;
}

const THIN_ORBITS: ThinOrbit[] = [
  {
    rx: 120,
    ratio: 0.3,
    tilt: 18,
    color: withAlpha(ICON_MINT_LIGHT, 0.7),
    width: 1.3,
    dash: [1.5, 8],
    pulseMs: 3200,
    delayMs: 0,
  },
  {
    rx: 138,
    ratio: 0.27,
    tilt: -26,
    comet: true,
    color: withAlpha(ICON_LIME_LIGHT, 0.55),
    width: 1.3,
    dash: [1.5, 9],
    pulseMs: 4000,
    delayMs: 1200,
  },
  {
    rx: 154,
    ratio: 0.24,
    tilt: 40,
    color: withAlpha(ICON_TEXT, 0.45),
    width: 1.2,
    dash: [1.2, 10],
    pulseMs: 4800,
    delayMs: 2400,
  },
];

function ThinOrbits({
  side,
  boost,
  reducedMotion,
}: {
  side: "back" | "front";
  boost: number;
  reducedMotion: boolean;
}) {
  return (
    <>
      {THIN_ORBITS.map((orbit) => (
        <ThinOrbitPath
          key={`${orbit.rx}-${orbit.tilt}-${side}`}
          orbit={orbit}
          side={side}
          boost={boost}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  );
}

function ThinOrbitPath({
  orbit,
  side,
  boost,
  reducedMotion,
}: {
  orbit: ThinOrbit;
  side: "back" | "front";
  boost: number;
  reducedMotion: boolean;
}) {
  const pulse = useSharedValue(reducedMotion ? 0.8 : 0.42);
  const phase = useSharedValue(0);
  const bob = useSharedValue(-BOB_PX);
  const tilt = useSharedValue(-1);

  useEffect(() => {
    if (reducedMotion) return;
    bob.value = withDelay(
      orbit.delayMs,
      withRepeat(
        withTiming(BOB_PX, {
          duration: orbit.pulseMs * BOB_PERIOD,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    pulse.value = withDelay(
      orbit.delayMs,
      withRepeat(
        withTiming(1, {
          duration: orbit.pulseMs / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    phase.value = withRepeat(
      withTiming(-(orbit.dash[0] + orbit.dash[1]) * 12, {
        duration: 9000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    tilt.value = withDelay(
      orbit.delayMs,
      withRepeat(
        withTiming(1, {
          duration: orbit.pulseMs * TILT_PERIOD,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, [reducedMotion, orbit, pulse, phase, bob, tilt]);

  const path = useMemo(
    () => halfPath(orbit.rx, orbit.rx * orbit.ratio, side === "back" ? 180 : 0),
    [orbit, side],
  );

  const opacity = useDerivedValue(() => {
    const base = side === "front" ? pulse.value : pulse.value * 0.72;
    return clamp01(base * boost);
  });
  const sway = useDerivedValue(() => [{ translateY: bob.value }]);
  const baseRad = toRad(orbit.tilt);
  const swingRad = toRad(TILT_SWING_DEG * (orbit.tilt < 0 ? -1 : 1));
  const turn = useDerivedValue(() => [
    { translateX: CENTER },
    { translateY: CENTER },
    { rotate: baseRad + swingRad * tilt.value },
    { translateX: -CENTER },
    { translateY: -CENTER },
  ]);

  return (
    <Group transform={sway}>
      <Group transform={turn} opacity={opacity}>
        <SkiaPath
          path={path}
          style="stroke"
          strokeWidth={orbit.width}
          strokeCap="round"
          color={orbit.color}
        >
          <DashPathEffect intervals={orbit.dash} phase={phase} />
        </SkiaPath>
      </Group>
      {orbit.comet && side === "front" && (
        <Group transform={turn}>
          <OrbitComet
            rx={orbit.rx}
            ry={orbit.rx * orbit.ratio}
            reducedMotion={reducedMotion}
          />
        </Group>
      )}
    </Group>
  );
}

function ArcStroke({
  path,
  start,
  end,
  width,
  blur,
  opacity,
}: {
  path: SkPath;
  start: SharedValue<number> | number;
  end: SharedValue<number> | number;
  width: number;
  blur?: number;
  opacity?: number;
}) {
  return (
    <SkiaPath
      path={path}
      start={start}
      end={end}
      style="stroke"
      strokeWidth={width}
      strokeCap="round"
      opacity={opacity}
    >
      {blur ? <Blur blur={blur} /> : null}
      <SkiaLinearGradient
        start={vec(CENTER - RING_RX, CENTER)}
        end={vec(CENTER + RING_RX, CENTER)}
        colors={ARC_COLORS}
        positions={ARC_POSITIONS}
      />
    </SkiaPath>
  );
}

function GhostStroke({
  path,
  drift,
  width,
  colors,
  blur,
  dash,
  opacity,
}: {
  path: SkPath;
  drift: SharedValue<number>;
  width: number;
  colors: string[];
  blur?: number;
  dash?: [number, number];
  opacity?: SharedValue<number> | number;
}) {
  const slide = useDerivedValue(() => GHOST_DRIFT_SPAN * (drift.value * 2 - 1));
  const gradientStart = useDerivedValue(() =>
    vec(CENTER - RING_RX + slide.value, CENTER),
  );
  const gradientEnd = useDerivedValue(() =>
    vec(CENTER + RING_RX + slide.value, CENTER),
  );

  return (
    <SkiaPath path={path} style="stroke" strokeWidth={width} opacity={opacity}>
      {blur ? <Blur blur={blur} /> : null}
      {dash ? <DashPathEffect intervals={dash} /> : null}
      <SkiaLinearGradient
        start={gradientStart}
        end={gradientEnd}
        colors={colors}
        positions={GHOST_POSITIONS}
      />
    </SkiaPath>
  );
}

function GhostArc({
  startDeg,
  drift,
}: {
  startDeg: number;
  drift: SharedValue<number>;
}) {
  const path = useMemo(() => halfPath(RING_RX, RING_RY, startDeg), [startDeg]);
  const glowOpacity = useDerivedValue(
    () => GHOST_GLOW_LOW + (GHOST_GLOW_HIGH - GHOST_GLOW_LOW) * drift.value,
  );

  return (
    <>
      <GhostStroke
        path={path}
        drift={drift}
        width={GHOST_GLOW_W}
        colors={GHOST_COLORS}
        blur={GHOST_GLOW_BLUR}
        opacity={glowOpacity}
      />
      <GhostStroke
        path={path}
        drift={drift}
        width={GHOST_W}
        colors={GHOST_COLORS}
        opacity={GHOST_OPACITY}
      />
      <GhostStroke
        path={path}
        drift={drift}
        width={GHOST_DASH_W}
        colors={GHOST_DASH_COLORS}
        dash={GHOST_DASH}
      />
    </>
  );
}

type FadeLayer = "glow" | "body";

function FadeSegment({
  path,
  end,
  fade,
  step,
  layer,
  boost,
  lo,
  hi,
}: {
  path: SkPath;
  end: SharedValue<number>;
  fade: SharedValue<number>;
  step: (typeof FADE_STEPS)[number];
  layer: FadeLayer;
  boost: number;
  lo: number;
  hi: number;
}) {
  const lag = layer === "glow" ? GLOW_LAG : 0;
  const segStart = useDerivedValue(() =>
    clampTo(end.value - fade.value * (step.from - lag), lo, hi),
  );
  const segEnd = useDerivedValue(() =>
    clampTo(end.value - fade.value * (step.to - lag), lo, hi),
  );

  return (
    <ArcStroke
      path={path}
      start={segStart}
      end={segEnd}
      width={layer === "glow" ? GLOW_W : BODY_W}
      blur={layer === "glow" ? GLOW_BLUR : step.blur}
      opacity={layer === "glow" ? Math.min(step.glow * boost, 1) : step.body}
    />
  );
}

function LeadBloom({
  path,
  end,
  bloom,
  lo,
  hi,
}: {
  path: SkPath;
  end: SharedValue<number>;
  bloom: SharedValue<number>;
  lo: number;
  hi: number;
}) {
  const segStart = useDerivedValue(() => clampTo(end.value, lo, hi));
  const segEnd = useDerivedValue(() =>
    clampTo(end.value + bloom.value, lo, hi),
  );

  return (
    <ArcStroke
      path={path}
      start={segStart}
      end={segEnd}
      width={BLOOM_W}
      blur={BLOOM_BLUR}
      opacity={BLOOM_OPACITY}
    />
  );
}

function ProgressArc({
  path,
  from,
  to,
  end,
  boost,
}: {
  path: SkPath;
  from: number;
  to: number;
  end: SharedValue<number>;
  boost: number;
}) {
  const span = to - from;

  const drawn = useDerivedValue(() => clampTo(end.value, from, to) - from);
  const taper = useDerivedValue(() => {
    const near = span > 0 ? drawn.value / span : 0;
    return clamp01((1 - near) * 14) * clamp01(drawn.value / (TIP_FADE * 2));
  });
  const fade = useDerivedValue(() => TIP_FADE * taper.value);
  const bloom = useDerivedValue(() => LEAD_BLOOM * taper.value);
  const bodyEnd = useDerivedValue(() =>
    clampTo(end.value - fade.value, from, to),
  );
  const glowEnd = useDerivedValue(() =>
    clampTo(end.value - fade.value * (1 - GLOW_LAG), from, to),
  );

  return (
    <>
      <ArcStroke
        path={path}
        start={from}
        end={glowEnd}
        width={GLOW_W}
        blur={GLOW_BLUR}
        opacity={Math.min(GLOW_OPACITY * boost, 1)}
      />
      {FADE_STEPS.map((step) => (
        <FadeSegment
          key={`glow-${step.from}`}
          path={path}
          end={end}
          fade={fade}
          step={step}
          layer="glow"
          boost={boost}
          lo={from}
          hi={to}
        />
      ))}
      <LeadBloom path={path} end={end} bloom={bloom} lo={from} hi={to} />
      <ArcStroke path={path} start={from} end={bodyEnd} width={BODY_W} />
      {FADE_STEPS.map((step) => (
        <FadeSegment
          key={`body-${step.from}`}
          path={path}
          end={end}
          fade={fade}
          step={step}
          layer="body"
          boost={1}
          lo={from}
          hi={to}
        />
      ))}
    </>
  );
}

function RingShadow() {
  const clip = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(CENTER, CENTER, PLANET_R);
    return path;
  }, []);

  return (
    <Group clip={clip}>
      <Group
        transform={[{ rotate: toRad(RING_TILT) }]}
        origin={vec(CENTER, CENTER)}
        opacity={0.55}
      >
        <Blur blur={7} />
        <SkiaRect
          x={CENTER - SHADOW_W / 2}
          y={CENTER - SHADOW_H / 2}
          width={SHADOW_W}
          height={SHADOW_H}
        >
          <SkiaLinearGradient
            start={vec(0, CENTER - SHADOW_H / 2)}
            end={vec(0, CENTER + SHADOW_H / 2)}
            colors={[
              withAlpha(PLANET_TERMINATOR, 0),
              withAlpha(PLANET_TERMINATOR, 0.85),
              withAlpha(PLANET_TERMINATOR, 0),
            ]}
            positions={[0, 0.5, 1]}
          />
        </SkiaRect>
      </Group>
    </Group>
  );
}

interface OrbitRingHeroProps {
  progress: SharedValue<number>;
  fraction: number;
  hot?: boolean;
}

export function OrbitRingHero({
  progress,
  fraction,
  hot = false,
}: OrbitRingHeroProps) {
  const reducedMotion = useReducedMotion();
  const state = orbitStateFor(fraction);
  const low = fraction < LOW_PROGRESS_AT;
  const glowBoost = low ? LOW_GLOW_BOOST : 1.1;
  const orbitBoost = low ? LOW_ORBIT_BOOST : 1.1;

  const drift = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    drift.value = withRepeat(
      withTiming(1, {
        duration: GHOST_DRIFT_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [reducedMotion, drift]);

  const backArc = useMemo(() => halfPath(RING_RX, RING_RY, 180), []);
  const frontArc = useMemo(() => halfPath(RING_RX, RING_RY, 0), []);
  const table = useMemo(
    () => ellipseTable(CENTER, CENTER, RING_RX, RING_RY, RING_TILT, RING_START),
    [],
  );

  const travelled = useDerivedValue(() => progress.value * fraction);
  const backLateEnd = useDerivedValue(
    () => 0.5 + clamp01(travelled.value / 0.25) * 0.5,
  );
  const frontEnd = useDerivedValue(() =>
    clamp01((travelled.value - 0.25) / 0.5),
  );
  const backEarlyEnd = useDerivedValue(
    () => clamp01((travelled.value - 0.75) / 0.25) * 0.5,
  );

  const closure = useRingClosure(travelled, hot, reducedMotion);

  const beadPoint = useDerivedValue(() => pointAt(table, travelled.value));
  const beadX = useDerivedValue(() => beadPoint.value.x);
  const beadY = useDerivedValue(() => beadPoint.value.y);
  const beadOpacity = useDerivedValue<number>(() => {
    const onBack = travelled.value < 0.25 || travelled.value >= 0.75;
    if (!onBack) return 1;
    const dx = beadX.value - CENTER;
    const dy = beadY.value - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return clamp01((dist - PLANET_R) / BEAD_REVEAL);
  });

  return (
    <View style={{ width: ORB_SIZE, height: ORB_SIZE }}>
      <Canvas style={CANVAS_STYLE} pointerEvents="none">
        <Group transform={[{ translateX: PAD }, { translateY: PAD }]}>
          <DriftMotes reducedMotion={reducedMotion} />
          <ThinOrbits
            side="back"
            boost={orbitBoost}
            reducedMotion={reducedMotion}
          />
          <PlanetGlow
            cx={CENTER}
            cy={CENTER}
            state={state}
            reducedMotion={reducedMotion}
          />
          {hot && (
            <PlanetGlow
              cx={CENTER}
              cy={CENTER}
              state={state}
              reducedMotion={reducedMotion}
            />
          )}
          <Group
            transform={[{ rotate: toRad(RING_TILT) }]}
            origin={vec(CENTER, CENTER)}
          >
            <GhostArc startDeg={180} drift={drift} />
            <ProgressArc
              path={backArc}
              from={0.5}
              to={1}
              end={backLateEnd}
              boost={glowBoost}
            />
            <ProgressArc
              path={backArc}
              from={0}
              to={0.5}
              end={backEarlyEnd}
              boost={glowBoost}
            />
            {hot && <ClosureFlash path={backArc} closure={closure} />}
          </Group>
        </Group>
      </Canvas>

      <Planet hot={hot} state={state} halo="canvas" />

      <Canvas style={CANVAS_STYLE} pointerEvents="none">
        <Group transform={[{ translateX: PAD }, { translateY: PAD }]}>
          <RingShadow />
          <Group
            transform={[{ rotate: toRad(RING_TILT) }]}
            origin={vec(CENTER, CENTER)}
          >
            <GhostArc startDeg={0} drift={drift} />
            <ProgressArc
              path={frontArc}
              from={0}
              to={1}
              end={frontEnd}
              boost={glowBoost}
            />
            {hot && <ClosureFlash path={frontArc} closure={closure} />}
          </Group>
          <ThinOrbits
            side="front"
            boost={orbitBoost}
            reducedMotion={reducedMotion}
          />
        </Group>
      </Canvas>

      <OrbitBead
        x={beadX}
        y={beadY}
        opacity={beadOpacity}
        state={state}
        reducedMotion={reducedMotion}
      />
    </View>
  );
}

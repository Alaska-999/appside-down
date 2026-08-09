import { useEffect, type ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import {
  Blur,
  Canvas,
  ColorMatrix,
  Fill,
  Group,
  LinearGradient,
  Paint,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  Easing,
  interpolate,
  interpolateColor,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

export type MeshVariant =
  | "mesh-full"
  | "mesh-dark"
  | "fall-morph"
  | "breathe-core";

interface Props {
  variant?: MeshVariant;
}

const MOCKUP_SCALE = 390 / 250;

const MINT = "#2DD4BF";
const MINT_LIGHT = "#5EEAD4";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const INDIGO_BRIGHT = "#6366F1";
const LIME = "#A3E635";
const DARK_BASE = "#11141F";
const DARK_TEAL = "#11302F";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const TEAL_FADE = "rgba(13, 148, 136, 0.3)";
const LIME_FADE = "rgba(163, 230, 53, 0.4)";

const EASE = Easing.inOut(Easing.quad);

function saturateMatrix(saturation: number): number[] {
  return [
    0.213 + 0.787 * saturation,
    0.715 - 0.715 * saturation,
    0.072 - 0.072 * saturation,
    0,
    0,
    0.213 - 0.213 * saturation,
    0.715 + 0.285 * saturation,
    0.072 - 0.072 * saturation,
    0,
    0,
    0.213 - 0.213 * saturation,
    0.715 - 0.715 * saturation,
    0.072 + 0.928 * saturation,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function pct(fraction: number, size: number, inset: number) {
  "worklet";
  return size * (fraction * (1 + 2 * inset) - inset);
}

function expandedBox(width: number, height: number, inset: number) {
  return {
    originX: -inset * width,
    originY: -inset * height,
    boxWidth: width * (1 + 2 * inset),
    boxHeight: height * (1 + 2 * inset),
  };
}

function angleToLine(
  angleDeg: number,
  originX: number,
  originY: number,
  boxWidth: number,
  boxHeight: number,
) {
  "worklet";
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const halfW = boxWidth / 2;
  const halfH = boxHeight / 2;
  const length = Math.abs(dx * halfW) + Math.abs(dy * halfH);
  const cx = originX + halfW;
  const cy = originY + halfH;
  return {
    start: vec(cx - dx * length, cy - dy * length),
    end: vec(cx + dx * length, cy + dy * length),
  };
}

function useLoopPhase(
  totalDuration: number,
  steps: number,
  reducedMotion: boolean,
): SharedValue<number> {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      phase.value = 0;
      return;
    }

    const segmentDuration = totalDuration / steps;
    const segments = Array.from({ length: steps }, (_, index) =>
      withTiming(index + 1, { duration: segmentDuration, easing: EASE }),
    );
    phase.value = withRepeat(withSequence(...segments), -1, false);
  }, [phase, totalDuration, steps, reducedMotion]);

  return phase;
}

function usePingPongPhase(
  fullDuration: number,
  reducedMotion: boolean,
): SharedValue<number> {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      phase.value = 0;
      return;
    }

    phase.value = withRepeat(
      withTiming(1, { duration: fullDuration / 2, easing: EASE }),
      -1,
      true,
    );
  }, [phase, fullDuration, reducedMotion]);

  return phase;
}

function MeshCanvas({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>{children}</Canvas>
    </View>
  );
}

const MESH_FULL_INSET = 0.12;
const MESH_FULL_BLUR = 6 * MOCKUP_SCALE;
const MESH_FULL_SATURATE = saturateMatrix(1.15);

function MeshFull() {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const movePhase = useLoopPhase(9000, 3, reducedMotion);
  const huePhase = useLoopPhase(12000, 3, reducedMotion);
  const aspect = height / width;
  const pos1Scale = (0.45 / 0.55) * aspect;
  const pos2Scale = (0.45 / 0.55) * aspect;
  const pos3Scale = (0.5 / 0.6) * aspect;
  const pos4Scale = (0.4 / 0.45) * aspect;

  const { originX, originY, boxWidth, boxHeight } = expandedBox(
    width,
    height,
    MESH_FULL_INSET,
  );

  const baseStart = useDerivedValue(
    () => angleToLine(165, originX, originY, boxWidth, boxHeight).start,
  );
  const baseEnd = useDerivedValue(
    () => angleToLine(165, originX, originY, boxWidth, boxHeight).end,
  );

  const pos1 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.2, 0.45, 0.12, 0.2]),
        width,
        MESH_FULL_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.15, 0.3, 0.42, 0.15]),
        height,
        MESH_FULL_INSET,
      ),
    ),
  );
  const pos2 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.85, 0.65, 0.9, 0.85]),
        width,
        MESH_FULL_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.3, 0.12, 0.55, 0.3]),
        height,
        MESH_FULL_INSET,
      ),
    ),
  );
  const pos3 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.3, 0.15, 0.45, 0.3]),
        width,
        MESH_FULL_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.85, 0.6, 0.92, 0.85]),
        height,
        MESH_FULL_INSET,
      ),
    ),
  );
  const pos4 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.75, 0.85, 0.55, 0.75]),
        width,
        MESH_FULL_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.7, 0.88, 0.55, 0.7]),
        height,
        MESH_FULL_INSET,
      ),
    ),
  );

  const m1Colors = useDerivedValue(() => [
    interpolateColor(
      huePhase.value,
      [0, 1, 2, 3],
      [MINT, INDIGO_BRIGHT, LIME, MINT],
    ),
    TRANSPARENT,
  ]);
  const m2Colors = useDerivedValue(() => [
    interpolateColor(huePhase.value, [0, 1, 2, 3], [TEAL, MINT, INDIGO, TEAL]),
    TRANSPARENT,
  ]);
  const m3Colors = useDerivedValue(() => [
    interpolateColor(
      huePhase.value,
      [0, 1, 2, 3],
      [INDIGO, TEAL, MINT, INDIGO],
    ),
    TRANSPARENT,
  ]);
  const m4Colors = useDerivedValue(() => [
    interpolateColor(
      huePhase.value,
      [0, 1, 2, 3],
      [LIME, MINT_LIGHT, TEAL, LIME],
    ),
    TRANSPARENT,
  ]);

  return (
    <MeshCanvas>
      <Group
        layer={
          <Paint>
            <Blur blur={MESH_FULL_BLUR} />
            <ColorMatrix matrix={MESH_FULL_SATURATE} />
          </Paint>
        }
      >
        <Fill>
          <LinearGradient start={baseStart} end={baseEnd} colors={[TEAL, INDIGO]} />
        </Fill>
        <Group origin={pos4} transform={[{ scaleY: pos4Scale }]}>
          <Fill>
            <RadialGradient c={pos4} r={boxWidth * 0.45} colors={m4Colors} positions={[0, 0.72]} />
          </Fill>
        </Group>
        <Group origin={pos3} transform={[{ scaleY: pos3Scale }]}>
          <Fill>
            <RadialGradient c={pos3} r={boxWidth * 0.6} colors={m2Colors} positions={[0, 0.78]} />
          </Fill>
        </Group>
        <Group origin={pos2} transform={[{ scaleY: pos2Scale }]}>
          <Fill>
            <RadialGradient c={pos2} r={boxWidth * 0.55} colors={m3Colors} positions={[0, 0.75]} />
          </Fill>
        </Group>
        <Group origin={pos1} transform={[{ scaleY: pos1Scale }]}>
          <Fill>
            <RadialGradient c={pos1} r={boxWidth * 0.55} colors={m1Colors} positions={[0, 0.75]} />
          </Fill>
        </Group>
      </Group>
    </MeshCanvas>
  );
}

const MESH_DARK_INSET = 0.12;
const MESH_DARK_BLUR = 8 * MOCKUP_SCALE;
const MESH_DARK_SATURATE = saturateMatrix(1.1);

function MeshDark() {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const movePhase = useLoopPhase(8000, 3, reducedMotion);
  const huePhase = usePingPongPhase(11000, reducedMotion);
  const aspect = height / width;
  const pos1Scale = (0.48 / 0.6) * aspect;
  const pos2Scale = (0.42 / 0.5) * aspect;
  const pos3Scale = (0.45 / 0.55) * aspect;

  const { originX, originY, boxWidth, boxHeight } = expandedBox(
    width,
    height,
    MESH_DARK_INSET,
  );

  const baseStart = useDerivedValue(
    () => angleToLine(165, originX, originY, boxWidth, boxHeight).start,
  );
  const baseEnd = useDerivedValue(
    () => angleToLine(165, originX, originY, boxWidth, boxHeight).end,
  );

  const pos1 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.2, 0.45, 0.12, 0.2]),
        width,
        MESH_DARK_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.15, 0.3, 0.42, 0.15]),
        height,
        MESH_DARK_INSET,
      ),
    ),
  );
  const pos2 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.85, 0.65, 0.9, 0.85]),
        width,
        MESH_DARK_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.3, 0.12, 0.55, 0.3]),
        height,
        MESH_DARK_INSET,
      ),
    ),
  );
  const pos3 = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.3, 0.15, 0.45, 0.3]),
        width,
        MESH_DARK_INSET,
      ),
      pct(
        interpolate(movePhase.value, [0, 1, 2, 3], [0.85, 0.6, 0.92, 0.85]),
        height,
        MESH_DARK_INSET,
      ),
    ),
  );

  const m1Colors = useDerivedValue(() => [
    interpolateColor(huePhase.value, [0, 1], [MINT, INDIGO_BRIGHT]),
    TRANSPARENT,
  ]);
  const m2Colors = useDerivedValue(() => [
    interpolateColor(huePhase.value, [0, 1], [TEAL, MINT]),
    TRANSPARENT,
  ]);
  const m3Colors = useDerivedValue(() => [
    interpolateColor(huePhase.value, [0, 1], [INDIGO, TEAL]),
    TRANSPARENT,
  ]);

  return (
    <MeshCanvas>
      <Group
        layer={
          <Paint>
            <Blur blur={MESH_DARK_BLUR} />
            <ColorMatrix matrix={MESH_DARK_SATURATE} />
          </Paint>
        }
      >
        <Fill>
          <LinearGradient
            start={baseStart}
            end={baseEnd}
            colors={[DARK_TEAL, DARK_BASE]}
            positions={[0, 0.75]}
          />
        </Fill>
        <Group origin={pos3} transform={[{ scaleY: pos3Scale }]}>
          <Fill>
            <RadialGradient c={pos3} r={boxWidth * 0.55} colors={m2Colors} positions={[0, 0.74]} />
          </Fill>
        </Group>
        <Group origin={pos2} transform={[{ scaleY: pos2Scale }]}>
          <Fill>
            <RadialGradient c={pos2} r={boxWidth * 0.5} colors={m3Colors} positions={[0, 0.7]} />
          </Fill>
        </Group>
        <Group origin={pos1} transform={[{ scaleY: pos1Scale }]}>
          <Fill>
            <RadialGradient c={pos1} r={boxWidth * 0.6} colors={m1Colors} positions={[0, 0.72]} />
          </Fill>
        </Group>
      </Group>
    </MeshCanvas>
  );
}

const FALL_MORPH_INSET = 0.1;
const FALL_SUN_WIDTH = 280 * MOCKUP_SCALE;
const FALL_SUN_HEIGHT = 170 * MOCKUP_SCALE;
const FALL_SUN_TOP = -45 * MOCKUP_SCALE;
const FALL_SUN_LEFT = -65 * MOCKUP_SCALE;
const FALL_SUN_BLUR = 38 * MOCKUP_SCALE;

function FallMorph() {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const huePhase = useLoopPhase(9000, 3, reducedMotion);
  const swellPhase = usePingPongPhase(4500, reducedMotion);
  const sunPhase = usePingPongPhase(6000, reducedMotion);

  const { originX, originY, boxWidth, boxHeight } = expandedBox(
    width,
    height,
    FALL_MORPH_INSET,
  );

  const baseStart = useDerivedValue(
    () => angleToLine(180, originX, originY, boxWidth, boxHeight).start,
  );
  const baseEnd = useDerivedValue(
    () => angleToLine(180, originX, originY, boxWidth, boxHeight).end,
  );

  const wallColors = useDerivedValue(() => [
    interpolateColor(
      huePhase.value,
      [0, 1, 2, 3],
      [MINT, MINT_LIGHT, INDIGO_BRIGHT, MINT],
    ),
    interpolateColor(huePhase.value, [0, 1, 2, 3], [TEAL, MINT, INDIGO, TEAL]),
    TEAL_FADE,
    DARK_BASE,
  ]);

  const wallTransform = useDerivedValue(() => [
    {
      translateY: interpolate(
        swellPhase.value,
        [0, 1],
        [-0.025 * boxHeight, 0.025 * boxHeight],
      ),
    },
  ]);

  const sunCx = FALL_SUN_LEFT + FALL_SUN_WIDTH / 2;
  const sunCy = FALL_SUN_TOP + FALL_SUN_HEIGHT / 2;

  const sunOpacity = useDerivedValue(() =>
    interpolate(sunPhase.value, [0, 1], [0.45, 0.95]),
  );
  const sunTransform = useDerivedValue(() => [
    { translateX: interpolate(sunPhase.value, [0, 1], [0, 46 * MOCKUP_SCALE]) },
    { scale: interpolate(sunPhase.value, [0, 1], [0.9, 1.18]) },
  ]);

  return (
    <MeshCanvas>
      <Group transform={wallTransform} origin={vec(width / 2, height / 2)}>
        <Fill>
          <LinearGradient
            start={baseStart}
            end={baseEnd}
            colors={wallColors}
            positions={[0, 0.3, 0.55, 0.84]}
          />
        </Fill>
      </Group>
      <Group origin={vec(sunCx, sunCy)} transform={[{ scaleY: FALL_SUN_HEIGHT / FALL_SUN_WIDTH }]}>
        <Group
          opacity={sunOpacity}
          transform={sunTransform}
          origin={vec(sunCx, sunCy)}
          layer={
            <Paint>
              <Blur blur={FALL_SUN_BLUR} />
            </Paint>
          }
        >
          <Fill>
            <RadialGradient
              c={vec(sunCx, sunCy)}
              r={FALL_SUN_WIDTH / 2}
              colors={[LIME, LIME_FADE, TRANSPARENT]}
              positions={[0, 0.48, 0.74]}
            />
          </Fill>
        </Group>
      </Group>
    </MeshCanvas>
  );
}

const BREATHE_CORE_INSET = 0.12;
const BREATHE_CORE_BLUR = 7 * MOCKUP_SCALE;
const BREATHE_CORE_SATURATE = saturateMatrix(1.12);

function BreatheCore() {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const movePhase = usePingPongPhase(7000, reducedMotion);
  const huePhase = usePingPongPhase(10000, reducedMotion);
  const aspect = height / width;
  const topScale = (0.4 / 0.52) * aspect;
  const bottomScale = (0.38 / 0.46) * aspect;

  const { originX, originY, boxWidth, boxHeight } = expandedBox(
    width,
    height,
    BREATHE_CORE_INSET,
  );

  const angle = useDerivedValue(() =>
    interpolate(movePhase.value, [0, 1], [165, 195]),
  );
  const baseStart = useDerivedValue(
    () => angleToLine(angle.value, originX, originY, boxWidth, boxHeight).start,
  );
  const baseEnd = useDerivedValue(
    () => angleToLine(angle.value, originX, originY, boxWidth, boxHeight).end,
  );

  const topPos = useDerivedValue(() =>
    vec(
      pct(0.5, width, BREATHE_CORE_INSET),
      pct(
        interpolate(movePhase.value, [0, 1], [0.3, 0.45]),
        height,
        BREATHE_CORE_INSET,
      ),
    ),
  );
  const bottomPos = useDerivedValue(() =>
    vec(
      pct(
        interpolate(movePhase.value, [0, 1], [0.8, 0.6]),
        width,
        BREATHE_CORE_INSET,
      ),
      pct(0.78, height, BREATHE_CORE_INSET),
    ),
  );

  const topColors = useDerivedValue(() => [
    interpolateColor(huePhase.value, [0, 1], [MINT, LIME]),
    TRANSPARENT,
  ]);
  const bottomColors = useDerivedValue(() => [
    interpolateColor(huePhase.value, [0, 1], [INDIGO, MINT]),
    TRANSPARENT,
  ]);

  return (
    <MeshCanvas>
      <Group
        layer={
          <Paint>
            <Blur blur={BREATHE_CORE_BLUR} />
            <ColorMatrix matrix={BREATHE_CORE_SATURATE} />
          </Paint>
        }
      >
        <Fill>
          <LinearGradient
            start={baseStart}
            end={baseEnd}
            colors={[DARK_TEAL, DARK_BASE]}
            positions={[0, 0.7]}
          />
        </Fill>
        <Group origin={bottomPos} transform={[{ scaleY: bottomScale }]}>
          <Fill>
            <RadialGradient c={bottomPos} r={boxWidth * 0.46} colors={bottomColors} positions={[0, 0.7]} />
          </Fill>
        </Group>
        <Group origin={topPos} transform={[{ scaleY: topScale }]}>
          <Fill>
            <RadialGradient c={topPos} r={boxWidth * 0.52} colors={topColors} positions={[0, 0.74]} />
          </Fill>
        </Group>
      </Group>
    </MeshCanvas>
  );
}

export function MeshGradientBackground({ variant = "mesh-dark" }: Props) {
  if (variant === "mesh-full") {
    return <MeshFull />;
  }
  if (variant === "fall-morph") {
    return <FallMorph />;
  }
  if (variant === "breathe-core") {
    return <BreatheCore />;
  }
  return <MeshDark />;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DARK_BASE,
    overflow: "hidden",
  },
});

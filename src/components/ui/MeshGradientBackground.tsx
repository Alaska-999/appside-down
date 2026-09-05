import {
  BlendMode,
  Canvas,
  Circle,
  FractalNoise,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  Skia,
  TileMode,
  vec,
} from "@shopify/react-native-skia";
import {
  ICON_ACCENT,
  ICON_INDIGO,
  ICON_LIME,
  ICON_MINT,
  ICON_TEAL,
} from "@/src/constants/iconColors";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import {
  Easing,
  SharedValue,
  interpolate,
  interpolateColor,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export type MeshVariant =
  | "mesh-full"
  | "mesh-dark"
  | "fall-morph"
  | "breathe-core";

interface Props {
  variant?: MeshVariant;
}

const MOCKUP_WIDTH = 250;
const THIRDS = [0, 1 / 3, 2 / 3, 1];
const HALVES = [0, 1];

function segmentEase(p: number, breaks: number[]) {
  "worklet";
  for (let i = 0; i < breaks.length - 1; i += 1) {
    const from = breaks[i];
    const to = breaks[i + 1];
    if (p <= to) {
      const t = (p - from) / (to - from);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      return from + eased * (to - from);
    }
  }
  return 1;
}

function withAlpha(color: string, alpha: number) {
  "worklet";
  const parts = color
    .slice(color.indexOf("(") + 1, color.lastIndexOf(")"))
    .split(",");
  const r = Math.round(Number(parts[0]));
  const g = Math.round(Number(parts[1]));
  const b = Math.round(Number(parts[2]));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function gradientEnds(deg: number, w: number, h: number) {
  "worklet";
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  return {
    start: { x: w / 2 - (dx * len) / 2, y: h / 2 - (dy * len) / 2 },
    end: { x: w / 2 + (dx * len) / 2, y: h / 2 + (dy * len) / 2 },
  };
}

function saturationMatrix(s: number) {
  const lr = 0.213;
  const lg = 0.715;
  const lb = 0.072;
  return [
    lr + s * (1 - lr),
    lg - s * lg,
    lb - s * lb,
    0,
    0,
    lr - s * lr,
    lg + s * (1 - lg),
    lb - s * lb,
    0,
    0,
    lr - s * lr,
    lg - s * lg,
    lb + s * (1 - lb),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function useLoop(duration: number, alternate: boolean, enabled: boolean) {
  const phase = useSharedValue(0);
  useEffect(() => {
    if (!enabled) return;
    phase.value = withRepeat(
      withTiming(1, {
        duration,
        easing: alternate ? Easing.inOut(Easing.quad) : Easing.linear,
      }),
      -1,
      alternate,
    );
  }, [duration, alternate, enabled, phase]);
  return phase;
}

function useKeyframePhase(
  duration: number,
  breaks: number[],
  enabled: boolean,
) {
  const raw = useLoop(duration, false, enabled);
  return useDerivedValue(() => segmentEase(raw.value, breaks));
}

function useMorphColor(
  phase: SharedValue<number>,
  input: number[],
  output: string[],
) {
  return useDerivedValue(() => {
    const color = interpolateColor(phase.value, input, output);
    return [withAlpha(color, 1), withAlpha(color, 0)];
  });
}

function useTrack(
  phase: SharedValue<number>,
  input: number[],
  output: number[],
  scale: number,
) {
  return useDerivedValue(() => scale * interpolate(phase.value, input, output));
}

function useMeshPaint(sigma: number, saturation: number) {
  return useMemo(() => {
    const paint = Skia.Paint();
    paint.setDither(true);
    paint.setImageFilter(
      Skia.ImageFilter.MakeBlur(sigma, sigma, TileMode.Clamp, null),
    );
    paint.setColorFilter(
      Skia.ColorFilter.MakeMatrix(saturationMatrix(saturation)),
    );
    return paint;
  }, [sigma, saturation]);
}

function useMeshBox(width: number, height: number, inset: number) {
  const boxW = width * (1 + inset * 2);
  const boxH = height * (1 + inset * 2);
  const offset = [
    { translateX: -width * inset },
    { translateY: -height * inset },
  ];
  return { boxW, boxH, offset };
}

interface NodeProps {
  cx: SharedValue<number>;
  cy: SharedValue<number>;
  rx: number;
  ry: number;
  colors: SharedValue<string[]>;
}

function MeshNode({ cx, cy, rx, ry, colors }: NodeProps) {
  const transform = useDerivedValue(() => [
    { translateX: cx.value },
    { translateY: cy.value },
    { scaleY: ry / rx },
  ]);
  return (
    <Group transform={transform}>
      <Circle cx={0} cy={0} r={rx}>
        <RadialGradient c={vec(0, 0)} r={rx} colors={colors} />
      </Circle>
    </Group>
  );
}

function Grain({ width, height }: { width: number; height: number }) {
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setColorFilter(Skia.ColorFilter.MakeMatrix(saturationMatrix(0)));
    p.setAlphaf(0.07);
    p.setBlendMode(BlendMode.Overlay);
    return p;
  }, []);

  return (
    <Group layer={paint}>
      <Rect x={0} y={0} width={width} height={height}>
        <FractalNoise freqX={0.9} freqY={0.9} octaves={2} seed={0} />
      </Rect>
    </Group>
  );
}

interface VariantProps {
  width: number;
  height: number;
  still: boolean;
}

function MeshFull({ width, height, still }: VariantProps) {
  const { boxW, boxH, offset } = useMeshBox(width, height, 0.12);
  const move = useKeyframePhase(9000, THIRDS, !still);
  const hue = useKeyframePhase(12000, THIRDS, !still);
  const paint = useMeshPaint((width / MOCKUP_WIDTH) * 6, 1.15);
  const base = gradientEnds(165, boxW, boxH);

  const x1 = useTrack(move, THIRDS, [0.2, 0.45, 0.12, 0.2], boxW);
  const y1 = useTrack(move, THIRDS, [0.15, 0.3, 0.42, 0.15], boxH);
  const x2 = useTrack(move, THIRDS, [0.85, 0.65, 0.9, 0.85], boxW);
  const y2 = useTrack(move, THIRDS, [0.3, 0.12, 0.55, 0.3], boxH);
  const x3 = useTrack(move, THIRDS, [0.3, 0.15, 0.45, 0.3], boxW);
  const y3 = useTrack(move, THIRDS, [0.85, 0.6, 0.92, 0.85], boxH);
  const x4 = useTrack(move, THIRDS, [0.75, 0.85, 0.55, 0.75], boxW);
  const y4 = useTrack(move, THIRDS, [0.7, 0.88, 0.55, 0.7], boxH);

  const m1 = useMorphColor(hue, THIRDS, [
    ICON_MINT,
    "#6366F1",
    ICON_LIME,
    ICON_MINT,
  ]);
  const m2 = useMorphColor(hue, THIRDS, [
    ICON_TEAL,
    ICON_MINT,
    ICON_INDIGO,
    ICON_TEAL,
  ]);
  const m3 = useMorphColor(hue, THIRDS, [
    ICON_INDIGO,
    ICON_TEAL,
    ICON_MINT,
    ICON_INDIGO,
  ]);
  const m4 = useMorphColor(hue, THIRDS, [
    ICON_LIME,
    ICON_ACCENT,
    ICON_TEAL,
    ICON_LIME,
  ]);

  return (
    <Group transform={offset} layer={paint}>
      <Rect x={0} y={0} width={boxW} height={boxH}>
        <LinearGradient
          start={vec(base.start.x, base.start.y)}
          end={vec(base.end.x, base.end.y)}
          colors={[ICON_TEAL, ICON_INDIGO]}
        />
      </Rect>
      <MeshNode
        cx={x4}
        cy={y4}
        rx={boxW * 0.45 * 0.72}
        ry={boxH * 0.4 * 0.72}
        colors={m4}
      />
      <MeshNode
        cx={x3}
        cy={y3}
        rx={boxW * 0.6 * 0.78}
        ry={boxH * 0.5 * 0.78}
        colors={m2}
      />
      <MeshNode
        cx={x2}
        cy={y2}
        rx={boxW * 0.55 * 0.75}
        ry={boxH * 0.45 * 0.75}
        colors={m3}
      />
      <MeshNode
        cx={x1}
        cy={y1}
        rx={boxW * 0.55 * 0.75}
        ry={boxH * 0.45 * 0.75}
        colors={m1}
      />
    </Group>
  );
}

function MeshDark({ width, height, still }: VariantProps) {
  const { boxW, boxH, offset } = useMeshBox(width, height, 0.12);
  const move = useKeyframePhase(8000, THIRDS, !still);
  const hue = useLoop(5500, true, !still);
  const paint = useMeshPaint((width / MOCKUP_WIDTH) * 8, 1.1);
  const base = gradientEnds(165, boxW, boxH);

  const x1 = useTrack(move, THIRDS, [0.2, 0.45, 0.12, 0.2], boxW);
  const y1 = useTrack(move, THIRDS, [0.15, 0.3, 0.42, 0.15], boxH);
  const x2 = useTrack(move, THIRDS, [0.85, 0.65, 0.9, 0.85], boxW);
  const y2 = useTrack(move, THIRDS, [0.3, 0.12, 0.55, 0.3], boxH);
  const x3 = useTrack(move, THIRDS, [0.3, 0.15, 0.45, 0.3], boxW);
  const y3 = useTrack(move, THIRDS, [0.85, 0.6, 0.92, 0.85], boxH);

  const m1 = useMorphColor(hue, HALVES, [ICON_MINT, "#6366F1"]);
  const m2 = useMorphColor(hue, HALVES, [ICON_TEAL, ICON_MINT]);
  const m3 = useMorphColor(hue, HALVES, [ICON_INDIGO, ICON_TEAL]);

  return (
    <Group transform={offset} layer={paint}>
      <Rect x={0} y={0} width={boxW} height={boxH}>
        <LinearGradient
          start={vec(base.start.x, base.start.y)}
          end={vec(base.end.x, base.end.y)}
          colors={["#11302F", "#11141F"]}
          positions={[0, 0.75]}
        />
      </Rect>
      <MeshNode
        cx={x3}
        cy={y3}
        rx={boxW * 0.55 * 0.74}
        ry={boxH * 0.45 * 0.74}
        colors={m2}
      />
      <MeshNode
        cx={x2}
        cy={y2}
        rx={boxW * 0.5 * 0.7}
        ry={boxH * 0.42 * 0.7}
        colors={m3}
      />
      <MeshNode
        cx={x1}
        cy={y1}
        rx={boxW * 0.6 * 0.72}
        ry={boxH * 0.48 * 0.72}
        colors={m1}
      />
    </Group>
  );
}

function FallMorph({ width, height, still }: VariantProps) {
  const { boxW, boxH, offset } = useMeshBox(width, height, 0.1);
  const hue = useKeyframePhase(9000, THIRDS, !still);
  const swell = useLoop(4500, true, !still);
  const sun = useLoop(6000, true, !still);
  const sunRadius = width * 0.56;

  const sunBlur = useMemo(() => {
    const paint = Skia.Paint();
    paint.setDither(true);
    paint.setImageFilter(
      Skia.ImageFilter.MakeBlur(
        (width / MOCKUP_WIDTH) * 38,
        (width / MOCKUP_WIDTH) * 38,
        TileMode.Decal,
        null,
      ),
    );
    return paint;
  }, [width]);

  const wallColors = useDerivedValue(() => {
    const wt = interpolateColor(hue.value, THIRDS, [
      ICON_MINT,
      ICON_ACCENT,
      "#6366F1",
      ICON_MINT,
    ]);
    const wm2 = interpolateColor(hue.value, THIRDS, [
      ICON_TEAL,
      ICON_MINT,
      ICON_INDIGO,
      ICON_TEAL,
    ]);
    return [
      withAlpha(wt, 1),
      withAlpha(wm2, 1),
      "rgba(13, 148, 136, 0.3)",
      "#11141F",
    ];
  });

  const wallTransform = useDerivedValue(() => [
    { translateY: interpolate(swell.value, HALVES, [-0.025, 0.025]) * boxH },
  ]);

  const sunTransform = useDerivedValue(() => [
    {
      translateX:
        width * 0.3 + interpolate(sun.value, HALVES, [0, 0.184]) * width,
    },
    { translateY: width * 0.16 },
    { scale: interpolate(sun.value, HALVES, [0.9, 1.18]) },
    { scaleY: 170 / 280 },
  ]);

  const sunOpacity = useDerivedValue(() =>
    interpolate(sun.value, HALVES, [0.45, 0.95]),
  );

  return (
    <Group>
      <Rect x={0} y={0} width={width} height={height} color="#11141F" />
      <Group transform={offset}>
        <Group transform={wallTransform}>
          <Rect x={0} y={0} width={boxW} height={boxH}>
            <LinearGradient
              start={vec(0, -0.06 * boxH)}
              end={vec(0, 0.84 * boxH)}
              colors={wallColors}
              positions={[0, 0.4, 0.6778, 1]}
            />
          </Rect>
        </Group>
      </Group>
      <Group layer={sunBlur} opacity={sunOpacity}>
        <Group transform={sunTransform}>
          <Circle cx={0} cy={0} r={sunRadius}>
            <RadialGradient
              c={vec(0, 0)}
              r={sunRadius}
              colors={[
                "rgba(163, 230, 53, 1)",
                "rgba(163, 230, 53, 0.4)",
                "rgba(163, 230, 53, 0)",
              ]}
              positions={[0, 0.48, 0.74]}
            />
          </Circle>
        </Group>
      </Group>
    </Group>
  );
}

function BreatheCore({ width, height, still }: VariantProps) {
  const { boxW, boxH, offset } = useMeshBox(width, height, 0.12);
  const move = useLoop(3500, true, !still);
  const hue = useLoop(5000, true, !still);
  const paint = useMeshPaint((width / MOCKUP_WIDTH) * 7, 1.12);

  const coreX = useDerivedValue(() => boxW * 0.5);
  const coreY = useTrack(move, HALVES, [0.3, 0.45], boxH);
  const counterX = useTrack(move, HALVES, [0.8, 0.6], boxW);
  const counterY = useDerivedValue(() => boxH * 0.78);

  const m1 = useMorphColor(hue, HALVES, [ICON_MINT, ICON_LIME]);
  const m3 = useMorphColor(hue, HALVES, [ICON_INDIGO, ICON_MINT]);

  const baseStart = useDerivedValue(
    () =>
      gradientEnds(interpolate(move.value, HALVES, [165, 195]), boxW, boxH)
        .start,
  );
  const baseEnd = useDerivedValue(
    () =>
      gradientEnds(interpolate(move.value, HALVES, [165, 195]), boxW, boxH).end,
  );

  return (
    <Group transform={offset} layer={paint}>
      <Rect x={0} y={0} width={boxW} height={boxH}>
        <LinearGradient
          start={baseStart}
          end={baseEnd}
          colors={["#11302F", "#11141F"]}
          positions={[0, 0.7]}
        />
      </Rect>
      <MeshNode
        cx={counterX}
        cy={counterY}
        rx={boxW * 0.46 * 0.7}
        ry={boxH * 0.38 * 0.7}
        colors={m3}
      />
      <MeshNode
        cx={coreX}
        cy={coreY}
        rx={boxW * 0.52 * 0.74}
        ry={boxH * 0.4 * 0.74}
        colors={m1}
      />
    </Group>
  );
}

export function MeshGradientBackground({ variant = "mesh-dark" }: Props) {
  const { width, height } = useWindowDimensions();
  const still = useReducedMotion();

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        {variant === "mesh-full" && (
          <MeshFull width={width} height={height} still={still} />
        )}
        {variant === "mesh-dark" && (
          <MeshDark width={width} height={height} still={still} />
        )}
        {variant === "fall-morph" && (
          <FallMorph width={width} height={height} still={still} />
        )}
        {variant === "breathe-core" && (
          <BreatheCore width={width} height={height} still={still} />
        )}
        <Grain width={width} height={height} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#11141F",
  },
});

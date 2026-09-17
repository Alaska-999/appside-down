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
  ICON_BASE,
  ICON_INDIGO,
  ICON_MINT,
  ICON_MINT_LIGHT,
} from "@/src/constants/iconColors";
import { SPLASH_BASE_TOP } from "@/src/constants/rawColors";
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

export type MeshVariant = "calm-mist";

interface Props {
  variant?: MeshVariant;
}

const ELEMENTS_WIDTH = 393;
const CALM_INTENSITY = 0.6;
const HALVES = [0, 1];

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

function useMorphColorAlpha(
  phase: SharedValue<number>,
  input: number[],
  output: string[],
  alphas: number[],
) {
  return useDerivedValue(() => {
    const color = interpolateColor(phase.value, input, output);
    const alpha = interpolate(phase.value, input, alphas) * CALM_INTENSITY;
    return [withAlpha(color, alpha), withAlpha(color, 0)];
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

function CalmMist({ width, height, still }: VariantProps) {
  const { boxW, boxH, offset } = useMeshBox(width, height, 0.18);
  const move = useLoop(11000, true, !still);
  const hue = useLoop(13000, true, !still);
  const paint = useMeshPaint((width / ELEMENTS_WIDTH) * 46, 0.92);
  const base = gradientEnds(178, boxW, boxH);

  const coreX = useDerivedValue(() => boxW * 0.5);
  const coreY = useTrack(move, HALVES, [0.38, 0.46], boxH);
  const counterX = useTrack(move, HALVES, [0.76, 0.62], boxW);
  const counterY = useDerivedValue(() => boxH * 0.84);

  const core = useMorphColorAlpha(
    hue,
    HALVES,
    [ICON_MINT, ICON_MINT_LIGHT],
    [0.27, 0.24],
  );
  const counter = useMorphColorAlpha(
    hue,
    HALVES,
    [ICON_INDIGO, ICON_MINT],
    [0.17, 0.15],
  );

  return (
    <Group transform={offset} layer={paint}>
      <Rect x={0} y={0} width={boxW} height={boxH}>
        <LinearGradient
          start={vec(base.start.x, base.start.y)}
          end={vec(base.end.x, base.end.y)}
          colors={[SPLASH_BASE_TOP, ICON_BASE]}
          positions={[0, 0.52]}
        />
      </Rect>
      <MeshNode
        cx={counterX}
        cy={counterY}
        rx={boxW * 0.6 * 0.7}
        ry={boxH * 0.46 * 0.7}
        colors={counter}
      />
      <MeshNode
        cx={coreX}
        cy={coreY}
        rx={boxW * 0.74 * 0.72}
        ry={boxH * 0.52 * 0.72}
        colors={core}
      />
    </Group>
  );
}

export function MeshGradientBackground({ variant = "calm-mist" }: Props) {
  const { width, height } = useWindowDimensions();
  const still = useReducedMotion();

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        {variant === "calm-mist" && (
          <CalmMist width={width} height={height} still={still} />
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

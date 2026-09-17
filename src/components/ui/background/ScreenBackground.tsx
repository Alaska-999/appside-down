import { gradientLine } from "@/src/components/ui/surface/GradientBorder";
import { StatusBarScrim } from "@/src/components/ui/background/StatusBarScrim";
import {
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
import { memo, ReactNode, useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { YStack } from "tamagui";
import { fadeOut as off } from "@/src/utils/withAlpha";
import {
  buildSpec,
  type Beam,
  type BackgroundPreset,
  type Layer,
  type LinearVignette,
  type RadialVignette,
} from "@/src/components/ui/background/backgroundPresets";

export type { BackgroundPreset } from "@/src/components/ui/background/backgroundPresets";

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

export type BgDebugMode = "noblur" | "clamp" | "decal";

function useLayerPaint(
  blur: number,
  saturate?: number,
  mode: BgDebugMode = "clamp",
) {
  return useMemo(() => {
    if (mode === "noblur") return true;
    const paint = Skia.Paint();
    paint.setDither(true);
    const tile = mode === "decal" ? TileMode.Decal : TileMode.Clamp;
    paint.setImageFilter(Skia.ImageFilter.MakeBlur(blur, blur, tile, null));
    paint.setColorFilter(
      Skia.ColorFilter.MakeMatrix(saturationMatrix(saturate ?? 1)),
    );
    return paint;
  }, [blur, saturate, mode]);
}

const BlobLayer = memo(function BlobLayer({
  layer,
  mode,
}: {
  layer: Layer;
  mode?: BgDebugMode;
}) {
  const paint = useLayerPaint(layer.blur, layer.saturate, mode);
  return (
    <Group layer={paint}>
      {layer.blobs.map((b, i) => (
        <Group
          key={i}
          transform={[
            { translateX: b.cx },
            { translateY: b.cy },
            { scaleY: b.ry / b.rx },
          ]}
        >
          <Circle cx={0} cy={0} r={b.rx}>
            <RadialGradient
              c={vec(0, 0)}
              r={b.rx}
              colors={[b.color, off(b.color)]}
              positions={[0, b.edge]}
            />
          </Circle>
        </Group>
      ))}
    </Group>
  );
});

const BeamLayer = memo(function BeamLayer({
  beam,
  w,
  h,
  animated,
}: {
  beam: Beam;
  w: number;
  h: number;
  animated: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const drift = useSharedValue(0);
  const run = animated && !reducedMotion;

  useEffect(() => {
    if (run) {
      drift.value = -0.06 * w;
      drift.value = withRepeat(
        withTiming(0.06 * w, {
          duration: beam.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [run, w, beam.duration, drift]);

  const transform = useDerivedValue(() => [
    { translateX: run ? drift.value : 0 },
  ]);
  const paint = useLayerPaint(beam.blur);
  const line = gradientLine(beam.angle, w, h);

  return (
    <Group layer={paint} transform={transform} opacity={beam.opacity}>
      <Rect x={-0.12 * w} y={0} width={w * 1.24} height={h}>
        <LinearGradient
          start={line.start}
          end={line.end}
          colors={beam.colors}
          positions={beam.positions}
        />
      </Rect>
    </Group>
  );
});

const Vignette = memo(function Vignette({
  vignette,
  w,
  h,
}: {
  vignette: RadialVignette | LinearVignette;
  w: number;
  h: number;
}) {
  if (vignette.kind === "linear") {
    return (
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient
          start={vec(w / 2, 0)}
          end={vec(w / 2, h)}
          colors={vignette.colors}
          positions={vignette.positions}
        />
      </Rect>
    );
  }
  const scaleY = vignette.ry / vignette.rx;
  return (
    <Group
      transform={[
        { translateX: vignette.cx },
        { translateY: vignette.cy },
        { scaleY },
      ]}
    >
      <Rect
        x={-vignette.cx}
        y={-vignette.cy / scaleY}
        width={w}
        height={h / scaleY}
      >
        <RadialGradient
          c={vec(0, 0)}
          r={vignette.rx}
          colors={vignette.colors}
          positions={vignette.positions}
        />
      </Rect>
    </Group>
  );
});

export const Grain = memo(function Grain({
  w,
  h,
  amount,
}: {
  w: number;
  h: number;
  amount: number;
}) {
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAlphaf(amount * 0.55);
    return p;
  }, [amount]);
  return (
    <Group layer={paint}>
      <Rect x={0} y={0} width={w} height={h}>
        <FractalNoise freqX={0.9} freqY={0.9} octaves={3} seed={0} />
      </Rect>
    </Group>
  );
});

export const BackgroundMesh = memo(function BackgroundMesh({
  preset,
  animated = false,
  debugMode,
}: {
  preset: BackgroundPreset;
  animated?: boolean;
  debugMode?: BgDebugMode;
}) {
  const { width: w, height: h } = useWindowDimensions();
  const spec = useMemo(() => buildSpec(preset, w, h), [preset, w, h]);
  const baseLine = gradientLine(spec.base.angle, w, h);
  const beams = spec.beams ?? (spec.beam ? [spec.beam] : []);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient
          start={baseLine.start}
          end={baseLine.end}
          colors={spec.base.colors}
          positions={spec.base.positions}
        />
      </Rect>
      {spec.layers.map((layer, i) => (
        <BlobLayer key={i} layer={layer} mode={debugMode} />
      ))}
      {beams.map((beam, i) => (
        <BeamLayer key={i} beam={beam} w={w} h={h} animated={animated} />
      ))}
      {spec.vignette && <Vignette vignette={spec.vignette} w={w} h={h} />}
      {spec.grain !== undefined && <Grain w={w} h={h} amount={spec.grain} />}
    </Canvas>
  );
});

export function ScreenBackground({
  preset,
  animated,
  children,
}: {
  preset?: BackgroundPreset;
  animated?: boolean;
  children: ReactNode;
}) {
  return (
    <YStack f={1} bg="$background">
      {preset && <BackgroundMesh preset={preset} animated={animated} />}
      <YStack f={1} w="100%" maxWidth={560} als="center">
        {children}
      </YStack>
      <StatusBarScrim />
    </YStack>
  );
}

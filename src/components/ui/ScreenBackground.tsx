import { gradientLine } from "@/src/components/ui/GradientBorder";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
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
import { ReactNode, useEffect, useMemo } from "react";
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

export type BackgroundPreset =
  | "home"
  | "module"
  | "form"
  | "formBright"
  | "folder"
  | "flash"
  | "auth"
  | "finish"
  | "finishCold"
  | "finishWarm";

type Blob = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  edge: number;
};

type Layer = { blur: number; saturate?: number; blobs: Blob[] };

type Linear = { angle: number; colors: string[]; positions: number[] };

type Beam = {
  angle: number;
  colors: string[];
  positions: number[];
  blur: number;
  opacity: number;
  duration: number;
};

type RadialVignette = {
  kind: "radial";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  colors: string[];
  positions: number[];
};

type LinearVignette = { kind: "linear"; colors: string[]; positions: number[] };

type BgSpec = {
  base: Linear;
  layers: Layer[];
  beam?: Beam;
  vignette?: RadialVignette | LinearVignette;
  grain?: number;
};

const off = (c: string) => c.replace(/,[\d.\s]+\)$/, ",0)");

const DIM = "rgba(5,6,9,0.7)";
const DIM_MOD = "rgba(5,6,9,0.6)";
const NIGHT = "rgba(1,3,5,0)";

function ribBlobs(
  x: number,
  y: number,
  cw: number,
  ch: number,
  spots: [number, number, number, number, string, number][],
): Blob[] {
  return spots.map(([bx, by, brx, bry, color, edge]) => ({
    cx: x + bx * cw,
    cy: y + by * ch,
    rx: brx * cw,
    ry: bry * ch,
    color,
    edge,
  }));
}

function buildSpec(preset: BackgroundPreset, w: number, h: number): BgSpec {
  switch (preset) {
    case "home":
      return {
        base: {
          angle: 178,
          colors: ["#0E1A1E", "#08090C"],
          positions: [0, 0.42],
        },
        layers: [
          {
            blur: 24,
            saturate: 1.1,
            blobs: [
              {
                cx: 0.26 * w,
                cy: 0.02 * h,
                rx: 0.42 * w,
                ry: 0.2 * h,
                color: "rgba(45,212,191,0.42)",
                edge: 0.72,
              },
              {
                cx: 0.82 * w,
                cy: 0.1 * h,
                rx: 0.38 * w,
                ry: 0.17 * h,
                color: "rgba(13,148,136,0.34)",
                edge: 0.72,
              },
              {
                cx: -0.04 * w,
                cy: 0.4 * h,
                rx: 0.22 * w,
                ry: 0.3 * h,
                color: "rgba(94,234,212,0.28)",
                edge: 0.74,
              },
              {
                cx: -0.04 * w,
                cy: 0.74 * h,
                rx: 0.2 * w,
                ry: 0.26 * h,
                color: "rgba(13,148,136,0.26)",
                edge: 0.74,
              },
            ],
          },
        ],
        vignette: {
          kind: "radial",
          cx: 0.5 * w,
          cy: 0.26 * h,
          rx: 1.2 * w,
          ry: 0.78 * h,
          colors: [off(DIM), off(DIM), DIM, DIM],
          positions: [0, 0.34, 0.86, 1],
        },
      };
    case "module":
      return {
        base: {
          angle: 96,
          colors: ["#0C1518", "#08090C"],
          positions: [0, 0.56],
        },
        layers: [
          {
            blur: 40,
            blobs: [
              ...ribBlobs(-0.03 * w, -0.11 * h, 0.58 * w, 1.22 * h, [
                [0.6, 0.12, 0.38, 0.4, "rgba(94,234,212,0.54)", 0.7],
                [0.4, 0.48, 0.4, 0.3, "rgba(45,212,191,0.46)", 0.72],
                [0.62, 0.84, 0.36, 0.26, "rgba(13,148,136,0.44)", 0.72],
              ]),
              ...ribBlobs(0, 0, 0.54 * w, 0.27 * h, [
                [0.5, 0.5, 0.5, 0.5, "rgba(163,230,53,0.29)", 0.72],
              ]),
            ],
          },
        ],
        vignette: {
          kind: "radial",
          cx: 0.5 * w,
          cy: 0.24 * h,
          rx: 1.2 * w,
          ry: 0.7 * h,
          colors: [off(DIM_MOD), off(DIM_MOD), DIM_MOD, DIM_MOD],
          positions: [0, 0.38, 0.92, 1],
        },
        grain: 0.05,
      };
    case "form":
      return {
        base: {
          angle: 96,
          colors: ["#0C1518", "#08090C"],
          positions: [0, 0.56],
        },
        layers: [
          {
            blur: 32,
            blobs: ribBlobs(-0.27 * w, -0.11 * h, 0.58 * w, 1.22 * h, [
              [0.6, 0.12, 0.38, 0.4, "rgba(94,234,212,0.44)", 0.7],
              [0.4, 0.48, 0.4, 0.3, "rgba(45,212,191,0.37)", 0.72],
              [0.62, 0.84, 0.36, 0.26, "rgba(13,148,136,0.35)", 0.72],
            ]),
          },
          {
            blur: 40,
            blobs: ribBlobs(0.62 * w, -0.1 * h, 0.58 * w, 0.26 * h, [
              [0.5, 0.5, 0.5, 0.5, "rgba(163,230,53,0.30)", 0.72],
              [0.42, 0.58, 0.62, 0.62, "rgba(45,212,191,0.20)", 0.74],
            ]),
          },
        ],
        grain: 0.055,
      };
    case "formBright":
      return {
        base: {
          angle: 96,
          colors: ["#0C1518", "#08090C"],
          positions: [0, 0.56],
        },
        layers: [
          {
            blur: 32,
            blobs: ribBlobs(-0.27 * w, -0.11 * h, 0.63 * w, 1.28 * h, [
              [0.45, 0.12, 0.42, 0.44, "rgba(94,234,212,0.43)", 0.5],
              [0.4, 0.48, 0.43, 0.3, "rgba(45,212,191,0.44)", 0.6],
              [0.62, 0.84, 0.4, 0.7, "rgba(13,148,136,0.43)", 0.7],
            ]),
          },
          {
            blur: 40,
            blobs: ribBlobs(0.62 * w, -0.1 * h, 0.63 * w, 0.29 * h, [
              [0.52, 0.48, 0.55, 0.5, "rgba(166, 239, 49, 0.48)", 0.8],
              [0.23, 0.55, 0.56, 0.9, "rgba(45,212,191,0.25)", 0.7],
            ]),
          },
        ],
        grain: 0.055,
      };
    case "folder":
      return {
        base: {
          angle: 140,
          colors: ["#0C1518", "#08090C"],
          positions: [0, 0.58],
        },
        layers: [
          {
            blur: 37,
            blobs: ribBlobs(-0.22 * w, -0.14 * h, 0.64 * w, 0.38 * h, [
              [0.55, 0.45, 0.55, 0.66, "rgba(94,234,212,0.5)", 0.72],
            ]),
          },
          {
            blur: 60,
            blobs: ribBlobs(0.61 * w, 0.78 * h, 0.69 * w, 0.38 * h, [
              [0.6, 0.53, 0.7, 0.8, "rgba(13,148,136,0.60)", 0.78],
              [0.2, 0.68, 0.6, 0.6, "rgba(163,230,53,0.35)", 0.65],
            ]),
          },
        ],
        grain: 0.04,
      };
    case "flash":
      return {
        base: {
          angle: 180,
          colors: ["#0B2A34", "#0A1620", "#07080B"],
          positions: [0, 0.44, 1],
        },
        beam: {
          angle: 106,
          colors: [
            "rgba(94,234,212,0)",
            "rgba(94,234,212,0.62)",
            "rgba(190,242,100,0.55)",
            "rgba(190,242,100,0)",
          ],
          positions: [0.2, 0.38, 0.52, 0.72],
          blur: 40,
          opacity: 1,
          duration: 14000,
        },
        layers: [
          {
            blur: 42,
            blobs: [
              {
                cx: 0.5 * w,
                cy: 1.06 * h,
                rx: 0.7 * w,
                ry: 0.3 * h,
                color: "rgba(13,148,136,0.5)",
                edge: 0.74,
              },
            ],
          },
        ],
        grain: 0.05,
      };
    case "auth":
      return {
        base: {
          angle: 180,
          colors: ["#08242C", "#061220", "#03070C", "#020304"],
          positions: [0, 0.34, 0.6, 1],
        },
        beam: {
          angle: 108,
          colors: [
            "rgba(94,234,212,0)",
            "rgba(94,234,212,0.5)",
            "rgba(190,242,100,0.36)",
            "rgba(190,242,100,0)",
          ],
          positions: [0.2, 0.38, 0.52, 0.72],
          blur: 46,
          opacity: 0.72,
          duration: 15000,
        },
        layers: [
          {
            blur: 40,
            blobs: [
              {
                cx: 0.5 * w,
                cy: 1.04 * h,
                rx: 0.7 * w,
                ry: 0.28 * h,
                color: "rgba(13,148,136,0.5)",
                edge: 0.74,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.4)", "rgba(1,3,5,0.78)"],
          positions: [0, 0.32, 0.62, 1],
        },
        grain: 0.06,
      };
    case "finish":
      return {
        base: {
          angle: 180,
          colors: ["#071E26", "#050F18", "#03070C", "#020304", "#010203"],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(13,148,136,0.32)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(67,56,202,0.24)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(45,212,191,0.16)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [
            NIGHT,
            NIGHT,
            "rgba(1,3,5,0.5)",
            "rgba(1,3,5,0.86)",
            "rgba(1,3,5,0.94)",
          ],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        grain: 0.07,
      };
    case "finishCold":
      return {
        base: {
          angle: 180,
          colors: ["#090F2C", "#06091B", "#03050E", "#020304"],
          positions: [0, 0.38, 0.72, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(67,56,202,0.28)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(13,148,136,0.25)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(45,212,191,0.16)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.26)", "rgba(1,3,5,0.46)"],
          positions: [0, 0.4, 0.66, 1],
        },
        grain: 0.07,
      };
    case "finishWarm":
      return {
        base: {
          angle: 180,
          colors: ["#081F1A", "#06110C", "#030603", "#020302"],
          positions: [0, 0.4, 0.74, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(163,230,53,0.16)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(67,56,202,0.24)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(190,242,100,0.11)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.26)", "rgba(1,3,5,0.46)"],
          positions: [0, 0.4, 0.66, 1],
        },
        grain: 0.07,
      };
  }
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

function BlobLayer({ layer, mode }: { layer: Layer; mode?: BgDebugMode }) {
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
}

function BeamLayer({
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
}

function Vignette({
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
}

function Grain({ w, h, amount }: { w: number; h: number; amount: number }) {
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
}

export function BackgroundMesh({
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
      {spec.beam && (
        <BeamLayer beam={spec.beam} w={w} h={h} animated={animated} />
      )}
      {spec.vignette && <Vignette vignette={spec.vignette} w={w} h={h} />}
      {spec.grain !== undefined && <Grain w={w} h={h} amount={spec.grain} />}
    </Canvas>
  );
}

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

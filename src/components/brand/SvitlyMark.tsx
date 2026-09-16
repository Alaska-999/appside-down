import { ICON_LIME_LIGHT, ICON_MINT_LIGHT } from "@/src/constants/iconColors";
import { SPARK_CORE } from "@/src/constants/rawColors";
import type { SkPath } from "@shopify/react-native-skia";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const MARK_VIEWBOX = 120;

export const MARK_INK = {
  width: 67.63,
  height: 87.75,
};

export const MARK_TIMING = {
  sparkMs: 500,
  drawDelayMs: 300,
  drawMs: 1600,
  headFadeMs: 500,
};

const MARK_PATH =
  "M88 26c-10-9-30-11-42-3-13 8-11 24 3 30 14 6 33 6 39 16 6 10-6 24-22 26-13 2-27-3-33-11";

const SPARK_X = 88;
const SPARK_Y = 26;
const GLOW_STROKE = 16;
const GLOW_OPACITY = 0.22;
const LINE_STROKE = 10.5;
const HEAD_CORE_R = 7;
const HEAD_GLOW_R = 13;
const HEAD_GLOW_OPACITY = 0.28;
const SAMPLES = 240;
const GLOW_BLEED = 24;
const OPTICAL_DX = -1.54;
const OPTICAL_DY = 3.35;

type MarkMode = "draw" | "static";

interface Props {
  mode?: MarkMode;
  size?: number;
}

type MarkGeometry = {
  path: ReturnType<typeof Skia.Path.MakeFromSVGString>;
  xs: number[];
  ys: number[];
  box: ReturnType<SkPath["computeTightBounds"]> | null;
};

let cachedGeometry: MarkGeometry | null = null;

function markGeometry(): MarkGeometry {
  if (cachedGeometry) {
    return cachedGeometry;
  }

  const path = Skia.Path.MakeFromSVGString(MARK_PATH);
  const xs: number[] = [];
  const ys: number[] = [];

  if (!path) {
    cachedGeometry = { path: null, xs, ys, box: null };
    return cachedGeometry;
  }

  const contour = Skia.ContourMeasureIter(path, false, 1).next();
  if (contour) {
    const length = contour.length();
    for (let i = 0; i <= SAMPLES; i += 1) {
      const [position] = contour.getPosTan((i / SAMPLES) * length);
      xs.push(position.x);
      ys.push(position.y);
    }
  }

  cachedGeometry = { path, xs, ys, box: path.computeTightBounds() };
  return cachedGeometry;
}

export function SvitlyMark({ mode = "static", size = MARK_VIEWBOX }: Props) {
  const { path, xs, ys, box } = markGeometry();
  const progress = useSharedValue(mode === "draw" ? 0 : 1);
  const spark = useSharedValue(mode === "draw" ? 0 : 1);
  const sparkScale = useSharedValue(mode === "draw" ? 0.2 : 1);
  const head = useSharedValue(0);

  useEffect(() => {
    if (mode !== "draw") {
      progress.value = 1;
      spark.value = 1;
      sparkScale.value = 1;
      head.value = 0;
      return;
    }

    spark.value = withSequence(
      withTiming(1, {
        duration: MARK_TIMING.sparkMs * 0.55,
        easing: Easing.bezier(0.2, 0.8, 0.3, 1),
      }),
      withTiming(0.85, { duration: MARK_TIMING.sparkMs * 0.45 }),
    );
    sparkScale.value = withSequence(
      withTiming(1.5, {
        duration: MARK_TIMING.sparkMs * 0.55,
        easing: Easing.bezier(0.2, 0.8, 0.3, 1),
      }),
      withTiming(1, { duration: MARK_TIMING.sparkMs * 0.45 }),
    );

    progress.value = withDelay(
      MARK_TIMING.drawDelayMs,
      withTiming(1, {
        duration: MARK_TIMING.drawMs,
        easing: Easing.bezier(0.45, 0.05, 0.2, 1),
      }),
    );

    head.value = withSequence(
      withDelay(
        MARK_TIMING.drawDelayMs,
        withTiming(1, { duration: MARK_TIMING.drawMs * 0.19 }),
      ),
      withDelay(
        MARK_TIMING.drawMs * 0.72,
        withTiming(0, { duration: MARK_TIMING.headFadeMs }),
      ),
    );
  }, [mode, progress, spark, sparkScale, head]);

  const headTransform = useDerivedValue(() => {
    if (xs.length === 0) {
      return [{ translateX: SPARK_X }, { translateY: SPARK_Y }];
    }
    const at = progress.value * (xs.length - 1);
    const low = Math.floor(at);
    const high = Math.min(low + 1, xs.length - 1);
    const t = at - low;
    return [
      { translateX: xs[low] + (xs[high] - xs[low]) * t },
      { translateY: ys[low] + (ys[high] - ys[low]) * t },
    ];
  });

  const sparkTransform = useDerivedValue(() => [
    { translateX: SPARK_X },
    { translateY: SPARK_Y },
    { scale: sparkScale.value },
  ]);

  if (!path) {
    return null;
  }

  const scale = size / MARK_VIEWBOX;
  const bleed = GLOW_BLEED * scale;
  const canvasSize = size + bleed * 2;
  const gradientStart = box ? vec(box.x, box.y) : vec(0, 0);
  const gradientEnd = box
    ? vec(box.x + box.width, box.y + box.height)
    : vec(MARK_VIEWBOX, MARK_VIEWBOX);

  return (
    <Canvas style={{ width: canvasSize, height: canvasSize }}>
      <Group
        transform={[
          { translateX: bleed + OPTICAL_DX * scale },
          { translateY: bleed + OPTICAL_DY * scale },
          { scale },
        ]}
      >
        <Path
          path={path}
          style="stroke"
          strokeWidth={GLOW_STROKE}
          strokeCap="round"
          opacity={GLOW_OPACITY}
          start={0}
          end={progress}
        >
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={[ICON_MINT_LIGHT, ICON_LIME_LIGHT]}
          />
          <BlurMask blur={5} style="normal" />
        </Path>

        <Path
          path={path}
          style="stroke"
          strokeWidth={LINE_STROKE}
          strokeCap="round"
          start={0}
          end={progress}
        >
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={[ICON_MINT_LIGHT, ICON_LIME_LIGHT]}
          />
        </Path>

        <Group transform={headTransform} opacity={head}>
          <Circle
            cx={0}
            cy={0}
            r={HEAD_GLOW_R}
            color={ICON_LIME_LIGHT}
            opacity={HEAD_GLOW_OPACITY}
          >
            <BlurMask blur={6} style="normal" />
          </Circle>
          <Circle cx={0} cy={0} r={HEAD_CORE_R} color={SPARK_CORE} />
        </Group>

        <Group transform={sparkTransform} opacity={spark}>
          <Circle
            cx={0}
            cy={0}
            r={HEAD_GLOW_R}
            color={ICON_LIME_LIGHT}
            opacity={0.35}
          >
            <BlurMask blur={6} style="normal" />
          </Circle>
          <Circle cx={0} cy={0} r={HEAD_CORE_R + 0.5} color={SPARK_CORE} />
        </Group>
      </Group>
    </Canvas>
  );
}

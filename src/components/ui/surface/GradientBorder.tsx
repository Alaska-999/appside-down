import {
  Canvas,
  FillType,
  LinearGradient,
  Path,
  Skia,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import {
  GRADIENT_BORDER_PRESETS,
  GradientBorderPreset,
} from "@/src/components/ui/gradientBorderPresets";
import { useMeasure } from "@/src/hooks/useMeasure";

export type { GradientBorderPreset };

export type CornerRadii = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

type GradientBorderProps = {
  radius: number | CornerRadii;
  width?: number;
  preset?: GradientBorderPreset;
  angle?: number;
  colors?: string[];
  positions?: number[];
  sweep?: boolean;
  spinDuration?: number;
  sweepStartDeg?: number;
};

function toCorners(radius: number | CornerRadii): CornerRadii {
  if (typeof radius === "number") {
    return { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };
  }
  return radius;
}

export function gradientLine(angle: number, w: number, h: number) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = w / 2;
  const cy = h / 2;
  return {
    start: vec(cx - dx * half, cy - dy * half),
    end: vec(cx + dx * half, cy + dy * half),
  };
}

export function GradientBorder({
  radius,
  width = 1,
  preset = "surf",
  angle,
  colors,
  positions,
  sweep = false,
  spinDuration,
  sweepStartDeg = 0,
}: GradientBorderProps) {
  const { size, onLayout } = useMeasure();
  const reducedMotion = useReducedMotion();
  const spin = useSharedValue(0);
  const spinning = sweep && !!spinDuration && !reducedMotion;

  useEffect(() => {
    if (!spinning) return;
    spin.value = 0;
    spin.value = withRepeat(
      withTiming(360, { duration: spinDuration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [spinning, spinDuration, spin]);

  const spinTransform = useDerivedValue(() => [
    { rotate: ((spin.value + sweepStartDeg) * Math.PI) / 180 },
  ]);
  const presetDef = GRADIENT_BORDER_PRESETS[preset];
  const resolvedAngle = angle ?? presetDef.angle;
  const resolvedColors = colors ?? presetDef.colors;
  const resolvedPositions = positions ?? presetDef.positions;

  const path = useMemo(() => {
    if (size.w <= 0 || size.h <= 0) return null;
    const outer = toCorners(radius);
    const inner: CornerRadii = {
      topLeft: Math.max(outer.topLeft - width, 0),
      topRight: Math.max(outer.topRight - width, 0),
      bottomRight: Math.max(outer.bottomRight - width, 0),
      bottomLeft: Math.max(outer.bottomLeft - width, 0),
    };
    const ring = Skia.Path.Make();
    ring.addRRect({
      rect: Skia.XYWHRect(0, 0, size.w, size.h),
      topLeft: vec(outer.topLeft, outer.topLeft),
      topRight: vec(outer.topRight, outer.topRight),
      bottomRight: vec(outer.bottomRight, outer.bottomRight),
      bottomLeft: vec(outer.bottomLeft, outer.bottomLeft),
    });
    ring.addRRect({
      rect: Skia.XYWHRect(width, width, size.w - width * 2, size.h - width * 2),
      topLeft: vec(inner.topLeft, inner.topLeft),
      topRight: vec(inner.topRight, inner.topRight),
      bottomRight: vec(inner.bottomRight, inner.bottomRight),
      bottomLeft: vec(inner.bottomLeft, inner.bottomLeft),
    });
    ring.setFillType(FillType.EvenOdd);
    return ring;
  }, [size.w, size.h, radius, width]);

  const line = useMemo(
    () => gradientLine(resolvedAngle, size.w, size.h),
    [resolvedAngle, size.w, size.h],
  );


  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {path && (
        <Canvas style={StyleSheet.absoluteFill}>
          {sweep ? (
            <Path path={path}>
              <SweepGradient
                c={vec(size.w / 2, size.h / 2)}
                colors={resolvedColors}
                positions={resolvedPositions}
                origin={vec(size.w / 2, size.h / 2)}
                transform={spinning || sweepStartDeg !== 0 ? spinTransform : undefined}
              />
            </Path>
          ) : (
            <Path path={path}>
              <LinearGradient
                start={line.start}
                end={line.end}
                colors={resolvedColors}
                positions={resolvedPositions}
              />
            </Path>
          )}
        </Canvas>
      )}
    </View>
  );
}

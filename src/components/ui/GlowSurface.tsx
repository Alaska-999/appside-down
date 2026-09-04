import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  RadialGradient,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import { ReactNode, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { YStack, YStackProps, useTheme } from "tamagui";

export type GlowTone = "mint" | "teal" | "lime" | "indigo" | "neutral";
export type LightLevel = 0 | 1 | 2 | 3 | 4;

const GLOW_LAMP_ALPHA: Record<LightLevel, number> = {
  0: 0,
  1: 0.14,
  2: 0.26,
  3: 0.42,
  4: 0.62,
};

const VIVID_SATURATE: Record<LightLevel, number> = {
  0: 0.15,
  1: 0.55,
  2: 1,
  3: 1.6,
  4: 2.4,
};

type Rgb = [number, number, number];

const TONES: Record<
  GlowTone,
  { lamp: Rgb; border: Rgb; lampAlpha: number; borderAlpha: number }
> = {
  mint: { lamp: [45, 212, 191], border: [94, 234, 212], lampAlpha: 0.22, borderAlpha: 0.48 },
  teal: { lamp: [13, 148, 136], border: [45, 212, 191], lampAlpha: 0.3, borderAlpha: 0.4 },
  lime: { lamp: [163, 230, 53], border: [190, 242, 100], lampAlpha: 0.2, borderAlpha: 0.48 },
  indigo: { lamp: [99, 102, 241], border: [99, 102, 241], lampAlpha: 0.2, borderAlpha: 0.42 },
  neutral: { lamp: [220, 255, 245], border: [220, 255, 245], lampAlpha: 0.1, borderAlpha: 0.24 },
};

function saturateRgb([r, g, b]: Rgb, s: number): Rgb {
  const lum = 0.213 * r + 0.715 * g + 0.072 * b;
  const mix = (c: number) => Math.max(0, Math.min(255, Math.round(lum + (c - lum) * s)));
  return [mix(r), mix(g), mix(b)];
}

export function toneRgba(rgb: Rgb, alpha: number, sat = 1): string {
  const [r, g, b] = sat === 1 ? rgb : saturateRgb(rgb, sat);
  return `rgba(${r},${g},${b},${alpha})`;
}

function useMeasure() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  };
  return { size, onLayout };
}

export type LampGeometry = { rx: number; ry: number; cx: number; cy: number };

const LAMP_CARD: LampGeometry = { rx: 1.28, ry: 0.96, cx: 0.08, cy: -0.1 };
export const LAMP_ROW: LampGeometry = { rx: 1.2, ry: 0.92, cx: 0.06, cy: -0.12 };
export const LAMP_TILE: LampGeometry = { rx: 1.2, ry: 1.3, cx: 0.12, cy: -0.2 };

export function Lamp({
  color,
  edge = 0.56,
  geometry = LAMP_CARD,
}: {
  color: string;
  edge?: number;
  geometry?: LampGeometry;
}) {
  const { size, onLayout } = useMeasure();
  const rx = geometry.rx * size.w;
  const ry = geometry.ry * size.h;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size.w > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Group
            transform={[
              { translateX: geometry.cx * size.w },
              { translateY: geometry.cy * size.h },
              { scaleY: ry / rx },
            ]}
          >
            <Circle cx={0} cy={0} r={rx}>
              <RadialGradient
                c={vec(0, 0)}
                r={rx}
                colors={[color, color.replace(/,[\d.\s]+\)$/, ",0)")]}
                positions={[0, edge]}
              />
            </Circle>
          </Group>
        </Canvas>
      )}
    </View>
  );
}

export function InnerBloom({
  color,
  radius,
  spread = 20,
  blur = 15,
}: {
  color: string;
  radius: number;
  spread?: number;
  blur?: number;
}) {
  const { size, onLayout } = useMeasure();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size.w > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect
            x={-spread / 2}
            y={-spread / 2}
            width={size.w + spread}
            height={size.h + spread}
            r={radius}
            style="stroke"
            strokeWidth={spread}
            color={color}
          >
            <BlurMask blur={blur} style="normal" />
          </RoundedRect>
        </Canvas>
      )}
    </View>
  );
}

export interface GlowSurfaceProps extends YStackProps {
  radius?: number;
  tone?: GlowTone;
  lamp?: boolean;
  lampAlpha?: number;
  lampGeometry?: LampGeometry;
  lampEdge?: number;
  glow?: LightLevel;
  vivid?: LightLevel;
  fill?: string;
  blurIntensity?: number;
  liquidGlass?: boolean;
  overlay?: ReactNode;
  borderAngle?: number;
  borderColors?: string[];
  borderPositions?: number[];
  underlay?: ReactNode;
  children?: ReactNode;
}

export function GlowSurface({
  radius = 23,
  tone = "mint",
  lamp = false,
  lampAlpha: lampAlphaOverride,
  lampGeometry,
  lampEdge,
  glow,
  vivid = 2,
  fill = "$surfaceCard",
  blurIntensity = 40,
  liquidGlass = false,
  overlay,
  borderAngle,
  borderColors,
  borderPositions,
  underlay,
  children,
  fd,
  ai,
  jc,
  gap,
  flexWrap,
  p,
  px,
  py,
  pt,
  pb,
  ...rest
}: GlowSurfaceProps) {
  const theme = useTheme();
  const t = TONES[tone];
  const sat = VIVID_SATURATE[vivid];

  const lampAlpha =
    lampAlphaOverride ??
    (glow !== undefined ? GLOW_LAMP_ALPHA[glow] : lamp ? t.lampAlpha : 0);
  const borderAlpha =
    lampAlphaOverride !== undefined
      ? 0
      : glow !== undefined
        ? GLOW_LAMP_ALPHA[glow] * 2.1
        : lamp
          ? t.borderAlpha
          : 0;

  const fillColor = fill.startsWith("$")
    ? theme[fill.slice(1) as keyof typeof theme]?.get?.() ?? fill
    : fill;

  const resolvedBorderColors =
    borderColors ??
    (borderAlpha > 0
      ? [
          toneRgba(t.border, Math.min(borderAlpha, 1), sat),
          toneRgba(t.border, Math.min(borderAlpha, 1) * 0.14, sat),
          "rgba(220,255,245,0.03)",
        ]
      : undefined);
  const resolvedBorderPositions = borderPositions ?? (resolvedBorderColors ? [0, 0.46, 1] : undefined);
  const resolvedBorderAngle = borderAngle ?? (borderAlpha > 0 ? 138 : undefined);

  return (
    <YStack pos="relative" br={radius} {...rest}>
      <YStack pos="absolute" t={0} l={0} r={0} b={0} br={radius} overflow="hidden">
        {blurIntensity > 0 || liquidGlass ? (
          <LiquidGlass
            intensity={blurIntensity}
            tint="default"
            liquid={liquidGlass}
            borderRadius={radius}
            backgroundColor={fillColor}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: fillColor }]} />
        )}
        {lampAlpha > 0 && (
          <Lamp
            color={toneRgba(t.lamp, lampAlpha, sat)}
            geometry={lampGeometry}
            edge={lampEdge}
          />
        )}
        {underlay}
      </YStack>
      {resolvedBorderColors ? (
        <GradientBorder
          radius={radius}
          colors={resolvedBorderColors}
          positions={resolvedBorderPositions}
          angle={resolvedBorderAngle}
        />
      ) : (
        <GradientBorder radius={radius} preset="surf" />
      )}
      <YStack
        f={1}
        zIndex={2}
        fd={fd}
        ai={ai}
        jc={jc}
        gap={gap}
        flexWrap={flexWrap}
        p={p}
        px={px}
        py={py}
        pt={pt}
        pb={pb}
      >
        {children}
      </YStack>
      {overlay}
    </YStack>
  );
}

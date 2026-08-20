import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { controlHeight } from "@/tamagui.config";
import {
  BlurMask,
  Canvas,
  Group,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { YStack, YStackProps } from "tamagui";

const GLOW_PAD = 20;

export function OuterGlow({
  radius,
  color,
  blur = 10,
  width = 8,
}: {
  radius: number;
  color: string;
  blur?: number;
  width?: number;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  };

  const innerW = size.w - GLOW_PAD * 2;
  const innerH = size.h - GLOW_PAD * 2;

  const clip = useMemo(() => {
    if (innerW <= 0 || innerH <= 0) return null;
    const path = Skia.Path.Make();
    path.addRRect(
      Skia.RRectXY(Skia.XYWHRect(GLOW_PAD, GLOW_PAD, innerW, innerH), radius, radius),
    );
    return path;
  }, [innerW, innerH, radius]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -GLOW_PAD,
        left: -GLOW_PAD,
        right: -GLOW_PAD,
        bottom: -GLOW_PAD,
      }}
      onLayout={onLayout}
    >
      {clip && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Group clip={clip} invertClip>
            <RoundedRect
              x={GLOW_PAD}
              y={GLOW_PAD}
              width={innerW}
              height={innerH}
              r={radius}
              style="stroke"
              strokeWidth={width}
              color={color}
            >
              <BlurMask blur={blur} style="normal" />
            </RoundedRect>
          </Group>
        </Canvas>
      )}
    </View>
  );
}

export type InputShellVariant = "well" | "glass" | "underline";
export type InputShellState = "default" | "focus" | "error" | "good";
export type InputShellSize = "sm" | "md" | "lg";

export const INPUT_SIZE_STYLES: Record<
  InputShellSize,
  { height: number; radius: number; px: number }
> = {
  sm: { height: controlHeight.sm, radius: 13, px: 13 },
  md: { height: controlHeight.md, radius: 16, px: 16 },
  lg: { height: controlHeight.lg, radius: 18, px: 19 },
};

const WELL_BORDERS: Record<InputShellState, { colors: string[]; positions: number[] }> = {
  default: { colors: ["rgba(0,0,0,0.5)", "rgba(220,255,245,0.11)"], positions: [0, 1] },
  focus: { colors: ["rgba(94,234,212,0.45)", "rgba(94,234,212,0.18)"], positions: [0, 1] },
  error: { colors: ["rgba(239,68,68,0.5)", "rgba(239,68,68,0.2)"], positions: [0, 1] },
  good: { colors: ["rgba(163,230,53,0.4)", "rgba(163,230,53,0.15)"], positions: [0, 1] },
};

const RINGS: Record<
  Exclude<InputShellState, "default">,
  { width: number; color: string }
> = {
  focus: { width: 1.5, color: "rgba(94,234,212,0.7)" },
  error: { width: 1.5, color: "rgba(239,68,68,0.75)" },
  good: { width: 1.3, color: "rgba(163,230,53,0.55)" },
};

interface InputShellProps extends YStackProps {
  variant?: InputShellVariant;
  state?: InputShellState;
  size?: InputShellSize;
  disabled?: boolean;
  multiline?: boolean;
  children?: ReactNode;
}

export function InputShell({
  variant = "well",
  state = "default",
  size = "md",
  disabled,
  multiline,
  children,
  ...rest
}: InputShellProps) {
  const s = INPUT_SIZE_STYLES[size];
  const ring = state !== "default" ? RINGS[state] : null;

  if (variant === "underline") {
    return (
      <YStack
        h={44}
        px={2}
        jc="center"
        pos="relative"
        opacity={disabled ? 0.42 : 1}
        {...rest}
      >
        <YStack fd="row" ai="center" gap={10}>
          {children}
        </YStack>
        {state === "focus" ? (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              shadowColor: "rgba(94,234,212,1)",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 7,
              shadowOpacity: 0.8,
            }}
          >
            <LinearGradient
              colors={["#2DD4BF", "#A3E635"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ) : (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 1,
              backgroundColor:
                state === "error" ? "rgba(239,68,68,0.6)" : "rgba(220,255,245,0.18)",
            }}
          />
        )}
      </YStack>
    );
  }

  return (
    <YStack
      h={multiline ? undefined : s.height}
      minHeight={multiline ? 112 : undefined}
      br={s.radius}
      pos="relative"
      opacity={disabled ? 0.42 : 1}
      transform={[{ translateY: state === "focus" ? -1 : 0 }]}
      {...rest}
    >
      <YStack pos="absolute" t={0} l={0} r={0} b={0} br={s.radius} overflow="hidden">
        {variant === "glass" ? (
          <LiquidGlass
            intensity={45}
            tint="default"
            borderRadius={s.radius}
            backgroundColor="rgba(220,255,245,0.06)"
          />
        ) : (
          <>
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: state === "focus" ? "rgba(8,16,20,0.55)" : "rgba(4,7,10,0.5)" }]}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: 9 }}
              pointerEvents="none"
            />
            <View
              pointerEvents="none"
              style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(220,255,245,0.06)" }}
            />
          </>
        )}
      </YStack>
      {variant === "glass" ? (
        <GradientBorder
          radius={s.radius}
          angle={150}
          colors={["rgba(220,255,245,0.26)", "rgba(220,255,245,0.07)"]}
          positions={[0, 1]}
        />
      ) : (
        <GradientBorder
          radius={s.radius}
          angle={180}
          colors={WELL_BORDERS[state].colors}
          positions={WELL_BORDERS[state].positions}
        />
      )}
      {state === "focus" && !disabled && (
        <OuterGlow radius={s.radius} color="rgba(45,212,191,0.4)" />
      )}
      {state === "error" && !disabled && (
        <OuterGlow radius={s.radius} color="rgba(239,68,68,0.4)" />
      )}
      {ring && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: s.radius,
            borderWidth: ring.width,
            borderColor: ring.color,
            zIndex: 3,
          }}
        />
      )}
      <YStack
        f={1}
        zIndex={2}
        fd={multiline ? "column" : "row"}
        ai={multiline ? "stretch" : "center"}
        px={s.px}
        py={multiline ? 15 : 0}
        gap={multiline ? 0 : 10}
      >
        {children}
      </YStack>
    </YStack>
  );
}

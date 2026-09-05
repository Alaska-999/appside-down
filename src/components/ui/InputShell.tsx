import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  FOCUS_BORDER,
  FOCUS_GLOW,
  FOCUS_HIGHLIGHT,
  FOCUS_RING,
  FOCUS_TIMING,
} from "@/src/constants/focus";
import { ICON_LIME, ICON_MINT } from "@/src/constants/iconColors";
import { controlHeight } from "@/tamagui.config";
import {
  BlurMask,
  Canvas,
  Group,
  RoundedRect,
  Shadow,
  Skia,
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

const GLOW_PAD = 20;
const WELL_INSET_SHADOW = { dy: 2, blur: 4, color: "rgba(0,0,0,0.55)" };

export function WellInsetShadow({
  radius,
  shadow = WELL_INSET_SHADOW,
}: {
  radius: number;
  shadow?: { dy: number; blur: number; color: string };
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height)
      setSize({ width, height });
  };
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
    >
      {size.width > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            r={radius}
            color="black"
          >
            <Shadow
              dx={0}
              dy={shadow.dy}
              blur={shadow.blur}
              color={shadow.color}
              inner
              shadowOnly
            />
          </RoundedRect>
        </Canvas>
      )}
    </View>
  );
}

export function useFocusProgress(focused: boolean) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = reduced
      ? focused
        ? 1
        : 0
      : withTiming(focused ? 1 : 0, {
          duration: focused ? FOCUS_TIMING.inMs : FOCUS_TIMING.outMs,
          easing: FOCUS_TIMING.easing,
        });
  }, [focused, reduced, progress]);
  return progress;
}

export function FocusRing({
  radius,
  progress,
}: {
  radius: number;
  progress: SharedValue<number>;
}) {
  const glowStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.985 + 0.015 * progress.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, glowStyle]}
      >
        <OuterGlow
          radius={radius}
          blur={FOCUS_GLOW.blur}
          width={FOCUS_GLOW.width}
          color={FOCUS_GLOW.color}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { zIndex: 3 }, ringStyle]}
      >
        <GradientBorder
          radius={radius}
          angle={FOCUS_BORDER.angle}
          colors={FOCUS_BORDER.colors}
          positions={FOCUS_BORDER.positions}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: FOCUS_RING.width,
            borderColor: FOCUS_RING.color,
            overflow: "hidden",
            zIndex: 3,
          },
          ringStyle,
        ]}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: radius / 2,
            right: radius / 2,
            height: 1,
            backgroundColor: FOCUS_HIGHLIGHT,
          }}
        />
      </Animated.View>
    </>
  );
}

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
      Skia.RRectXY(
        Skia.XYWHRect(GLOW_PAD, GLOW_PAD, innerW, innerH),
        radius,
        radius,
      ),
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

export type InputShellVariant = "well" | "glass" | "underline" | "plain";
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

export const WELL_BORDERS: Record<
  InputShellState,
  { colors: string[]; positions: number[] }
> = {
  default: {
    colors: [
      "rgba(0, 0, 0, 0.1)",
      "rgba(140, 161, 159, 0.14)",
      "rgba(163, 187, 180, 0.18)",
    ],
    positions: [0, 0.8, 1],
  },
  focus: {
    colors: [
      "rgba(0, 0, 0, 0.1)",
      "rgba(140, 161, 159, 0.14)",
      "rgba(163, 187, 180, 0.18)",
    ],
    positions: [0, 0.8, 1],
  },
  error: {
    colors: ["rgba(239,68,68,0.5)", "rgba(239,68,68,0.2)"],
    positions: [0, 1],
  },
  good: {
    colors: ["rgba(163,230,53,0.4)", "rgba(163,230,53,0.15)"],
    positions: [0, 1],
  },
};

type InputShellLayoutProps = Pick<
  YStackProps,
  | "mt"
  | "mb"
  | "ml"
  | "mr"
  | "f"
  | "flex"
  | "w"
  | "h"
  | "ai"
  | "als"
  | "pos"
  | "zIndex"
  | "testID"
>;

interface InputShellProps extends InputShellLayoutProps {
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
  const focusProgress = useFocusProgress(state === "focus" && !disabled);
  const underlineStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{ scaleX: 0.6 + 0.4 * focusProgress.value }],
  }));

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
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor:
              state === "error"
                ? "rgba(239,68,68,0.6)"
                : "rgba(220,255,245,0.18)",
          }}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              shadowColor: "rgba(94,234,212,1)",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 7,
              shadowOpacity: 0.8,
            },
            underlineStyle,
          ]}
        >
          <LinearGradient
            colors={[ICON_MINT, ICON_LIME]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </YStack>
    );
  }

  if (variant === "plain") {
    return (
      <YStack
        h={multiline ? undefined : s.height}
        minHeight={multiline ? 80 : undefined}
        fd={multiline ? "column" : "row"}
        ai={multiline ? "stretch" : "center"}
        px={s.px}
        py={multiline ? 15 : 0}
        gap={multiline ? 0 : 10}
        opacity={disabled ? 0.42 : 1}
        {...rest}
      >
        {children}
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
      {...rest}
    >
      <YStack
        pos="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        br={s.radius}
        overflow="hidden"
      >
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
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor:
                    state === "focus" ? "rgba(4,8,10,0.65)" : "rgba(4,8,10,.5)",
                },
              ]}
            />
            <WellInsetShadow radius={s.radius} />
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
      {!disabled && <FocusRing radius={s.radius} progress={focusProgress} />}
      {state === "error" && !disabled && (
        <OuterGlow radius={s.radius} color="rgba(239,68,68,0.4)" />
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

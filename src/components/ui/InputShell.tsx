import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
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
  Easing,
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

const GLOW_PAD = 20;
const WELL_INSET_SHADOW = { dy: 2, blur: 4, color: "rgba(0,0,0,0.55)" };
export const WELL_BOTTOM_LINE = "rgba(220,255,245,0.05)";

export function WellInsetShadow({ radius }: { radius: number }) {
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
              dy={WELL_INSET_SHADOW.dy}
              blur={WELL_INSET_SHADOW.blur}
              color={WELL_INSET_SHADOW.color}
              inner
              shadowOnly
            />
          </RoundedRect>
        </Canvas>
      )}
    </View>
  );
}
export const FOCUS_BORDER = {
  colors: [
    "rgba(65, 237, 237, 0.6)",
    "rgba(175, 246, 234, 0.4)",
    "rgba(82, 227, 172, 0.55)",
  ],
  positions: [0, 0.5, 1],
};
const FOCUS_GLOW = { color: "rgba(45, 212, 190, 0.4)", blur: 6, width: 3.5 };
const FOCUS_RING = { width: 1.4, color: "rgba(94,234,212,0.4)" };
const FOCUS_IN_MS = 260;
const FOCUS_OUT_MS = 180;
const FOCUS_EASING = Easing.bezier(0.2, 0.8, 0.3, 1);

export function useFocusProgress(focused: boolean) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = reduced
      ? focused
        ? 1
        : 0
      : withTiming(focused ? 1 : 0, {
          duration: focused ? FOCUS_IN_MS : FOCUS_OUT_MS,
          easing: FOCUS_EASING,
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
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: FOCUS_RING.width,
            borderColor: FOCUS_RING.color,
            zIndex: 3,
          },
          ringStyle,
        ]}
      />
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
  focus: FOCUS_BORDER,
  error: {
    colors: ["rgba(239,68,68,0.5)", "rgba(239,68,68,0.2)"],
    positions: [0, 1],
  },
  good: {
    colors: ["rgba(163,230,53,0.4)", "rgba(163,230,53,0.15)"],
    positions: [0, 1],
  },
};

const RINGS: Record<
  Exclude<InputShellState, "default" | "focus">,
  { width: number; color: string }
> = {
  error: { width: 1.4, color: "rgba(239,68,68,0.75)" },
  good: { width: 1.3, color: "rgba(163,230,53,0.55)" },
};

type InputShellLayoutProps = Pick<
  YStackProps,
  "mt" | "mb" | "ml" | "mr" | "f" | "flex" | "w" | "h" | "ai" | "als" | "pos" | "zIndex" | "testID"
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
  const ring = state === "error" || state === "good" ? RINGS[state] : null;
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
        minHeight={multiline ? 112 : undefined}
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
                    state === "focus" ? "rgba(4,8,10,.6)" : "rgba(4,8,10,.55)",
                },
              ]}
            />
            <WellInsetShadow radius={s.radius} />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: WELL_BOTTOM_LINE,
              }}
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
      {!disabled && <FocusRing radius={s.radius} progress={focusProgress} />}
      {state === "error" && !disabled && (
        <OuterGlow radius={s.radius} color="rgba(239,68,68,0.4)" />
      )}
      {ring && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: s.radius,
              borderWidth: ring.width,
              borderColor: ring.color,
              zIndex: 3,
            },
          ]}
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

import { GradientBorder } from "@/src/components/ui/GradientBorder";
import {
  FOCUS_BORDER,
  FOCUS_GLOW,
  FOCUS_HIGHLIGHT,
  FOCUS_RING,
  FOCUS_TIMING,
} from "@/src/constants/focus";
import {
  BlurMask,
  Canvas,
  Group,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const GLOW_PAD = 20;

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

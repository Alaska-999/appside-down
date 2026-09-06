import { FocusRing, useFocusProgress } from "@/src/components/ui/FocusRing";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  WELL_BORDERS,
  WELL_FILL,
  WELL_FILL_FOCUS,
  WELL_FILL_SOFT,
  WELL_FILL_SOFT_FOCUS,
  WellInsetShadow,
  WellState,
} from "@/src/components/ui/Well";
import { ICON_MINT_LIGHT, ICON_STATUS_DANGER } from "@/src/constants/iconColors";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { INPUT_GLASS_TINT } from "@/src/constants/rawColors";
import {
  SURFACE_BORDER,
  SURFACE_GLASS_BORDER_FAINT,
} from "@/src/constants/surfaceAlpha";
import { withAlpha } from "@/src/utils/withAlpha";
import { controlHeight } from "@/tamagui.config";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

export type InputShellVariant =
  | "well"
  | "wellSoft"
  | "glass"
  | "underline"
  | "plain";
export type InputShellState = WellState;
export type InputShellSize = "sm" | "md" | "lg";

export const INPUT_SIZE_STYLES: Record<
  InputShellSize,
  { height: number; radius: number; px: number }
> = {
  sm: { height: controlHeight.sm, radius: 13, px: 13 },
  md: { height: controlHeight.md, radius: 16, px: 16 },
  lg: { height: controlHeight.lg, radius: 18, px: 19 },
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
                ? withAlpha(ICON_STATUS_DANGER, 0.6)
                : SURFACE_BORDER,
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
              shadowColor: ICON_MINT_LIGHT,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 7,
              shadowOpacity: 0.8,
            },
            underlineStyle,
          ]}
        >
          <LinearGradient
            colors={GRADIENT_PRIMARY}
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
            backgroundColor={INPUT_GLASS_TINT}
          />
        ) : (
          <>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor:
                    variant === "wellSoft"
                      ? state === "focus"
                        ? WELL_FILL_SOFT_FOCUS
                        : WELL_FILL_SOFT
                      : state === "focus"
                        ? WELL_FILL_FOCUS
                        : WELL_FILL,
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
          colors={[SURFACE_BORDER, SURFACE_GLASS_BORDER_FAINT]}
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

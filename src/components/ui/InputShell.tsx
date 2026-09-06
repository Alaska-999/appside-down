import {
  FocusRing,
  OuterGlow,
  useFocusProgress,
} from "@/src/components/ui/FocusRing";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  WELL_BORDERS,
  WellInsetShadow,
  WellState,
} from "@/src/components/ui/Well";
import { ICON_LIME, ICON_MINT } from "@/src/constants/iconColors";
import { controlHeight } from "@/tamagui.config";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

export type InputShellVariant = "well" | "glass" | "underline" | "plain";
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
            backgroundColor="rgba(148, 186, 175, 0.06)"
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

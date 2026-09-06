import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  GRADIENT_ACCENT_LIME,
  GRADIENT_PRIMARY,
} from "@/src/constants/gradients";
import { ICON_MINT, ICON_MINT_LIGHT, ICON_PURE_BLACK } from "@/src/constants/iconColors";
import {
  GLASS_BORDER_BOTTOM,
  LIQUID_LENS_LINE_BOTTOM,
  LIQUID_LENS_LINE_SIDE,
  LIQUID_LENS_TINT,
} from "@/src/constants/rawColors";
import {
  SURFACE_BORDER,
  SURFACE_GLASS_BG_FAINT,
  SURFACE_GLASS_BORDER_FAINT,
} from "@/src/constants/surfaceAlpha";
import { usePressScale } from "@/src/hooks/usePressScale";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { BlurMask, Canvas, Circle } from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { ReactElement, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Button, ButtonProps, YStack, YStackProps } from "tamagui";

type IconButtonVariant = "glass" | "acc" | "liquidGlass" | "badge" | "danger";

const MIN_TAP_TARGET = 44;

type IconButtonLayoutProps = Pick<
  ButtonProps,
  | "mt"
  | "mb"
  | "ml"
  | "mr"
  | "f"
  | "w"
  | "h"
  | "ai"
  | "als"
  | "pos"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "zIndex"
  | "elevation"
  | "testID"
  | "accessibilityLabel"
  | "disabled"
>;

interface IconButtonProps extends IconButtonLayoutProps {
  icon: ReactElement;
  variant?: IconButtonVariant;
  size?: number;
  onPress?: () => void;
}

const LEGACY_VARIANT_STYLES: Record<
  "badge" | "danger",
  Partial<ButtonProps>
> = {
  badge: {
    bg: "$backgroundStrong",
    borderWidth: 3,
    borderColor: "$background",
  },
  danger: {
    bg: "$statusDanger",
    borderWidth: 2,
    borderColor: "$background",
  },
};

export function IconButton({
  icon,
  variant = "glass",
  size,
  onPress,
  ...rest
}: IconButtonProps) {
  const press = usePressScale(0.92);

  const handlePress = () => {
    hapticTap();
    onPress?.();
  };

  if (variant === "liquidGlass") {
    const lgSize = size ?? 44;
    const lgRadius = lgSize / 2;
    return (
      <YStack
        w={lgSize}
        h={lgSize}
        br={lgRadius}
        ai="center"
        jc="center"
        onPress={handlePress}
        pressStyle={{ scale: 0.92 }}
        transition="press"
        accessibilityRole="button"
        shadowColor={ICON_PURE_BLACK}
        shadowOffset={{ width: 0, height: 3 }}
        shadowRadius={5}
        shadowOpacity={0.5}
        {...(rest as YStackProps)}
      >
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={lgRadius}
          overflow="hidden"
          bg="$surfaceGlassFaint"
        >
          <LiquidGlass intensity={8} tint="default" borderRadius={lgRadius} />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: LIQUID_LENS_TINT,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: GLASS_BORDER_BOTTOM,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: LIQUID_LENS_LINE_BOTTOM,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 7,
              bottom: 7,
              width: 1,
              backgroundColor: LIQUID_LENS_LINE_SIDE,
            }}
          />
        </YStack>
        <GradientBorder radius={lgRadius} preset="lens" />
        {icon}
      </YStack>
    );
  }

  if (variant === "glass" || variant === "acc") {
    const resolvedSize = size ?? 48;
    const radius = resolvedSize / 2;
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        hitSlop={Math.max(0, (44 - resolvedSize) / 2)}
      >
        {({ pressed }) => (
          <Animated.View style={press.style}>
            <YStack
              w={resolvedSize}
              h={resolvedSize}
              br={radius}
              ai="center"
              jc="center"
              pos="relative"
              {...(variant === "acc"
                ? {
                    shadowColor: ICON_MINT,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 8,
                    shadowOpacity: 0.5,
                  }
                : null)}
              {...(rest as YStackProps)}
            >
              <YStack
                pos="absolute"
                t={0}
                l={0}
                r={0}
                b={0}
                br={radius}
                overflow="hidden"
              >
                {variant === "acc" ? (
                  <LinearGradient
                    colors={GRADIENT_PRIMARY}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.9, y: 0.9 }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <LiquidGlass
                    intensity={40}
                    tint="default"
                    borderRadius={radius}
                    backgroundColor={
                      pressed
                        ? SURFACE_BORDER
                        : SURFACE_GLASS_BORDER_FAINT
                    }
                  />
                )}
              </YStack>
              {variant === "glass" && (
                <GradientBorder
                  radius={radius}
                  angle={150}
                  colors={[SURFACE_BORDER, SURFACE_GLASS_BG_FAINT]}
                  positions={[0, 1]}
                />
              )}
              <YStack zIndex={2}>{icon}</YStack>
            </YStack>
          </Animated.View>
        )}
      </Pressable>
    );
  }

  const legacySize = size ?? 36;
  return (
    <Button
      circular
      size="$3"
      w={legacySize}
      h={legacySize}
      hitSlop={Math.max(0, Math.ceil((MIN_TAP_TARGET - legacySize) / 2))}
      icon={icon}
      onPress={handlePress}
      pressStyle={{ scale: 0.92 }}
      transition="press"
      {...LEGACY_VARIANT_STYLES[variant]}
      {...rest}
    />
  );
}

export function AppFab({
  icon,
  onPress,
  halo = true,
}: {
  icon: ReactElement;
  onPress?: () => void;
  halo?: boolean;
}) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);
  const runHalo = halo && !reduced;
  const press = usePressScale(0.9);
  useEffect(() => {
    if (runHalo) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }
  }, [runHalo, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.16 }],
    opacity: 0.5 + pulse.value * 0.35,
  }));

  const handlePress = () => {
    hapticTap();
    onPress?.();
  };

  return (
    <View style={{ width: 68, height: 68 }}>
      {runHalo && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: -24,
              left: -24,
              width: 116,
              height: 116,
            },
            haloStyle,
          ]}
        >
          <Canvas style={StyleSheet.absoluteFill}>
            <Circle cx={58} cy={58} r={44} color={withAlpha(ICON_MINT_LIGHT, 0.32)}>
              <BlurMask blur={16} style="normal" />
            </Circle>
          </Canvas>
        </Animated.View>
      )}
      <Pressable
        onPress={handlePress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
      >
        <Animated.View style={press.style}>
          <YStack
            w={62}
            h={62}
            m={3}
            br={31}
            ai="center"
            jc="center"
            overflow="hidden"
            shadowColor={ICON_MINT_LIGHT}
            shadowOffset={{ width: 0, height: 8 }}
            shadowRadius={15}
            shadowOpacity={0.7}
          >
            <LinearGradient
              colors={GRADIENT_ACCENT_LIME}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.9, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
            <YStack zIndex={2}>{icon}</YStack>
          </YStack>
        </Animated.View>
      </Pressable>
    </View>
  );
}

import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { ICON_ACCENT, ICON_LIME, ICON_MINT } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
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

const PRESS_EASING = Easing.bezier(0.2, 0.8, 0.3, 1);

export function IconButton({
  icon,
  variant = "glass",
  size,
  onPress,
  ...rest
}: IconButtonProps) {
  const reduced = useReducedMotion();
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

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
        shadowColor="#000"
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
              backgroundColor: "rgba(157, 166, 174, 0.05)",
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
              backgroundColor: "rgba(255, 255, 255, 0.04)",
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
              backgroundColor: "rgba(204, 237, 249, 0.03)",
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
              backgroundColor: "rgba(160, 214, 239, 0.06)",
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
        onPressIn={() => {
          pressScale.value = reduced
            ? 0.92
            : withTiming(0.92, { duration: 130, easing: PRESS_EASING });
        }}
        onPressOut={() => {
          pressScale.value = reduced
            ? 1
            : withTiming(1, { duration: 240, easing: PRESS_EASING });
        }}
        hitSlop={Math.max(0, (44 - resolvedSize) / 2)}
      >
        {({ pressed }) => (
          <Animated.View style={pressStyle}>
            <YStack
              w={resolvedSize}
              h={resolvedSize}
              br={radius}
              ai="center"
              jc="center"
              pos="relative"
              {...(variant === "acc"
                ? {
                    shadowColor: "rgba(45,212,191,1)",
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
                    colors={[ICON_MINT, ICON_LIME]}
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
                        ? "rgba(220,255,245,0.13)"
                        : "rgba(220,255,245,0.07)"
                    }
                  />
                )}
              </YStack>
              {variant === "glass" && (
                <GradientBorder
                  radius={radius}
                  angle={150}
                  colors={["rgba(220,255,245,0.34)", "rgba(220,255,245,0.04)"]}
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

  return (
    <Button
      circular
      size="$3"
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
  const fabPressScale = useSharedValue(1);
  const fabPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabPressScale.value }],
  }));
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
            <Circle cx={58} cy={58} r={44} color="rgba(92,234,212,0.32)">
              <BlurMask blur={16} style="normal" />
            </Circle>
          </Canvas>
        </Animated.View>
      )}
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          fabPressScale.value = reduced
            ? 0.9
            : withTiming(0.9, { duration: 130, easing: PRESS_EASING });
        }}
        onPressOut={() => {
          fabPressScale.value = reduced
            ? 1
            : withTiming(1, { duration: 240, easing: PRESS_EASING });
        }}
      >
        <Animated.View style={fabPressStyle}>
          <YStack
            w={62}
            h={62}
            m={3}
            br={31}
            ai="center"
            jc="center"
            overflow="hidden"
            shadowColor="rgba(92,234,212,1)"
            shadowOffset={{ width: 0, height: 8 }}
            shadowRadius={15}
            shadowOpacity={0.7}
          >
            <LinearGradient
              colors={[ICON_ACCENT, ICON_LIME]}
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

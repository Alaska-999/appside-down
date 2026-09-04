import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
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

interface IconButtonProps
  extends Omit<ButtonProps, "icon" | "onPress" | "size" | "variant"> {
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
  size = 48,
  onPress,
  ...rest
}: IconButtonProps) {
  const handlePress = () => {
    hapticTap();
    onPress?.();
  };

  if (variant === "liquidGlass") {
    return (
      <YStack
        w={44}
        h={44}
        br={22}
        ai="center"
        jc="center"
        onPress={handlePress}
        pressStyle={{ scale: 0.9 }}
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
          br={22}
          overflow="hidden"
          bg="$surfaceGlassFaint"
        >
          <LiquidGlass intensity={20} tint="default" borderRadius={22} />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.06)",
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
              backgroundColor: "rgba(255,255,255,0.34)",
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
              backgroundColor: "rgba(120,220,255,0.16)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 8,
              bottom: 8,
              width: 1,
              backgroundColor: "rgba(255,190,220,0.1)",
            }}
          />
        </YStack>
        <GradientBorder radius={22} preset="lens" />
        {icon}
      </YStack>
    );
  }

  if (variant === "glass" || variant === "acc") {
    const radius = size / 2;
    return (
      <Pressable
        onPress={handlePress}
        hitSlop={Math.max(0, (44 - size) / 2)}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}
      >
        {({ pressed }) => (
          <YStack
            w={size}
            h={size}
            br={radius}
            ai="center"
            jc="center"
            pos="relative"
            {...(variant === "acc"
              ? {
                  shadowColor: "rgba(45,212,191,1)",
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 10,
                  shadowOpacity: 0.6,
                }
              : null)}
            {...(rest as YStackProps)}
          >
            <YStack pos="absolute" t={0} l={0} r={0} b={0} br={radius} overflow="hidden">
              {variant === "acc" ? (
                <LinearGradient
                  colors={["#2DD4BF", "#A3E635"]}
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
                    pressed ? "rgba(220,255,245,0.13)" : "rgba(220,255,245,0.07)"
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
            { position: "absolute", top: -24, left: -24, width: 116, height: 116 },
            haloStyle,
          ]}
        >
          <Canvas style={StyleSheet.absoluteFill}>
            <Circle cx={58} cy={58} r={44} color="rgba(94,234,212,0.32)">
              <BlurMask blur={16} style="normal" />
            </Circle>
          </Canvas>
        </Animated.View>
      )}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.9 : 1 }],
        })}
      >
        <YStack
          w={62}
          h={62}
          m={3}
          br={31}
          ai="center"
          jc="center"
          overflow="hidden"
          shadowColor="rgba(94,234,212,1)"
          shadowOffset={{ width: 0, height: 8 }}
          shadowRadius={15}
          shadowOpacity={0.7}
        >
          <LinearGradient
            colors={["#5EEAD4", "#A3E635"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />
          <YStack zIndex={2}>{icon}</YStack>
        </YStack>
      </Pressable>
    </View>
  );
}

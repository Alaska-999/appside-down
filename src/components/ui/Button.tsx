import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { InnerBloom } from "@/src/components/ui/GlowSurface";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { controlHeight } from "@/tamagui.config";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Spinner, Text, TextProps, useTheme, YStack } from "tamagui";

type ButtonVariant =
  | "primary"
  | "soft"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "glass"
  | "neon"
  | "liquid";

type ButtonSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { height: controlHeight.sm, paddingHorizontal: 18, fontSize: 13 },
  md: { height: controlHeight.md, paddingHorizontal: 24, fontSize: 15 },
  lg: { height: controlHeight.lg, paddingHorizontal: 30, fontSize: 16 },
};

const MIN_TAP_TARGET = 44;

type VariantSpec = {
  bg?: string;
  gradient?: [string, string];
  gloss?: boolean;
  blurIntensity?: number;
  liquidGlass?: boolean;
  borderAngle?: number;
  borderColors?: string[];
  borderPositions?: number[];
  ringWidth?: number;
  ringColor?: string;
  innerBloom?: { color: string; spread: number; blur: number };
  liquidInsets?: boolean;
  shadow?: {
    color: string;
    offset: { width: number; height: number };
    radius: number;
    opacity: number;
  };
  textColor: string;
  pressedTextColor?: string;
  pressedBg?: string;
  textShadow?: Pick<
    TextProps,
    "textShadowColor" | "textShadowOffset" | "textShadowRadius"
  >;
};

const VARIANT_STYLES: Record<ButtonVariant, VariantSpec> = {
  primary: {
    gradient: ["#2DD4BF", "#A3E635"],
    gloss: true,
    textColor: "$onAccentText",
    shadow: { color: "rgba(45,212,191,1)", offset: { width: 0, height: 6 }, radius: 13, opacity: 0.55 },
  },
  soft: {
    gradient: ["#0D9488", "#65A30D"],
    gloss: true,
    textColor: "$color",
    shadow: { color: "rgba(13,148,136,1)", offset: { width: 0, height: 5 }, radius: 10, opacity: 0.55 },
  },
  secondary: {
    bg: "rgba(220,255,245,0.06)",
    blurIntensity: 40,
    borderAngle: 150,
    borderColors: ["rgba(220,255,245,0.28)", "rgba(220,255,245,0.06)"],
    textColor: "$color",
  },
  outline: {
    bg: "rgba(45,212,191,0.05)",
    borderAngle: 150,
    borderColors: ["rgba(163,230,53,0.6)", "rgba(163,230,53,0.18)"],
    textColor: "$limeLight",
  },
  ghost: {
    textColor: "$colorMuted",
    pressedTextColor: "$color",
    pressedBg: "rgba(220,255,245,0.05)",
  },
  danger: {
    bg: "rgba(239,68,68,0.13)",
    borderAngle: 150,
    borderColors: ["rgba(239,68,68,0.55)", "rgba(239,68,68,0.14)"],
    textColor: "$roseSoft",
  },
  glass: {
    bg: "rgba(45,212,191,0.12)",
    blurIntensity: 45,
    borderAngle: 150,
    borderColors: ["rgba(45,212,191,0.5)", "rgba(45,212,191,0.1)"],
    textColor: "$mintLight",
  },
  neon: {
    bg: "rgba(45,212,191,0.05)",
    ringWidth: 1.5,
    ringColor: "rgba(94,234,212,0.85)",
    innerBloom: { color: "rgba(45,212,191,0.16)", spread: 18, blur: 12 },
    shadow: { color: "rgba(45,212,191,1)", offset: { width: 0, height: 0 }, radius: 13, opacity: 0.45 },
    textColor: "$mintLight",
  },
  liquid: {
    bg: "rgba(255,255,255,0.055)",
    blurIntensity: 10,
    liquidGlass: true,
    liquidInsets: true,
    innerBloom: { color: "rgba(255,255,255,0.08)", spread: 18, blur: 12 },
    borderAngle: 155,
    borderColors: ["rgba(255,255,255,0.85)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0.4)"],
    borderPositions: [0, 0.46, 1],
    shadow: { color: "#000", offset: { width: 0, height: 10 }, radius: 15, opacity: 0.5 },
    textColor: "#FFFFFF",
    textShadow: {
      textShadowColor: "rgba(0,0,0,0.45)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
  },
};

function Sheen({ dark, height }: { dark: boolean; height: number }) {
  const reduced = useReducedMotion();
  const shift = useSharedValue(-1);

  useEffect(() => {
    if (!reduced) {
      shift.value = -1;
      shift.value = withRepeat(
        withTiming(2.6, { duration: 3800, easing: Easing.bezier(0.5, 0, 0.5, 1) }),
        -1,
        false,
      );
    }
  }, [reduced, shift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: `${shift.value * 100}%` }],
  }));

  if (reduced) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", top: 0, bottom: 0, left: 0, width: "60%", zIndex: 4 },
        style,
      ]}
    >
      <LinearGradient
        colors={
          dark
            ? ["rgba(94,234,212,0)", "rgba(94,234,212,0.42)", "rgba(94,234,212,0)"]
            : ["rgba(255,255,255,0)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0)"]
        }
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function Flood({ pressed }: { pressed: boolean }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(pressed ? 1 : 0, {
      duration: pressed ? 450 : 200,
      easing: Easing.bezier(0.2, 0.8, 0.3, 1),
    });
  }, [pressed, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 280,
          height: 280,
          marginLeft: -140,
          marginTop: -140,
          borderRadius: 140,
          zIndex: 3,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={["rgba(190,242,100,0.95)", "rgba(45,212,191,0.55)", "rgba(45,212,191,0)"]}
        locations={[0, 0.58, 0.72]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 140 }]}
      />
    </Animated.View>
  );
}

interface AppButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  sheen?: boolean | "dark";
  flood?: boolean;
  split?: ReactNode;
  children: ReactNode;
}

export function AppButton({
  variant = "primary",
  size = "md",
  onPress,
  disabled,
  loading,
  icon,
  sheen,
  flood,
  split,
  children,
}: AppButtonProps) {
  const theme = useTheme();
  const { height, paddingHorizontal, fontSize } = SIZE_STYLES[size];
  const radius = height / 2;
  const spec = VARIANT_STYLES[variant];
  const isBlocked = disabled || loading;
  const verticalHitSlop = Math.max(0, (MIN_TAP_TARGET - height) / 2);

  const resolveColor = (c: string) =>
    c.startsWith("$")
      ? theme[c.slice(1) as keyof typeof theme]?.get?.() ?? c
      : c;

  const handlePress = () => {
    if (isBlocked) return;
    hapticTap();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isBlocked}
      hitSlop={{ top: verticalHitSlop, bottom: verticalHitSlop }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !isBlocked ? 0.965 : 1 }],
      })}
    >
      {({ pressed }) => {
        const floodActive = Boolean(flood) && pressed && !isBlocked;
        const textColor =
          variant === "danger"
            ? "$roseSoft"
            : floodActive
              ? "#0D1117"
              : pressed && spec.pressedTextColor
                ? spec.pressedTextColor
                : spec.textColor;
        const shadowProps =
          spec.shadow && !disabled
            ? {
                shadowColor: spec.shadow.color,
                shadowOffset: spec.shadow.offset,
                shadowRadius: spec.shadow.radius,
                shadowOpacity: spec.shadow.opacity,
              }
            : null;

        return (
          <YStack
            br={radius}
            opacity={disabled ? 0.34 : 1}
            borderWidth={spec.ringWidth}
            borderColor={spec.ringColor}
            {...shadowProps}
          >
            <YStack
              height={height}
              pl={split ? 26 : paddingHorizontal}
              pr={split ? 6 : paddingHorizontal}
              br={radius}
              ai="center"
              jc="center"
              fd="row"
              gap={split ? 14 : 9}
              pos="relative"
              overflow="hidden"
              bg={pressed && spec.pressedBg ? spec.pressedBg : undefined}
            >
              {spec.gradient && (
                <LinearGradient
                  colors={spec.gradient}
                  start={{ x: 0, y: 0.4 }}
                  end={{ x: 1, y: 0.6 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              {!spec.gradient && (spec.blurIntensity || spec.liquidGlass) && (
                <LiquidGlass
                  intensity={spec.blurIntensity ?? 25}
                  tint="default"
                  liquid={spec.liquidGlass}
                  borderRadius={radius}
                  backgroundColor={spec.bg}
                />
              )}
              {!spec.gradient && !spec.blurIntensity && !spec.liquidGlass && spec.bg && (
                <View
                  style={[StyleSheet.absoluteFill, { backgroundColor: spec.bg }]}
                />
              )}
              {spec.gloss && (
                <LinearGradient
                  colors={["rgba(255,255,255,0.26)", "rgba(255,255,255,0)"]}
                  locations={[0, 0.52]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[StyleSheet.absoluteFill, { margin: 1, borderRadius: radius }]}
                  pointerEvents="none"
                />
              )}
              {spec.innerBloom && (
                <InnerBloom
                  color={spec.innerBloom.color}
                  radius={radius}
                  spread={spec.innerBloom.spread}
                  blur={spec.innerBloom.blur}
                />
              )}
              {spec.liquidInsets && (
                <>
                  <View
                    pointerEvents="none"
                    style={{ position: "absolute", top: 0, left: 12, right: 12, height: 1.2, backgroundColor: "rgba(255,255,255,0.6)" }}
                  />
                  <View
                    pointerEvents="none"
                    style={{ position: "absolute", bottom: 0, left: 12, right: 12, height: 1.2, backgroundColor: "rgba(255,255,255,0.18)" }}
                  />
                </>
              )}
              {flood && <Flood pressed={floodActive} />}
              {sheen && !isBlocked && <Sheen dark={sheen === "dark"} height={height} />}
              <YStack fd="row" ai="center" gap={9} zIndex={5}>
                {loading ? (
                  <Spinner size="small" color={textColor} />
                ) : (
                  icon
                )}
                <Text
                  fontSize={fontSize}
                  fontWeight="600"
                  color={textColor}
                  {...spec.textShadow}
                >
                  {children}
                </Text>
              </YStack>
              {split && (
                <YStack
                  w={40}
                  h={40}
                  br={20}
                  ai="center"
                  jc="center"
                  bg="rgba(8,9,12,0.82)"
                  zIndex={5}
                  transform={[{ translateX: pressed ? 4 : 0 }]}
                >
                  {split}
                </YStack>
              )}
            </YStack>
            {spec.borderColors && (
              <GradientBorder
                radius={radius}
                angle={spec.borderAngle}
                colors={spec.borderColors}
                positions={spec.borderPositions ?? [0, 1]}
              />
            )}
          </YStack>
        );
      }}
    </Pressable>
  );
}

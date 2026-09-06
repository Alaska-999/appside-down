import { InnerBloom } from "@/src/components/ui/GlowSurface";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_PURE_BLACK,
  ICON_STATUS_DANGER,
} from "@/src/constants/iconColors";
import { GRADIENT_PRIMARY, GRADIENT_SOFT } from "@/src/constants/gradients";
import { EASE_STANDARD } from "@/src/constants/motion";
import {
  BLACK_SCRIM_SOFT,
  BUTTON_SECONDARY_BORDER,
  GLASS_BORDER_MID,
  GLASS_SHEEN_MED,
  GLASS_SHEEN_STRONG,
  GLOSS_TOP_LINE,
  LIQUID_BORDER_ICE,
  LIQUID_BORDER_TEAL_ICE,
  MINT_FADE_TRANSPARENT,
  SCRIM_BASE_HEAVY,
  SKY_GLOW_FAINT,
  TRANSPARENT_WHITE,
  WHITE_BLOOM_FAINT,
} from "@/src/constants/rawColors";
import { RING_GLOW_BORDER } from "@/src/constants/focus";
import {
  SURFACE_GLASS_BG_FAINT,
  SURFACE_GLOW_COLOR,
  SURFACE_GLOW_SOFT,
} from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { usePressScale } from "@/src/hooks/usePressScale";
import { withAlpha } from "@/src/utils/withAlpha";
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
  disabledOpacity?: number;
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

export const VARIANT_STYLES: Record<ButtonVariant, VariantSpec> = {
  primary: {
    gradient: GRADIENT_PRIMARY,
    gloss: true,
    textColor: "$onAccentText",
    shadow: {
      color: ICON_MINT,
      offset: { width: 0, height: 1 },
      radius: 5,
      opacity: 0.35,
    },
  },
  soft: {
    gradient: GRADIENT_SOFT,
    gloss: true,
    textColor: "$color",
    shadow: {
      color: ICON_MINT,
      offset: { width: 0, height: 1 },
      radius: 5,
      opacity: 0.35,
    },
  },

  secondary: {
    bg: SURFACE_GLASS_BG_FAINT,
    blurIntensity: 12,
    borderAngle: 135,
    borderColors: [BUTTON_SECONDARY_BORDER, withAlpha(ICON_MINT_LIGHT, 0.1)],
    textColor: "$color",
  },
  outline: {
    bg: withAlpha(ICON_MINT, 0.05),
    borderAngle: 150,
    borderColors: [withAlpha(ICON_LIME, 0.6), withAlpha(ICON_LIME, 0.18)],
    textColor: "$limeLight",
  },
  ghost: {
    textColor: "$colorMuted",
    pressedTextColor: "$iconMuted",
    pressedBg: "$glassBgSubtle",
  },
  danger: {
    bg: withAlpha(ICON_STATUS_DANGER, 0.16),
    borderAngle: 150,
    borderColors: [
      withAlpha(ICON_STATUS_DANGER, 0.6),
      withAlpha(ICON_STATUS_DANGER, 0.16),
    ],
    textColor: "$roseSoft",
  },
  glass: {
    bg: withAlpha(ICON_MINT, 0.12),
    blurIntensity: 45,
    borderAngle: 150,
    borderColors: [SURFACE_GLOW_COLOR, SURFACE_GLOW_SOFT],
    textColor: "$mintLight",
  },
  neon: {
    bg: withAlpha(ICON_MINT, 0.05),
    ringWidth: 1.5,
    ringColor: RING_GLOW_BORDER,
    innerBloom: { color: withAlpha(ICON_MINT, 0.16), spread: 18, blur: 12 },
    shadow: {
      color: ICON_MINT,
      offset: { width: 0, height: 0 },
      radius: 13,
      opacity: 0.45,
    },
    textColor: "$mintLight",
  },

  liquid: {
    bg: SURFACE_GLASS_BG_FAINT,
    blurIntensity: 10,
    liquidGlass: true,
    liquidInsets: true,
    innerBloom: { color: WHITE_BLOOM_FAINT, spread: 15, blur: 10 },

    disabledOpacity: 0.45,
    borderAngle: 160,
    borderColors: [LIQUID_BORDER_ICE, GLASS_BORDER_MID, LIQUID_BORDER_TEAL_ICE],
    borderPositions: [0, 0.46, 1],
    shadow: {
      color: ICON_PURE_BLACK,
      offset: { width: 0, height: 10 },
      radius: 15,
      opacity: 0.5,
    },
    textColor: "$white",
    textShadow: {
      textShadowColor: BLACK_SCRIM_SOFT,
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
        withTiming(2.6, {
          duration: 3800,
          easing: Easing.bezier(0.5, 0, 0.5, 1),
        }),
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
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "60%",
          zIndex: 4,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={
          dark
            ? [
                withAlpha(ICON_MINT_LIGHT, 0),
                withAlpha(ICON_MINT_LIGHT, 0.42),
                withAlpha(ICON_MINT_LIGHT, 0),
              ]
            : [TRANSPARENT_WHITE, GLASS_SHEEN_STRONG, TRANSPARENT_WHITE]
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
      duration: pressed ? 500 : 200,
      easing: Easing.bezier(0.2, 0.7, 0.2, 1),
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
        colors={[
          withAlpha(ICON_LIME_LIGHT, 0.95),
          withAlpha(ICON_MINT, 0.55),
          MINT_FADE_TRANSPARENT,
        ]}
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
  textColor?: string;
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
  textColor: textColorOverride,
  children,
}: AppButtonProps) {
  const theme = useTheme();
  const { height, paddingHorizontal, fontSize } = SIZE_STYLES[size];
  const radius = height / 2;
  const spec = VARIANT_STYLES[variant];
  const isBlocked = disabled || loading;
  const verticalHitSlop = Math.max(0, (MIN_TAP_TARGET - height) / 2);
  const reduced = useReducedMotion();
  const press = usePressScale(0.965);
  const targetOpacity = disabled ? (spec.disabledOpacity ?? 0.34) : 1;
  const stateOpacity = useSharedValue(targetOpacity);
  useEffect(() => {
    stateOpacity.value = reduced
      ? targetOpacity
      : withTiming(targetOpacity, { duration: 240, easing: EASE_STANDARD });
  }, [targetOpacity, reduced, stateOpacity]);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: stateOpacity.value,
  }));

  const resolveColor = (c: string) =>
    c.startsWith("$")
      ? (theme[c.slice(1) as keyof typeof theme]?.get?.() ?? c)
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
      onPressIn={() => {
        if (isBlocked) return;
        press.onPressIn();
      }}
      onPressOut={() => {
        if (isBlocked) return;
        press.onPressOut();
      }}
    >
      {({ pressed }) => {
        const floodActive = Boolean(flood) && pressed && !isBlocked;
        const textColor =
          textColorOverride ??
          (variant === "danger"
            ? "$roseSoft"
            : floodActive
              ? "$nearBlack"
              : pressed && spec.pressedTextColor
                ? spec.pressedTextColor
                : spec.textColor);
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
          <Animated.View style={[press.style, opacityStyle]}>
            <YStack
              br={radius}
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
                {!spec.gradient &&
                  !spec.blurIntensity &&
                  !spec.liquidGlass &&
                  spec.bg && (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: spec.bg },
                      ]}
                    />
                  )}
                {spec.gloss && (
                  <LinearGradient
                    colors={[GLOSS_TOP_LINE, TRANSPARENT_WHITE]}
                    locations={[0, 0.52]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={[
                      StyleSheet.absoluteFill,
                      { margin: 1, borderRadius: radius },
                    ]}
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
                {spec.liquidInsets && !disabled && (
                  <>
                    <View
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 10,
                        right: 10,
                        height: 1,
                        backgroundColor: GLASS_SHEEN_MED,
                      }}
                    />
                    <View
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 10,
                        right: 10,
                        height: 1,
                        backgroundColor: SKY_GLOW_FAINT,
                      }}
                    />
                  </>
                )}
                {flood && <Flood pressed={floodActive} />}
                {sheen && !isBlocked && (
                  <Sheen dark={sheen === "dark"} height={height} />
                )}
                <YStack fd="row" ai="center" gap={9} zIndex={5}>
                  {loading ? <Spinner size="small" color={textColor} /> : icon}
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
                    br="$cardSoft"
                    ai="center"
                    jc="center"
                    bg={SCRIM_BASE_HEAVY}
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
          </Animated.View>
        );
      }}
    </Pressable>
  );
}

import { GradientBorder } from "@/src/components/ui/surface/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/surface/LiquidGlass";
import {
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import { GLASS_PILL_MINT_EDGE, GLASS_SHEEN_MED } from "@/src/constants/rawColors";
import {
  SURFACE_GLASS_BG,
  TEXT_MINT_MED,
  TEXT_MINT_META,
} from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { ComponentType } from "react";
import { View } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";

export type GlassPillTone =
  | "accent"
  | "accentRing"
  | "neutral"
  | "delta"
  | "deltaCool";
export type GlassPillSize = "lg" | "md" | "sm";

interface ToneStyle {
  glass: boolean;
  glassBg: string;
  glassIntensity: number;
  borderColors?: string[];
  borderPositions?: number[];
  borderAngle?: number;
  borderPreset?: "lens";
  shadow?: {
    color: string;
    offset: { width: number; height: number };
    radius: number;
    opacity: number;
  };
  topHighlight: boolean;
  topHighlightColor?: string;
  spinnerColor?: string;
  iconColorActive: string;
  iconColorInactive: string;
  textColorActive: string;
  textColorInactive: string;
  centerSelf: boolean;
}

const TONE_STYLES: Record<GlassPillTone, ToneStyle> = {
  accent: {
    glass: true,
    glassBg: withAlpha(ICON_MINT, 0.15),
    glassIntensity: 35,
    borderColors: [withAlpha(ICON_MINT, 0.7), GLASS_PILL_MINT_EDGE],
    borderPositions: [0, 1],
    borderAngle: 150,
    topHighlight: false,
    iconColorActive: ICON_MINT_LIGHT,
    iconColorInactive: ICON_MINT_LIGHT,
    textColorActive: "$mintLight",
    textColorInactive: "$mintLight",
    centerSelf: true,
  },
  neutral: {
    glass: true,
    glassBg: SURFACE_GLASS_BG,
    glassIntensity: 24,
    borderColors: [
      withAlpha(ICON_WHITE, 0.34),
      withAlpha(ICON_WHITE, 0.05),
      withAlpha(ICON_WHITE, 0.02),
    ],
    borderPositions: [0, 0.46, 1],
    borderAngle: 140,
    topHighlight: false,
    iconColorActive: TEXT_MINT_META,
    iconColorInactive: TEXT_MINT_MED,
    textColorActive: "$color",
    textColorInactive: "$textMuted",
    centerSelf: true,
  },
  accentRing: {
    glass: true,
    glassBg: withAlpha(ICON_MINT, 0.12),
    glassIntensity: 17,
    borderColors: [withAlpha(ICON_MINT, 0.5), withAlpha(ICON_MINT, 0.5)],
    borderPositions: [0, 1],
    borderAngle: 180,
    topHighlight: true,
    topHighlightColor: withAlpha(ICON_WHITE, 0.18),
    iconColorActive: ICON_MINT_LIGHT,
    iconColorInactive: ICON_MINT_LIGHT,
    textColorActive: "$mintLight",
    textColorInactive: "$mintLight",
    centerSelf: false,
  },
  delta: {
    glass: false,
    glassBg: withAlpha(ICON_LIME, 0.15),
    glassIntensity: 0,
    borderColors: [withAlpha(ICON_LIME, 0.28), withAlpha(ICON_LIME, 0.28)],
    borderPositions: [0, 1],
    borderAngle: 180,
    topHighlight: false,
    iconColorActive: ICON_LIME_LIGHT,
    iconColorInactive: ICON_LIME_LIGHT,
    textColorActive: "$limeLight",
    textColorInactive: "$limeLight",
    centerSelf: true,
  },
  deltaCool: {
    glass: false,
    glassBg: withAlpha(ICON_MINT, 0.12),
    glassIntensity: 0,
    borderColors: [withAlpha(ICON_MINT, 0.35), withAlpha(ICON_MINT, 0.35)],
    borderPositions: [0, 1],
    borderAngle: 180,
    topHighlight: false,
    iconColorActive: ICON_MINT_LIGHT,
    iconColorInactive: ICON_MINT_LIGHT,
    textColorActive: "$mintLight",
    textColorInactive: "$mintLight",
    centerSelf: true,
  },
};

interface SizeStyle {
  height: number;
  px: number;
  gap: number;
  fontSize: number;
  fontWeight: "600" | "700" | "800";
  letterSpacing?: number;
  maxFontScale?: number;
  iconSize: number;
  iconStroke: number;
}

const SIZE_STYLES: Record<GlassPillSize, SizeStyle> = {
  lg: {
    height: 46,
    px: 24,
    gap: 7,
    fontSize: 14,
    fontWeight: "600",
    iconSize: 17,
    iconStroke: 2.6,
  },
  md: {
    height: 38,
    px: 15,
    gap: 8,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.17,
    maxFontScale: 1.2,
    iconSize: 15,
    iconStroke: 2.6,
  },
  sm: {
    height: 36,
    px: 15,
    gap: 7,
    fontSize: 13,
    fontWeight: "600",
    maxFontScale: 1.2,
    iconSize: 14,
    iconStroke: 2.4,
  },
};

interface GlassPillProps {
  tone: GlassPillTone;
  size: GlassPillSize;
  icon?: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  tabularNums?: boolean;
}

export function GlassPill({
  tone,
  size,
  icon: Icon,
  label,
  onPress,
  loading,
  disabled,
  tabularNums,
}: GlassPillProps) {
  const t = TONE_STYLES[tone];
  const s = SIZE_STYLES[size];
  const active = !disabled && !loading;
  const pressable = !!onPress;
  const radius = s.height / 2;

  return (
    <YStack
      accessibilityRole={pressable ? "button" : "text"}
      accessibilityLabel={label}
      accessibilityState={pressable ? { disabled: !active } : undefined}
      als={t.centerSelf ? "center" : undefined}
      transition={pressable ? "press" : undefined}
      pressStyle={pressable && active ? { scale: 0.95 } : undefined}
      onPress={
        pressable
          ? () => {
              if (!active) return;
              hapticTap();
              onPress();
            }
          : undefined
      }
    >
      <YStack
        h={s.height}
        px={s.px}
        br={radius}
        pos="relative"
        jc="center"
        {...(t.shadow
          ? {
              shadowColor: t.shadow.color,
              shadowOffset: t.shadow.offset,
              shadowRadius: t.shadow.radius,
              shadowOpacity: t.shadow.opacity,
            }
          : null)}
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
          {t.glass ? (
            <LiquidGlass
              intensity={t.glassIntensity}
              borderRadius={radius}
              backgroundColor={t.glassBg}
            />
          ) : (
            <YStack f={1} bg={t.glassBg} />
          )}
          {t.topHighlight && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 8,
                right: 8,
                height: 1,
                backgroundColor: t.topHighlightColor ?? GLASS_SHEEN_MED,
              }}
            />
          )}
        </YStack>
        {t.borderPreset ? (
          <GradientBorder radius={radius} preset={t.borderPreset} />
        ) : (
          <GradientBorder
            radius={radius}
            angle={t.borderAngle}
            colors={t.borderColors!}
            positions={t.borderPositions!}
          />
        )}
        <XStack ai="center" gap={s.gap} zIndex={2}>
          {loading ? (
            <Spinner size="small" color={t.spinnerColor} />
          ) : Icon ? (
            <Icon
              size={s.iconSize}
              strokeWidth={s.iconStroke}
              color={active ? t.iconColorActive : t.iconColorInactive}
            />
          ) : null}
          <Text
            fontSize={s.fontSize}
            fontWeight={s.fontWeight}
            letterSpacing={s.letterSpacing}
            maxFontSizeMultiplier={s.maxFontScale}
            fontVariant={tabularNums ? ["tabular-nums"] : undefined}
            color={active ? t.textColorActive : t.textColorInactive}
          >
            {label}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

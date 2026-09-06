import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_ACCENT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_PURE_BLACK,
  ICON_SUBTLE,
} from "@/src/constants/iconColors";
import { GLASS_PILL_MINT_EDGE, GLASS_SHEEN_MED } from "@/src/constants/rawColors";
import { SURFACE_GLASS_BG } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { ComponentType } from "react";
import { View } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";

export type GlassPillTone = "accent" | "save";
export type GlassPillSize = "lg" | "md";

interface ToneStyle {
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
  spinnerColor?: string;
  iconColorActive: string;
  iconColorInactive: string;
  textColorActive: string;
  textColorInactive: string;
  centerSelf: boolean;
}

const TONE_STYLES: Record<GlassPillTone, ToneStyle> = {
  accent: {
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
  save: {
    glassBg: SURFACE_GLASS_BG,
    glassIntensity: 25,
    borderPreset: "lens",
    shadow: {
      color: ICON_PURE_BLACK,
      offset: { width: 0, height: 3 },
      radius: 5,
      opacity: 0.7,
    },
    topHighlight: true,
    spinnerColor: "$mintLight",
    iconColorActive: ICON_ACCENT,
    iconColorInactive: ICON_SUBTLE,
    textColorActive: "$iconOnGlass",
    textColorInactive: "$textMuted",
    centerSelf: false,
  },
};

interface SizeStyle {
  height: number;
  px: number;
  gap: number;
  fontSize: number;
  fontWeight: "600" | "700";
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
    height: 40,
    px: 17,
    gap: 8,
    fontSize: 14,
    fontWeight: "700",
    iconSize: 17,
    iconStroke: 2.3,
  },
};

interface GlassPillProps {
  tone: GlassPillTone;
  size: GlassPillSize;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GlassPill({
  tone,
  size,
  icon: Icon,
  label,
  onPress,
  loading,
  disabled,
}: GlassPillProps) {
  const t = TONE_STYLES[tone];
  const s = SIZE_STYLES[size];
  const active = !disabled && !loading;
  const radius = s.height / 2;

  return (
    <YStack
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !active }}
      als={t.centerSelf ? "center" : undefined}
      transition="press"
      pressStyle={active ? { scale: 0.95 } : undefined}
      onPress={() => {
        if (!active) return;
        hapticTap();
        onPress();
      }}
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
          <LiquidGlass
            intensity={t.glassIntensity}
            borderRadius={radius}
            backgroundColor={t.glassBg}
          />
          {t.topHighlight && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 8,
                right: 8,
                height: 1,
                backgroundColor: GLASS_SHEEN_MED,
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
          ) : (
            <Icon
              size={s.iconSize}
              strokeWidth={s.iconStroke}
              color={active ? t.iconColorActive : t.iconColorInactive}
            />
          )}
          <Text
            fontSize={s.fontSize}
            fontWeight={s.fontWeight}
            color={active ? t.textColorActive : t.textColorInactive}
          >
            {label}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

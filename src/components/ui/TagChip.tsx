import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import {
  GLASS_BORDER_BOTTOM,
  GLASS_BORDER_TOP,
  GLASS_SHEEN_STRONG,
  SKY_GLOW,
  WHITE_SHEEN_MED,
} from "@/src/constants/rawColors";
import { SURFACE_GLASS_BG } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { Plus } from "lucide-react-native";
import { ReactNode } from "react";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

type TagChipVariant = "default" | "on" | "add";

const CHIP_HEIGHT = 34;
const CHIP_RADIUS = 999;

const CHIP_STYLES: Record<
  TagChipVariant,
  {
    textColor: string;
    fill: string;
    borderColors: string[];
    borderPositions: number[];
    glow: boolean;
  }
> = {
  default: {
    textColor: "$mutedLight",
    fill: SURFACE_GLASS_BG,
    borderColors: [GLASS_BORDER_TOP, GLASS_BORDER_BOTTOM, SKY_GLOW],
    borderPositions: [0, 0.44, 1],
    glow: false,
  },
  on: {
    textColor: "$text",
    fill: SURFACE_GLASS_BG,
    borderColors: [
      GLASS_SHEEN_STRONG,
      withAlpha(ICON_MINT_LIGHT, 0.4),
      withAlpha(ICON_MINT_LIGHT, 0.5),
    ],
    borderPositions: [0, 0.6, 1],
    glow: true,
  },
  add: {
    textColor: "$mintLight",
    fill: withAlpha(ICON_MINT, 0.12),
    borderColors: [GLASS_BORDER_TOP, GLASS_BORDER_BOTTOM, SKY_GLOW],
    borderPositions: [0, 0.44, 1],
    glow: false,
  },
};

export function TagChip({
  label,
  count,
  leading,
  variant = "default",
  onPress,
}: {
  label: string;
  count?: number;
  leading?: ReactNode;
  variant?: TagChipVariant;
  onPress?: () => void;
}) {
  const s = CHIP_STYLES[variant];
  const countColor = variant === "on" ? "$textMuted" : "$mutedDim";

  return (
    <YStack
      accessibilityRole="button"
      accessibilityLabel={label || (variant === "add" ? "Add tag" : undefined)}
      hitSlop={5}
      onPress={
        onPress
          ? () => {
              hapticTap();
              onPress();
            }
          : undefined
      }
      {...(onPress
        ? { pressStyle: { scale: 0.985 }, transition: "press" }
        : null)}
    >
      <YStack
        h={CHIP_HEIGHT}
        px={14}
        br={CHIP_RADIUS}
        pos="relative"
        jc="center"
        shadowColor={s.glow ? "$mintGlassBorder" : ICON_PURE_BLACK}
        shadowOffset={{ width: 0, height: s.glow ? 0 : 3 }}
        shadowRadius={4}
        shadowOpacity={0.4}
      >
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={CHIP_RADIUS}
          overflow="hidden"
        >
          <LiquidGlass
            intensity={10}
            tint="default"
            borderRadius={CHIP_RADIUS}
            backgroundColor={s.fill}
          />
          {s.glow && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 8,
                right: 8,
                height: 1,
                backgroundColor: WHITE_SHEEN_MED,
              }}
            />
          )}
        </YStack>
        <GradientBorder
          radius={CHIP_HEIGHT / 2}
          angle={160}
          colors={s.borderColors}
          positions={s.borderPositions}
        />
        <XStack ai="center" gap={label ? 7 : 0} zIndex={2}>
          {variant === "add" && (
            <Plus size={13} color={ICON_MINT_LIGHT} strokeWidth={2.4} />
          )}
          {leading}
          {!!label && (
            <Text fontSize={12.5} fontWeight="600" color={s.textColor}>
              {label}
            </Text>
          )}
          {count !== undefined && (
            <Text fontSize={12.5} fontWeight="700" color={countColor}>
              {count}
            </Text>
          )}
        </XStack>
      </YStack>
    </YStack>
  );
}

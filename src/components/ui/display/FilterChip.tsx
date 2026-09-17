import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { ICON_MINT, ICON_SUBTLE } from "@/src/constants/iconColors";
import { SURFACE_MINT_GLASS_BG } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Text, XStack } from "tamagui";

type FilterChipVariant = "default" | "on" | "solid";

const CHIP_STYLES: Record<
  FilterChipVariant,
  { bg?: string; textColor: string; borderColor?: string; fontWeight: "400" | "600" }
> = {
  default: {
    bg: "$glassBg",
    textColor: "$textMuted",
    borderColor: "$borderColor",
    fontWeight: "400",
  },
  on: {
    bg: SURFACE_MINT_GLASS_BG,
    textColor: "$mintLight",
    borderColor: withAlpha(ICON_MINT, 0.45),
    fontWeight: "400",
  },
  solid: {
    textColor: "$nearBlack",
    fontWeight: "600",
  },
};

export function FilterChip({
  label,
  variant = "default",
  icon,
  onPress,
  disabled,
}: {
  label: string;
  variant?: FilterChipVariant;
  icon?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const s = CHIP_STYLES[variant];
  const active = onPress && !disabled;

  return (
    <XStack
      h={36}
      px={14}
      br={999}
      ai="center"
      gap={6}
      overflow="hidden"
      bg={s.bg}
      opacity={disabled ? 0.5 : 1}
      borderWidth={variant === "solid" ? 0 : 1}
      borderColor={s.borderColor}
      hitSlop={4}
      disabled={disabled}
      onPress={
        active
          ? () => {
              hapticTap();
              onPress?.();
            }
          : undefined
      }
      {...(active ? { pressStyle: { scale: 0.97 }, transition: "press" } : null)}
      {...(variant !== "default" && !disabled
        ? {
            shadowColor: ICON_MINT,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 8,
            shadowOpacity: 0.55,
          }
        : null)}
    >
      {variant === "solid" && (
        <LinearGradient
          colors={GRADIENT_PRIMARY}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {icon}
      <Text
        fontSize={13}
        fontWeight={s.fontWeight}
        color={disabled ? ICON_SUBTLE : s.textColor}
      >
        {label}
      </Text>
    </XStack>
  );
}

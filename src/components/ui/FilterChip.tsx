import { ICON_LIME, ICON_MINT } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
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
    bg: "rgba(220,255,245,0.06)",
    textColor: "$textMuted",
    borderColor: "rgba(220,255,245,0.11)",
    fontWeight: "400",
  },
  on: {
    bg: "rgba(45,212,191,0.14)",
    textColor: "$mintLight",
    borderColor: "rgba(45,212,191,0.45)",
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
}: {
  label: string;
  variant?: FilterChipVariant;
  icon?: ReactNode;
  onPress?: () => void;
}) {
  const s = CHIP_STYLES[variant];

  return (
    <XStack
      h={36}
      px={14}
      br={999}
      ai="center"
      gap={6}
      overflow="hidden"
      bg={s.bg}
      borderWidth={variant === "solid" ? 0 : 1}
      borderColor={s.borderColor}
      hitSlop={4}
      onPress={
        onPress
          ? () => {
              hapticTap();
              onPress();
            }
          : undefined
      }
      {...(onPress
        ? { pressStyle: { scale: 0.97 }, transition: "press" }
        : null)}
      {...(variant !== "default"
        ? {
            shadowColor: "rgba(45,212,191,1)",
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 8,
            shadowOpacity: 0.55,
          }
        : null)}
    >
      {variant === "solid" && (
        <LinearGradient
          colors={[ICON_MINT, ICON_LIME]}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {icon}
      <Text fontSize={13} fontWeight={s.fontWeight} color={s.textColor}>
        {label}
      </Text>
    </XStack>
  );
}

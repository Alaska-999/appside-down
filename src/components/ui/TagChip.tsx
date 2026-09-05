import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { ICON_ACCENT } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
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
    fill: "rgba(220,255,245,0.05)",
    borderColors: [
      "rgba(255,255,255,0.35)",
      "rgba(255,255,255,0.04)",
      "rgba(150,220,255,0.15)",
    ],
    borderPositions: [0, 0.46, 1],
    glow: false,
  },
  on: {
    textColor: "$text",
    fill: "rgba(220,255,245,0.05)",
    borderColors: [
      "rgba(255,255,255,0.6)",
      "rgba(94,234,212,0.4)",
      "rgba(94,234,212,0.5)",
    ],
    borderPositions: [0, 0.6, 1],
    glow: true,
  },
  add: {
    textColor: "$mintLight",
    fill: "rgba(45,212,191,0.1)",
    borderColors: [
      "rgba(255,255,255,0.44)",
      "rgba(255,255,255,0.04)",
      "rgba(150,220,255,0.2)",
    ],
    borderPositions: [0, 0.46, 1],
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
        px={13}
        br={CHIP_RADIUS}
        pos="relative"
        jc="center"
        shadowColor={s.glow ? "rgb(94, 234, 213)" : "#000"}
        shadowOffset={{ width: 0, height: s.glow ? 0 : 3 }}
        shadowRadius={s.glow ? 7 : 5}
        shadowOpacity={s.glow ? 0.55 : 0.35}
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
                backgroundColor: "rgba(255,255,255,0.4)",
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
            <Plus size={14} color={ICON_ACCENT} strokeWidth={2.3} />
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

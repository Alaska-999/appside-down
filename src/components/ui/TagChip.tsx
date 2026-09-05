import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { Plus, X } from "lucide-react-native";
import { Pressable } from "react-native";
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
    textColor: "#B7CEDA",
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
    textColor: "#5EEAD4",
    fill: "rgba(45,212,191,0.14)",
    borderColors: ["rgba(45,212,191,0.45)", "rgba(45,212,191,0.45)"],
    borderPositions: [0, 1],
    glow: true,
  },
  add: {
    textColor: "#5EEAD4",
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
  variant = "default",
  onPress,
  onRemove,
}: {
  label: string;
  count?: number;
  variant?: TagChipVariant;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  const s = CHIP_STYLES[variant];
  const countColor = variant === "on" ? "#8FA8B8" : "#5A6B7A";

  return (
    <Pressable
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
      style={({ pressed }) => ({
        transform: [{ scale: pressed && onPress ? 0.97 : 1 }],
      })}
    >
      <YStack
        h={CHIP_HEIGHT}
        px={13}
        br={CHIP_RADIUS}
        pos="relative"
        jc="center"
        shadowColor={s.glow ? "rgb(94, 234, 213)" : "#000"}
        shadowOffset={{ width: 0, height: s.glow ? 0 : 3 }}
        shadowRadius={s.glow ? 6 : 5}
        shadowOpacity={0.35}
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
        </YStack>
        <GradientBorder
          radius={CHIP_HEIGHT / 2}
          angle={160}
          colors={s.borderColors}
          positions={s.borderPositions}
        />
        <XStack ai="center" gap={label ? 7 : 0} zIndex={2}>
          {variant === "add" && (
            <Plus size={14} color="#5EEAD4" strokeWidth={2.3} />
          )}
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
          {onRemove && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${label}`}
              hitSlop={10}
              onPress={() => {
                hapticTap();
                onRemove();
              }}
            >
              <X size={13} color="#5A6B7A" strokeWidth={2.2} />
            </Pressable>
          )}
        </XStack>
      </YStack>
    </Pressable>
  );
}

import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { Plus, X } from "lucide-react-native";
import { Pressable, View } from "react-native";
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
    borderColors: ["rgba(255,255,255,0.44)", "rgba(255,255,255,0.04)", "rgba(150,220,255,0.2)"],
    borderPositions: [0, 0.46, 1],
    glow: false,
  },
  on: {
    textColor: "#EFFDF8",
    fill: "rgba(220,255,245,0.05)",
    borderColors: ["rgba(255,255,255,0.6)", "rgba(94,234,212,0.4)", "rgba(94,234,212,0.5)"],
    borderPositions: [0, 0.6, 1],
    glow: true,
  },
  add: {
    textColor: "#5EEAD4",
    fill: "rgba(45,212,191,0.1)",
    borderColors: ["rgba(255,255,255,0.44)", "rgba(255,255,255,0.04)", "rgba(150,220,255,0.2)"],
    borderPositions: [0, 0.46, 1],
    glow: false,
  },
};

export function TagChip({
  label,
  variant = "default",
  onPress,
  onRemove,
}: {
  label: string;
  variant?: TagChipVariant;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  const s = CHIP_STYLES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
        shadowColor={s.glow ? "rgba(94,234,212,1)" : "#000"}
        shadowOffset={{ width: 0, height: s.glow ? 0 : 3 }}
        shadowRadius={s.glow ? 7 : 6}
        shadowOpacity={s.glow ? 0.7 : 0.8}
      >
        <YStack pos="absolute" t={0} l={0} r={0} b={0} br={CHIP_RADIUS} overflow="hidden">
          <LiquidGlass
            intensity={28}
            tint="default"
            borderRadius={CHIP_RADIUS}
            backgroundColor={s.fill}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: s.glow ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.3)",
            }}
          />
        </YStack>
        <GradientBorder
          radius={CHIP_HEIGHT / 2}
          angle={160}
          colors={s.borderColors}
          positions={s.borderPositions}
        />
        <XStack ai="center" gap={7} zIndex={2}>
          {variant === "add" && <Plus size={14} color="#5EEAD4" strokeWidth={2.3} />}
          <Text fontSize={12.5} fontWeight="600" color={s.textColor}>
            {label}
          </Text>
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

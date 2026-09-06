import { StarGlyph } from "@/src/components/ui/StarGlyph";
import { hapticTap } from "@/src/utils/haptics";
import { Pressable } from "react-native";
import { YStack } from "tamagui";

type StarToggleSize = "sm" | "lg";

const SIZE_STYLES: Record<
  StarToggleSize,
  { box: number; glyph: "md" | "lg" }
> = {
  sm: { box: 32, glyph: "md" },
  lg: { box: 40, glyph: "lg" },
};
const MIN_TAP_TARGET = 44;
const ACTIVE_BG = "rgba(190,242,100,0.1)";
const IDLE_BG = "rgba(220,255,245,0.05)";

interface StarToggleProps {
  active: boolean;
  size?: StarToggleSize;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function StarToggle({
  active,
  size = "lg",
  onPress,
  accessibilityLabel,
}: StarToggleProps) {
  const s = SIZE_STYLES[size];
  const box = (
    <YStack
      w={s.box}
      h={s.box}
      br="$cardSoft"
      ai="center"
      jc="center"
      bg={active ? ACTIVE_BG : IDLE_BG}
    >
      <StarGlyph mode="toggle" size={s.glyph} active={active} />
    </YStack>
  );

  if (!onPress) return box;

  return (
    <Pressable
      hitSlop={Math.ceil((MIN_TAP_TARGET - s.box) / 2)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        hapticTap();
        onPress();
      }}
    >
      {box}
    </Pressable>
  );
}

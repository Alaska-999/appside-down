import { StarGlyph } from "@/src/components/ui/StarGlyph";
import { hapticTap } from "@/src/utils/haptics";
import { Pressable } from "react-native";
import { YStack } from "tamagui";

const BOX = 40;
const ACTIVE_BG = "rgba(190,242,100,0.1)";
const IDLE_BG = "rgba(220,255,245,0.05)";

interface StarToggleProps {
  active: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function StarToggle({
  active,
  onPress,
  accessibilityLabel,
}: StarToggleProps) {
  const box = (
    <YStack
      w={BOX}
      h={BOX}
      br="$cardSoft"
      ai="center"
      jc="center"
      bg={active ? ACTIVE_BG : IDLE_BG}
    >
      <StarGlyph mode="toggle" size="lg" active={active} />
    </YStack>
  );

  if (!onPress) return box;

  return (
    <Pressable
      hitSlop={2}
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

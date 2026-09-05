import { AppCard } from "@/src/components/ui/Card";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { hapticTap } from "@/src/utils/haptics";
import { useState } from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const ROW_HEIGHT = 74;
const ROW_RADIUS = 23;

export function SelectableModuleRow({
  name,
  itemsCount,
  selected,
  onToggle,
}: {
  name: string;
  itemsCount: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={() => {
        hapticTap();
        onToggle();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ transform: [{ scale: pressed ? 0.978 : 1 }] }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={name}
    >
      <AppCard
        variant="row"
        tone="mint"
        size="lg"
        pressed={pressed}
        height={ROW_HEIGHT}
        px={18}
        py={0}
        jc="center"
        br={ROW_RADIUS}
      >
        <XStack ai="center" gap={14}>
          <Checkbox size="xs" checked={selected} onToggle={onToggle} />
          <YStack f={1} minWidth={0}>
            <Text
              fontSize={16}
              fontWeight="700"
              letterSpacing={-0.16}
              color="$color"
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text fontSize={12.5} color="#8FA8B8" mt={3}>
              {itemsCount} card{itemsCount !== 1 ? "s" : ""}
            </Text>
          </YStack>
        </XStack>
      </AppCard>
    </Pressable>
  );
}

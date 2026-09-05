import { AppCard } from "@/src/components/ui/Card";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { hapticTap } from "@/src/utils/haptics";
import { Lock, Star } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const ROW_HEIGHT = 74;
const ROW_RADIUS = 23;
const HIT = 44;

export function SelectableModuleRow({
  name,
  itemsCount,
  starred,
  locked,
  selected,
  onToggle,
}: {
  name: string;
  itemsCount: number;
  starred?: boolean;
  locked?: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      disabled={locked}
      onPress={() => {
        hapticTap();
        onToggle();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        transform: [{ scale: pressed ? 0.978 : 1 }],
        opacity: locked ? 0.42 : 1,
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: locked }}
      accessibilityLabel={locked ? `${name}, already in this folder` : name}
    >
      <AppCard
        variant="glow"
        tone="teal"
        size="lg"
        pressed={pressed}
        height={ROW_HEIGHT}
        px={18}
        py={0}
        jc="center"
        br={ROW_RADIUS}
      >
        <XStack ai="center" gap={12}>
          <XStack w={HIT} h={HIT} ml={-10} ai="center" jc="center">
            {locked ? (
              <Lock size={20} color="#5A6B7A" strokeWidth={1.9} />
            ) : (
              <Checkbox size="md" checked={selected} onToggle={onToggle} />
            )}
          </XStack>
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
            <XStack ai="center" gap={6} mt={3}>
              <Text fontSize={12.5} color="#8FA8B8">
                {itemsCount} card{itemsCount !== 1 ? "s" : ""}
              </Text>
              {starred && !locked && (
                <Star
                  size={12.5}
                  color="#BEF264"
                  fill="#BEF264"
                  strokeWidth={1.9}
                />
              )}
              {locked && (
                <Text fontSize={11} color="#5A6B7A">
                  · Already here
                </Text>
              )}
            </XStack>
          </YStack>
        </XStack>
      </AppCard>
    </Pressable>
  );
}

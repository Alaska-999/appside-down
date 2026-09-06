import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { ICON_LIME_LIGHT } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { Star } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const ROW_RADIUS = 20;

export function CardRow({
  term,
  definition,
  starred,
  onToggleStar,
}: {
  term: string;
  definition: string;
  starred?: boolean;
  onToggleStar?: () => void;
}) {
  return (
    <YStack pos="relative" br={ROW_RADIUS}>
      <YStack
        pos="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        br={ROW_RADIUS}
        overflow="hidden"
      >
        <LiquidGlass
          intensity={38}
          tint="default"
          borderRadius={ROW_RADIUS}
          backgroundColor="rgba(20,28,34,0.44)"
        />
      </YStack>
      <GradientBorder
        radius={ROW_RADIUS}
        angle={140}
        colors={["rgba(220,255,245,0.18)", "rgba(220,255,245,0.04)"]}
        positions={[0, 1]}
      />
      <XStack zIndex={2} px={16} py={14} ai="center" gap={12}>
        <YStack f={1} minWidth={0}>
          <Text fontSize={14.5} fontWeight="600" color="$color">
            {term}
          </Text>
          <Text fontSize={12.5} color="$textMuted" mt={3}>
            {definition}
          </Text>
        </YStack>
        {onToggleStar && (
          <Pressable
            hitSlop={13}
            accessibilityRole="button"
            accessibilityLabel={starred ? "Unstar card" : "Star card"}
            onPress={() => {
              hapticTap();
              onToggleStar();
            }}
          >
            <Star
              size={18}
              strokeWidth={1.7}
              color={starred ? ICON_LIME_LIGHT : "#3E4C57"}
              fill={starred ? "rgba(190,242,100,0.25)" : "transparent"}
            />
          </Pressable>
        )}
      </XStack>
    </YStack>
  );
}

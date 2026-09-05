import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { Plus } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const PILL_HEIGHT = 42;
const PILL_RADIUS = PILL_HEIGHT / 2;

export function AddPill({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.965 : 1 }],
        alignSelf: "center",
      })}
    >
      <YStack
        h={PILL_HEIGHT}
        px={18}
        br={PILL_RADIUS}
        pos="relative"
        jc="center"
      >
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={PILL_RADIUS}
          overflow="hidden"
        >
          <LiquidGlass
            intensity={35}
            borderRadius={PILL_RADIUS}
            backgroundColor="rgba(45,212,191,0.15)"
          />
        </YStack>
        <GradientBorder
          radius={PILL_RADIUS}
          angle={150}
          colors={["rgba(45,212,191,0.7)", "rgba(70, 210, 191, 0.35)"]}
          positions={[0, 1]}
        />
        <XStack ai="center" gap={9} zIndex={2}>
          <Plus size={16} color="#5EEAD4" strokeWidth={2.1} />
          <Text fontSize={13.5} fontWeight="600" color="#5EEAD4">
            {label}
          </Text>
        </XStack>
      </YStack>
    </Pressable>
  );
}

import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";

const PILL_HEIGHT = 40;
const PILL_RADIUS = PILL_HEIGHT / 2;

export function SavePill({
  label = "Save",
  enabled = true,
  loading,
  onPress,
}: {
  label?: string;
  enabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const active = enabled && !loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !active }}
      onPress={() => {
        if (!active) return;
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && active ? 0.965 : 1 }],
      })}
    >
      <YStack
        h={PILL_HEIGHT}
        px={17}
        br={PILL_RADIUS}
        pos="relative"
        jc="center"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 3 }}
        shadowRadius={5}
        shadowOpacity={0.7}
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
            intensity={25}
            borderRadius={PILL_RADIUS}
            backgroundColor="rgba(220,255,245,0.05)"
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.34)",
            }}
          />
        </YStack>
        <GradientBorder radius={PILL_RADIUS} preset="lens" />
        <XStack ai="center" gap={8} zIndex={2}>
          {loading ? (
            <Spinner size="small" color="#5EEAD4" />
          ) : (
            <Check
              size={17}
              strokeWidth={2.3}
              color={active ? "#5EEAD4" : "#5A6B7A"}
            />
          )}
          <Text
            fontSize={14}
            fontWeight="700"
            color={active ? "#EAF7FF" : "#8FA8B8"}
          >
            {label}
          </Text>
        </XStack>
      </YStack>
    </Pressable>
  );
}

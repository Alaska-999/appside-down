import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight } from "lucide-react-native";
import { ComponentType } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const ROW_HEIGHT = 52;
const ROW_RADIUS = 16;

export function PickRow({
  icon: Icon,
  value,
  placeholder,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  value?: string | null;
  placeholder: string;
  onPress: () => void;
}) {
  const filled = !!value;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ?? placeholder}
      onPress={() => {
        hapticTap();
        onPress();
      }}
    >
      <YStack h={ROW_HEIGHT} br={ROW_RADIUS} pos="relative" jc="center">
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={ROW_RADIUS}
          overflow="hidden"
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(4,8,10,0.5)" },
            ]}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 9 }}
            pointerEvents="none"
          />
        </YStack>
        <GradientBorder radius={ROW_RADIUS} preset="well" />
        <XStack ai="center" gap={11} px={16} zIndex={2}>
          <Icon size={19} color="#8FA8B8" strokeWidth={1.9} />
          <Text f={1} fontSize={15} color={filled ? "$color" : "#5A6B7A"} numberOfLines={1}>
            {value ?? placeholder}
          </Text>
          <ChevronRight size={16} color="#5A6B7A" strokeWidth={2} />
        </XStack>
      </YStack>
    </Pressable>
  );
}

import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { WELL_FILL_SOFT, WellInsetShadow } from "@/src/components/ui/Well";
import { ICON_MUTED, ICON_SUBTLE } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight } from "lucide-react-native";
import { ComponentType } from "react";
import { StyleSheet, View } from "react-native";
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
    <YStack
      h={ROW_HEIGHT}
      br={ROW_RADIUS}
      pos="relative"
      jc="center"
      accessibilityRole="button"
      accessibilityLabel={value ?? placeholder}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      pressStyle={{ scale: 0.978 }}
      transition="press"
    >
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
          style={[StyleSheet.absoluteFill, { backgroundColor: WELL_FILL_SOFT }]}
        />
        <WellInsetShadow radius={ROW_RADIUS} />
      </YStack>
      <GradientBorder radius={ROW_RADIUS} preset="well" />
      <XStack ai="center" gap={11} px={16} zIndex={2}>
        <Icon size={19} color={ICON_MUTED} strokeWidth={1.9} />
        <Text
          f={1}
          fontSize={15}
          color={filled ? "$color" : "$mutedDim"}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Text>
        <ChevronRight size={16} color={ICON_SUBTLE} strokeWidth={2} />
      </XStack>
    </YStack>
  );
}

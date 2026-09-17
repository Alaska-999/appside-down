import {
  InputShell,
  InputShellSize,
  InputShellVariant,
} from "@/src/components/ui/InputShell";
import { ICON_MUTED, ICON_SUBTLE } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight } from "lucide-react-native";
import { ComponentType } from "react";
import { Keyboard } from "react-native";
import { Text, YStack } from "tamagui";

export function PickRow({
  icon: Icon,
  value,
  placeholder,
  onPress,
  variant = "well",
  size = "md",
  disabled,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  value?: string | null;
  placeholder: string;
  onPress: () => void;
  variant?: InputShellVariant;
  size?: InputShellSize;
  disabled?: boolean;
}) {
  const filled = !!value;

  return (
    <YStack
      accessibilityRole="button"
      accessibilityLabel={value ?? placeholder}
      disabled={disabled}
      onPress={() => {
        hapticTap();
        Keyboard.dismiss();
        onPress();
      }}
      pressStyle={{ scale: 0.978 }}
      transition="press"
    >
      <InputShell variant={variant} size={size} disabled={disabled}>
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
      </InputShell>
    </YStack>
  );
}

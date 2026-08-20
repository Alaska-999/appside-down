import { InputShell, InputShellSize } from "@/src/components/ui/InputShell";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronDown } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text } from "tamagui";

interface SelectFieldProps {
  value?: string | null;
  placeholder?: string;
  size?: InputShellSize;
  disabled?: boolean;
  onPress: () => void;
}

export function SelectField({
  value,
  placeholder = "Select...",
  size = "md",
  disabled,
  onPress,
}: SelectFieldProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <InputShell size={size} disabled={disabled}>
        <Text f={1} fontSize={16} color={value ? "$color" : "$placeholderColor"}>
          {value ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#6E8496" />
      </InputShell>
    </Pressable>
  );
}

import { Search, X } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Input, XStack, XStackProps } from "tamagui";

interface SearchFieldProps extends XStackProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  showClear?: boolean;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search...",
  showClear = true,
  ...rest
}: SearchFieldProps) {
  return (
    <XStack
      bg="$glassBg"
      br={999}
      px={19}
      h={48}
      ai="center"
      gap={9}
      borderWidth={1}
      borderColor="$glassBorder"
      {...rest}
    >
      <Search size={20} color="$colorSecondary" opacity={0.7} />
      <Input
        f={1}
        h="100%"
        unstyled
        p={0}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        color="$color"
        placeholderTextColor="$colorSecondary"
        fontSize={16}
      />
      {showClear && value.length > 0 && (
        <Pressable hitSlop={13} onPress={() => onChangeText("")}>
          <X size={20} color="$colorMuted" />
        </Pressable>
      )}
    </XStack>
  );
}

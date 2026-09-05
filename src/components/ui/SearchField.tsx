import { InputShell } from "@/src/components/ui/InputShell";
import { ICON_MUTED } from "@/src/constants/iconColors";
import { Search, X } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import { Input, YStackProps } from "tamagui";

type SearchFieldLayoutProps = Pick<
  YStackProps,
  "mt" | "mb" | "ml" | "mr" | "f" | "flex" | "w" | "h" | "ai" | "als" | "pos" | "zIndex" | "testID"
>;

interface SearchFieldProps extends SearchFieldLayoutProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  showClear?: boolean;
  autoFocus?: boolean;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search...",
  showClear = true,
  autoFocus,
  ...rest
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <InputShell state={focused ? "focus" : "default"} {...rest}>
      <Search size={18} color="#6E8496" />
      <Input
        f={1}
        h="100%"
        unstyled
        p={0}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        color="$color"
        placeholderTextColor="$placeholderColor"
        fontSize={15}
      />
      {showClear && value.length > 0 && (
        <Pressable hitSlop={13} onPress={() => onChangeText("")}>
          <X size={20} color={ICON_MUTED} />
        </Pressable>
      )}
    </InputShell>
  );
}

import { InputShell, InputShellSize } from "@/src/components/ui/InputShell";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { Check, ChevronDown } from "lucide-react-native";
import { useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack } from "tamagui";

export interface SelectOption {
  label: string;
  value: string;
}

type SingleSelectProps = {
  multiple?: false;
  value?: string | null;
  onChange: (value: string) => void;
};

type MultiSelectProps = {
  multiple: true;
  value?: string[];
  onChange: (values: string[]) => void;
};

type SelectFieldProps = (SingleSelectProps | MultiSelectProps) & {
  options: SelectOption[];
  placeholder?: string;
  size?: InputShellSize;
  disabled?: boolean;
};

const EASE = Easing.bezier(0.2, 0.8, 0.3, 1);

export function SelectField({
  value,
  multiple,
  options,
  placeholder = "Select...",
  size = "md",
  disabled,
  onChange,
}: SelectFieldProps) {
  const reduced = useReducedMotion();
  const triggerRef = useRef<View>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const progress = useSharedValue(0);

  const selectedValues = multiple ? (value as string[] | undefined) ?? [] : [];
  const isSelected = (optionValue: string) =>
    multiple ? selectedValues.includes(optionValue) : value === optionValue;

  const triggerLabel = multiple
    ? options
        .filter((option) => selectedValues.includes(option.value))
        .map((option) => option.label)
        .join(", ")
    : options.find((option) => option.value === value)?.label;

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMounted(true);
      setOpen(true);
      if (reduced) {
        progress.value = 1;
      } else {
        progress.value = 0;
        progress.value = withTiming(1, { duration: 180, easing: EASE });
      }
    });
  };

  const closeMenu = () => {
    setOpen(false);
    if (reduced) {
      progress.value = 0;
      setMounted(false);
      return;
    }
    progress.value = withTiming(0, { duration: 160, easing: EASE }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  };

  const handleSelect = (optionValue: string) => {
    hapticTap();
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      (onChange as (values: string[]) => void)(next);
      return;
    }
    (onChange as (value: string) => void)(optionValue);
  };

  const menuStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.96 + progress.value * 0.04 },
      { translateY: (1 - progress.value) * -6 },
    ],
  }));

  return (
    <>
      <Pressable
        ref={triggerRef}
        disabled={disabled}
        onPress={() => {
          hapticTap();
          if (open) closeMenu();
          else openMenu();
        }}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <InputShell size={size} disabled={disabled} state={open ? "focus" : "default"}>
          <Text
            f={1}
            numberOfLines={1}
            fontSize={16}
            color={triggerLabel ? "$color" : "$placeholderColor"}
          >
            {triggerLabel || placeholder}
          </Text>
          <ChevronDown
            size={18}
            color="#6E8496"
            style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
          />
        </InputShell>
      </Pressable>

      {mounted && (
        <Modal
          transparent
          visible
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeMenu}
        >
          <Pressable style={{ flex: 1 }} onPress={closeMenu}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: anchor.y + anchor.height + 7,
                  left: anchor.x - 1,
                  width: anchor.width + 2,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(220,255,245,0.13)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 18 },
                  shadowRadius: 22,
                  shadowOpacity: 0.55,
                },
                menuStyle,
              ]}
            >
              <LiquidGlass intensity={60} backgroundColor="rgba(14,22,26,0.85)" />
              {options.map((option, index) => {
                const selected = isSelected(option.value);
                return (
                  <View key={option.value}>
                    {index > 0 && (
                      <View style={{ height: 1, backgroundColor: "rgba(220,255,245,0.06)" }} />
                    )}
                    <Pressable onPress={() => handleSelect(option.value)}>
                      <XStack
                        ai="center"
                        jc="space-between"
                        px={16}
                        py={12}
                        bg={selected ? "rgba(163,230,53,0.08)" : "transparent"}
                      >
                        <Text fontSize={14.5} color={selected ? "$limeLight" : "$color"}>
                          {option.label}
                        </Text>
                        {selected && <Check size={16} color="#BEF264" />}
                      </XStack>
                    </Pressable>
                  </View>
                );
              })}
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

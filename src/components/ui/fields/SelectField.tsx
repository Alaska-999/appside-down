import { InputShell, InputShellSize } from "@/src/components/ui/InputShell";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MUTED_DARK,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import { EASE_STANDARD } from "@/src/constants/motion";
import { SELECT_MENU_BG } from "@/src/constants/rawColors";
import {
  SURFACE_BORDER,
  SURFACE_GLASS_BG,
} from "@/src/constants/surfaceAlpha";
import { withAlpha } from "@/src/utils/withAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { Check, ChevronDown } from "lucide-react-native";
import { useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
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

const EASE = EASE_STANDARD;

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
  const triggerPressScale = useSharedValue(1);
  const triggerPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: triggerPressScale.value }],
  }));

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
        onPressIn={() => {
          triggerPressScale.value = reduced
            ? 0.985
            : withTiming(0.985, { duration: 130, easing: EASE });
        }}
        onPressOut={() => {
          triggerPressScale.value = reduced
            ? 1
            : withTiming(1, { duration: 240, easing: EASE });
        }}
      >
        <Animated.View style={triggerPressStyle}>
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
              color={ICON_MUTED_DARK}
              style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
            />
          </InputShell>
        </Animated.View>
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
                  borderColor: SURFACE_BORDER,
                  shadowColor: ICON_PURE_BLACK,
                  shadowOffset: { width: 0, height: 18 },
                  shadowRadius: 22,
                  shadowOpacity: 0.55,
                },
                menuStyle,
              ]}
            >
              <LiquidGlass intensity={60} backgroundColor={SELECT_MENU_BG} />
              {options.map((option, index) => {
                const selected = isSelected(option.value);
                return (
                  <View key={option.value}>
                    {index > 0 && (
                      <View style={{ height: 1, backgroundColor: SURFACE_GLASS_BG }} />
                    )}
                    <XStack
                      ai="center"
                      jc="space-between"
                      px={16}
                      py={13}
                      bg={selected ? withAlpha(ICON_LIME, 0.08) : "transparent"}
                      onPress={() => handleSelect(option.value)}
                      pressStyle={{ bg: "$glassBgStrong" }}
                      transition="press"
                    >
                      <Text fontSize={14.5} color={selected ? "$limeLight" : "$color"}>
                        {option.label}
                      </Text>
                      {selected && <Check size={16} color={ICON_LIME_LIGHT} />}
                    </XStack>
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

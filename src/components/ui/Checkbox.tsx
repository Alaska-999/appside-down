import {
  ICON_HERO_LIME,
  ICON_LIME,
  ICON_MINT,
  ICON_NEAR_BLACK,
} from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

type ControlSize = "lg" | "md" | "sm";

const CHECKBOX_SIZES: Record<
  ControlSize,
  { box: number; radius: number; check: number }
> = {
  lg: { box: 30, radius: 10, check: 17 },
  md: { box: 26, radius: 9, check: 15 },
  sm: { box: 24, radius: 8, check: 12 },
};

const RADIO_SIZES: Record<ControlSize, { box: number; dot: number }> = {
  lg: { box: 30, dot: 15 },
  md: { box: 26, dot: 13 },
  sm: { box: 24, dot: 11 },
};

export function Checkbox({
  checked,
  onToggle,
  size = "md",
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  size?: ControlSize;
  disabled?: boolean;
}) {
  const s = CHECKBOX_SIZES[size];
  const handlePress = () => {
    if (disabled) return;
    hapticTap();
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={Math.ceil((44 - s.box) / 2)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <YStack
        w={s.box}
        h={s.box}
        br={s.radius}
        ai="center"
        jc="center"
        overflow="hidden"
        bg={checked ? undefined : "rgba(4,7,10,0.5)"}
        borderWidth={checked ? 0 : 1}
        borderColor="rgba(220,255,245,0.12)"
        {...(checked
          ? {
              shadowColor: "rgba(45,212,191,1)",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 8,
              shadowOpacity: 0.7,
            }
          : null)}
      >
        {checked ? (
          <>
            <LinearGradient
              colors={[ICON_MINT, ICON_HERO_LIME]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.9, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
            <Check size={s.check} color={ICON_NEAR_BLACK} strokeWidth={3} />
          </>
        ) : (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 7,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          />
        )}
      </YStack>
    </Pressable>
  );
}

export function Radio({
  selected,
  onSelect,
  size = "md",
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  size?: ControlSize;
  disabled?: boolean;
}) {
  const s = RADIO_SIZES[size];
  const handlePress = () => {
    if (disabled) return;
    hapticTap();
    onSelect();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={Math.ceil((44 - s.box) / 2)}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <YStack
        w={s.box}
        h={s.box}
        br={s.box / 2}
        ai="center"
        jc="center"
        bg="rgba(4,7,10,0.5)"
        borderWidth={selected ? 1.4 : 1}
        borderColor={
          selected ? "rgba(94,234,212,0.7)" : "rgba(220,255,245,0.12)"
        }
      >
        {selected && (
          <View
            style={{
              width: s.dot,
              height: s.dot,
              borderRadius: s.dot / 2,
              overflow: "hidden",
              shadowColor: "rgba(94,234,212,1)",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 6,
              shadowOpacity: 0.9,
            }}
          >
            <LinearGradient
              colors={[ICON_MINT, ICON_LIME]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.9, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      </YStack>
    </Pressable>
  );
}

export function OptionRow({
  control,
  label,
  onPress,
}: {
  control: ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <XStack
      ai="center"
      gap={12}
      py={9}
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.8 } : undefined}
    >
      {control}
      <Text fontSize={14.5} color="$color">
        {label}
      </Text>
    </XStack>
  );
}

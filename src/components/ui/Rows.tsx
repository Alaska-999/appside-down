import { useFocusProgress } from "@/src/components/ui/FocusRing";
import {
  SURFACE_VARIANTS,
  SurfaceLayers,
  SurfaceState,
  SurfaceVariant,
} from "@/src/components/ui/Surfaces";
import { ICON_MUTED_LIGHT, ICON_SUBTLE } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight } from "lucide-react-native";
import {
  Children,
  ComponentType,
  createContext,
  ReactNode,
  useState,
} from "react";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export type RowsVariant = SurfaceVariant;
export type RowsDivider = "full" | "inset";

const ROWS_RADIUS = 20;
const DIVIDER_INSET = 48;

export const RowsFocusContext = createContext<
  ((focused: boolean) => void) | null
>(null);

export function Rows({
  variant = "well",
  divider = "full",
  radius = ROWS_RADIUS,
  focused,
  children,
}: {
  variant?: RowsVariant;
  divider?: RowsDivider;
  radius?: number;
  focused?: boolean;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  const [focusCount, setFocusCount] = useState(0);
  const onFocusChange = (next: boolean) =>
    setFocusCount((n) => Math.max(0, n + (next ? 1 : -1)));
  const isFocused = focused ?? focusCount > 0;
  const focusProgress = useFocusProgress(isFocused);
  const state: SurfaceState = isFocused ? "focus" : "default";
  const dividerColor = SURFACE_VARIANTS[variant].divider;

  return (
    <RowsFocusContext.Provider value={onFocusChange}>
      <YStack br={radius} pos="relative">
        <SurfaceLayers
          variant={variant}
          state={state}
          radius={radius}
          focusProgress={focusProgress}
        />
        <YStack br={radius} overflow="hidden" zIndex={2}>
          {items.map((child, index) => (
            <View key={index}>
              {index > 0 && (
                <View
                  pointerEvents="none"
                  style={{
                    marginLeft: divider === "inset" ? DIVIDER_INSET : 0,
                    height: 1,
                    backgroundColor: dividerColor,
                  }}
                />
              )}
              {child}
            </View>
          ))}
        </YStack>
      </YStack>
    </RowsFocusContext.Provider>
  );
}

export function Row({
  icon: Icon,
  label,
  value,
  right,
  disabled,
  onPress,
}: {
  icon?: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  right?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const pressable = !!onPress && !disabled;
  return (
    <XStack
      ai="center"
      gap={13}
      px={17}
      py={14}
      opacity={disabled ? 0.45 : 1}
      transition="press"
      {...(pressable && {
        onPress: () => {
          hapticTap();
          onPress();
        },
        pressStyle: { bg: "$glassBg" },
        accessibilityRole: "button" as const,
        accessibilityLabel: label,
      })}
    >
      {Icon && <Icon size={18} color={ICON_MUTED_LIGHT} strokeWidth={1.9} />}
      <Text f={1} fontSize={16} fontWeight="600" color="$color">
        {label}
      </Text>
      {value && (
        <Text fontSize={14} color="$colorMuted">
          {value}
        </Text>
      )}
      {right}
      {pressable && !right && (
        <ChevronRight size={16} color={ICON_SUBTLE} strokeWidth={2} />
      )}
    </XStack>
  );
}

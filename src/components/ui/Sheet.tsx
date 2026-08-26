import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { Check, ChevronRight } from "lucide-react-native";
import { Children, ComponentType, ReactNode, useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sheet, Text, XStack, YStack } from "tamagui";

const SHEET_RADIUS = { topLeft: 35, topRight: 35, bottomRight: 0, bottomLeft: 0 };

interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  snapPoints?: number[];
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  children: ReactNode;
}

export function AppSheet({
  open,
  onOpenChange,
  title,
  snapPoints,
  leftAction,
  rightAction,
  children,
}: AppSheetProps) {
  const insets = useSafeAreaInsets();
  const hasHeaderActions = Boolean(leftAction || rightAction);
  const fitContent = !snapPoints;

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={fitContent ? ["fit"] : snapPoints}
      snapPointsMode={fitContent ? "fit" : "percent"}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay bg="rgba(3,5,8,0.5)" />

      <Sheet.Frame
        bg="transparent"
        btlr={35}
        btrr={35}
        pt={14}
        px={24}
        pb={30 + insets.bottom}
        overflow="hidden"
        pos="relative"
      >
        <LiquidGlass intensity={45} backgroundColor="rgba(12,22,24,0.4)" />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.035)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 16,
            right: 16,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />
        <GradientBorder radius={SHEET_RADIUS} preset="sheet" />

        <Sheet.Handle
          bg="rgba(220,255,245,0.35)"
          w={54}
          h={5}
          br={4}
          mb={18}
          alignSelf="center"
          pos="relative"
          zIndex={1}
        />

        {hasHeaderActions ? (
          <XStack ai="center" jc="space-between" mb={18} pos="relative" zIndex={1}>
            {leftAction ?? <YStack width={40} />}
            {title ? (
              <Text f={1} color="$color" fontSize={19} fontWeight="800" textAlign="center">
                {title}
              </Text>
            ) : (
              <YStack f={1} />
            )}
            {rightAction ?? <YStack width={40} />}
          </XStack>
        ) : title ? (
          <Text
            color="$color"
            fontSize={19}
            fontWeight="800"
            textAlign="center"
            mb={18}
            pos="relative"
            zIndex={1}
          >
            {title}
          </Text>
        ) : null}

        <YStack f={1} pos="relative" zIndex={1}>
          {children}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

interface SheetRowProps {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  hint?: string;
  subtitle?: string;
  danger?: boolean;
  chevron?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

export function SheetRow({
  icon: Icon,
  label,
  hint,
  subtitle,
  danger,
  chevron,
  selected,
  onPress,
}: SheetRowProps) {
  const labelColor = danger ? "#FCA5A5" : "$color";
  const iconColor = danger ? "#FCA5A5" : "#B7CEDA";

  const row = (pressed: boolean) => (
    <XStack
      ai="center"
      gap={14}
      px={17}
      py={16}
      minHeight={44}
      bg={pressed ? "rgba(220,255,245,0.06)" : "transparent"}
    >
      <Icon size={21} color={iconColor} strokeWidth={1.9} />
      <YStack f={1} gap={2}>
        <Text fontSize={15.5} fontWeight="600" color={labelColor}>
          {label}
        </Text>
        {subtitle && (
          <Text fontSize={11.5} fontWeight="500" color="$colorMuted">
            {subtitle}
          </Text>
        )}
      </YStack>
      {hint && (
        <Text fontSize={12} color="$placeholderColor" fontWeight="500">
          {hint}
        </Text>
      )}
      {selected && <Check size={18} color="#5EEAD4" strokeWidth={2.4} />}
      {chevron && <ChevronRight size={16} color="#5A6B7A" strokeWidth={2} />}
    </XStack>
  );

  if (!onPress) return row(false);

  return (
    <Pressable
      onPress={() => {
        hapticTap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => row(pressed)}
    </Pressable>
  );
}

export function SheetRows({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);

  return (
    <YStack br={20} overflow="hidden" bg="rgba(220,255,245,0.085)">
      {items.map((child, index) => (
        <View key={index}>
          {index > 0 && (
            <View
              style={{
                marginLeft: 52,
                height: 1,
                backgroundColor: "rgba(220,255,245,0.09)",
              }}
            />
          )}
          {child}
        </View>
      ))}
    </YStack>
  );
}

export function SheetCrossfade({
  activeKey,
  children,
}: {
  activeKey: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 200 });
  }, [activeKey, reduced, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 1 : opacity.value,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

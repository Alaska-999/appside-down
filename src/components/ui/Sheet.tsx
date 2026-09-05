import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_ACCENT,
  ICON_DANGER,
  ICON_SUBTLE,
} from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { Check, ChevronRight } from "lucide-react-native";
import {
  Children,
  ComponentType,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Keyboard, Pressable, View } from "react-native";
import { useKeyboardState } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sheet, Text, useTheme, XStack, YStack } from "tamagui";

const SHEET_SKIRT_HEIGHT = 600;

const SHEET_RADIUS = {
  topLeft: 35,
  topRight: 35,
  bottomRight: 0,
  bottomLeft: 0,
};

type SheetBlur = "default" | "strong";

const SHEET_BLUR: Record<SheetBlur, number> = {
  default: 45,
  strong: 56,
};

interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  blur?: SheetBlur;
  snapPoints?: number[];
  keepKeyboard?: boolean;
  growWithKeyboard?: boolean;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  children: ReactNode;
}

export function AppSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  blur = "default",
  snapPoints,
  keepKeyboard = false,
  growWithKeyboard = false,
  leftAction,
  rightAction,
  children,
}: AppSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const touchStartY = useRef(0);
  const hasHeaderActions = Boolean(leftAction || rightAction);
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const grown = growWithKeyboard && keyboardVisible;
  const fitContent = !snapPoints;
  const activeSnapPoints = grown ? [100] : snapPoints;

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={fitContent ? ["fit"] : activeSnapPoints}
      snapPointsMode={fitContent ? "fit" : "percent"}
      dismissOnSnapToBottom
      moveOnKeyboardChange={!growWithKeyboard}
    >
      <Sheet.Overlay bg="rgba(3,5,8,0.5)" />

      <Sheet.Frame
        bg="transparent"
        btlr={35}
        btrr={35}
        pt={grown ? 14 + insets.top : 14}
        px={24}
        pb={30 + insets.bottom}
        overflow="visible"
        pos="relative"
        onTouchStart={(e) => {
          touchStartY.current = e.nativeEvent.pageY;
        }}
        onTouchMove={(e) => {
          if (keepKeyboard) return;
          if (e.nativeEvent.pageY - touchStartY.current > 12) Keyboard.dismiss();
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            marginTop: -1,
            height: SHEET_SKIRT_HEIGHT,
          }}
        >
          <LiquidGlass
            intensity={SHEET_BLUR[blur]}
            backgroundColor={theme.sheetBg.get()}
          />
        </View>
        <YStack
          pointerEvents="none"
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          btlr={35}
          btrr={35}
          overflow="hidden"
        >
          <LiquidGlass
            intensity={SHEET_BLUR[blur]}
            backgroundColor={theme.sheetBg.get()}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 18,
              right: 18,
              height: 1,
              backgroundColor: "rgba(255, 255, 255, 0.18)",
            }}
          />
          <GradientBorder radius={SHEET_RADIUS} preset="sheet" />
        </YStack>

        <Sheet.Handle
          bg="rgba(229, 251, 245, 0.4)"
          w={54}
          h={5}
          br={4}
          mb={18}
          alignSelf="center"
          pos="relative"
          zIndex={1}
        />

        {hasHeaderActions ? (
          <XStack
            ai="center"
            jc="space-between"
            mb={18}
            pos="relative"
            zIndex={1}
          >
            {leftAction ?? <YStack width={40} />}
            {title ? (
              <Text
                f={1}
                color="$color"
                fontSize={19}
                fontWeight="800"
                textAlign="center"
              >
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
            mb={subtitle ? 6 : 18}
            pos="relative"
            zIndex={1}
          >
            {title}
          </Text>
        ) : null}
        {subtitle && (
          <Text
            color="$textMuted"
            fontSize={12.5}
            lineHeight={19}
            textAlign="center"
            mb={18}
            pos="relative"
            zIndex={1}
          >
            {subtitle}
          </Text>
        )}

        <YStack
          f={1}
          pos="relative"
          zIndex={1}
          onPress={keepKeyboard ? undefined : Keyboard.dismiss}
        >
          {children}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

const ROW_BG = {
  dense: "rgba(5, 13, 21, 0.38)",
  light: "rgba(28, 33, 38, 0.35)",
} as const;

const SheetRowsContext = createContext<{ dense: boolean }>({ dense: false });

interface SheetRowProps {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  hint?: string;
  subtitle?: string;
  danger?: boolean;
  chevron?: boolean;
  selected?: boolean;
  right?: ReactNode;
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
  right,
  onPress,
}: SheetRowProps) {
  const { dense } = useContext(SheetRowsContext);
  const labelColor = danger ? "$roseSoft" : "$color";
  const iconColor = danger ? ICON_DANGER : "rgb(213, 225, 234)";

  const row = (pressed: boolean) => (
    <XStack
      ai="center"
      gap={14}
      px={17}
      py={16}
      minHeight={44}
      bg={pressed ? "$glassBg" : dense ? ROW_BG.dense : ROW_BG.light}
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
      {selected && <Check size={18} color={ICON_ACCENT} strokeWidth={2.4} />}
      {right}
      {chevron && <ChevronRight size={16} color={ICON_SUBTLE} strokeWidth={2} />}
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
  const dense = items.length > 2;

  return (
    <SheetRowsContext.Provider value={{ dense }}>
      <YStack br="$cardSoft" overflow="hidden" bg="rgba(220,255,245,0.085)">
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(220,255,245,0.09)",
                }}
              />
            )}
            {child}
          </View>
        ))}
      </YStack>
    </SheetRowsContext.Provider>
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

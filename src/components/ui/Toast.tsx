import { VARIANT_STYLES } from "@/src/components/ui/Button";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_DANGER,
  ICON_LIME_LIGHT,
  ICON_MUTED,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import {
  TEXT_ROSE_PALE,
  TOAST_ERROR_BG,
  TOAST_SUCCESS_BG,
} from "@/src/constants/rawColors";
import { SURFACE_CARD } from "@/src/constants/surfaceAlpha";
import { FOCUS_HIGHLIGHT } from "@/src/constants/focus";
import { AlertCircle, CheckCircle2, Info } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

export type AppToastTone = "error" | "success" | "neutral";
export type AppToastPlacement = "bottom" | "top";
export type AppToastSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  AppToastSize,
  {
    radius: number;
    px: number;
    py: number;
    gap: number;
    icon: number;
    message: number;
    description: number;
    action: number;
  }
> = {
  sm: {
    radius: 14,
    px: 13,
    py: 11,
    gap: 9,
    icon: 16,
    message: 12.5,
    description: 10.5,
    action: 12.5,
  },
  md: {
    radius: 18,
    px: 16,
    py: 14,
    gap: 11,
    icon: 19,
    message: 13.5,
    description: 11.5,
    action: 13.5,
  },
  lg: {
    radius: 20,
    px: 19,
    py: 16,
    gap: 12,
    icon: 22,
    message: 15,
    description: 12.5,
    action: 14.5,
  },
};

const TONE_STYLES: Record<
  AppToastTone,
  {
    bg: string;
    textColor: string;
    icon: typeof AlertCircle;
    iconColor: string;
    border: { angle: number; colors: string[] };
  }
> = {
  error: {
    bg: TOAST_ERROR_BG,
    textColor: TEXT_ROSE_PALE,
    icon: AlertCircle,
    iconColor: ICON_DANGER,
    border: {
      angle: VARIANT_STYLES.danger.borderAngle!,
      colors: VARIANT_STYLES.danger.borderColors!,
    },
  },
  success: {
    bg: TOAST_SUCCESS_BG,
    textColor: "$text",
    icon: CheckCircle2,
    iconColor: ICON_LIME_LIGHT,
    border: {
      angle: VARIANT_STYLES.outline.borderAngle!,
      colors: VARIANT_STYLES.outline.borderColors!,
    },
  },
  neutral: {
    bg: SURFACE_CARD,
    textColor: "$text",
    icon: Info,
    iconColor: ICON_MUTED,
    border: {
      angle: VARIANT_STYLES.secondary.borderAngle!,
      colors: VARIANT_STYLES.secondary.borderColors!,
    },
  },
};

interface AppToastProps {
  open: boolean;
  message: string;
  description?: string;
  duration?: number;
  tone?: AppToastTone;
  placement?: AppToastPlacement;
  size?: AppToastSize;
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
}

export function AppToast({
  open,
  message,
  description,
  duration = 3200,
  tone = "error",
  placement = "bottom",
  size = "md",
  action,
  onDismiss,
}: AppToastProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const t = TONE_STYLES[tone];
  const s = SIZE_STYLES[size];
  const Icon = t.icon;
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (!open) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 220 });
    dragY.value = 0;

    const timer = setTimeout(() => dismissRef.current?.(), duration);
    return () => clearTimeout(timer);
  }, [open, message, duration, progress, dragY]);

  const dismiss = () => dismissRef.current?.();

  const SWIPE_DISTANCE = 40;
  const SWIPE_VELOCITY = 800;
  const swipeGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((e) => {
      dragY.value = e.translationY;
    })
    .onEnd((e) => {
      const shouldDismiss =
        Math.abs(e.translationY) > SWIPE_DISTANCE ||
        Math.abs(e.velocityY) > SWIPE_VELOCITY;
      if (shouldDismiss) {
        const dir = e.translationY < 0 ? -1 : 1;
        dragY.value = withTiming(dir * 160, { duration: 160 }, (finished) => {
          if (finished) runOnJS(dismiss)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const keyboard = useReanimatedKeyboardAnimation();
  const style = useAnimatedStyle(() => {
    const offset = reduced ? 0 : (1 - progress.value) * 12;
    return {
      opacity: reduced ? (open ? 1 : 0) : progress.value,
      ...(placement === "top"
        ? {
            top: insets.top + 15,
            transform: [{ translateY: -offset + dragY.value }],
          }
        : {
            bottom: Math.max(insets.bottom, -keyboard.height.value) + 12,
            transform: [{ translateY: offset + dragY.value }],
          }),
    };
  });

  if (!open) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: "absolute",
          left: 16,
          right: 16,
          zIndex: 9,
        },
        style,
      ]}
    >
      <GestureDetector gesture={swipeGesture}>
        <XStack
          ai="center"
          gap={s.gap}
          br={s.radius}
          px={s.px}
          py={s.py}
          overflow="hidden"
          shadowColor={ICON_PURE_BLACK}
          shadowOffset={{ width: 0, height: 14 }}
          shadowRadius={17}
          shadowOpacity={0.5}
        >
          <LiquidGlass
            intensity={45}
            tint="dark"
            borderRadius={s.radius}
            backgroundColor={t.bg}
          />
          <GradientBorder
            radius={s.radius}
            angle={t.border.angle}
            colors={t.border.colors}
            positions={[0, 1]}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: s.px + 2,
              right: s.px + 2,
              height: 1,
              backgroundColor: FOCUS_HIGHLIGHT,
            }}
          />
          <Icon size={s.icon} color={t.iconColor} strokeWidth={2.2} />
          <YStack f={1}>
            <Text fontSize={s.message} fontWeight="600" color={t.textColor}>
              {message}
            </Text>
            {description && (
              <Text
                fontSize={s.description}
                fontWeight="500"
                color={t.textColor}
                opacity={0.75}
                mt={2}
              >
                {description}
              </Text>
            )}
          </YStack>
          {action && (
            <Pressable
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              onPress={() => {
                action.onPress();
                onDismiss?.();
              }}
            >
              <Text fontSize={s.action} fontWeight="700" color={t.iconColor}>
                {action.label}
              </Text>
            </Pressable>
          )}
        </XStack>
      </GestureDetector>
    </Animated.View>
  );
}

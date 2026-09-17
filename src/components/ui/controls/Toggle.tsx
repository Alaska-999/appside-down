import {
  ICON_LIME,
  ICON_MINT,
  ICON_MINT_TINT_DARK,
  ICON_MUTED,
  ICON_TEAL,
  ICON_TEXT,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import {
  TOGGLE_OFF_TRACK_COOL,
  TOGGLE_OFF_TRACK_DEEP,
  TOGGLE_OFF_TRACK_WARM,
  TRANSPARENT_BLACK,
} from "@/src/constants/rawColors";
import {
  SURFACE_GLASS_BG_STRONG,
  SURFACE_GLASS_BORDER_FAINT,
  SURFACE_GLOW_COLOR,
} from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type ToggleSize = "lg" | "md" | "sm";

const SIZE_STYLES = {
  lg: {
    width: 52,
    height: 31,
    padding: 3,
    thumb: 25,
    travel: 21,
    offTrack: TOGGLE_OFF_TRACK_WARM,
    trackBorder: TRANSPARENT_BLACK,
    offThumb: ICON_WHITE,
    onThumb: ICON_WHITE,
    gradient: [ICON_TEAL, ICON_LIME] as [string, string],
    hitSlop: 7,
  },
  md: {
    width: 46,
    height: 27,
    padding: 3,
    thumb: 21,
    travel: 19,
    offTrack: TOGGLE_OFF_TRACK_COOL,
    trackBorder: SURFACE_GLASS_BORDER_FAINT,
    offThumb: ICON_MUTED,
    onThumb: ICON_TEXT,
    gradient: [ICON_TEAL, ICON_MINT] as [string, string],
    hitSlop: 9,
  },
  sm: {
    width: 40,
    height: 24,
    padding: 4,
    thumb: 18,
    travel: 16,
    offTrack: TOGGLE_OFF_TRACK_DEEP,
    trackBorder: SURFACE_GLASS_BG_STRONG,
    offThumb: ICON_MUTED,
    onThumb: ICON_TEXT,
    gradient: [ICON_TEAL, ICON_MINT] as [string, string],
    hitSlop: 10,
  },
} as const;

export function Toggle({
  value,
  onToggle,
  size = "lg",
  disabled,
  accessibilityLabel,
}: {
  value: boolean;
  onToggle: () => void;
  size?: ToggleSize;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const s = SIZE_STYLES[size];
  const reduced = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = reduced
      ? value
        ? 1
        : 0
      : withTiming(value ? 1 : 0, { duration: 220 });
  }, [value, progress, reduced]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [s.offTrack, TRANSPARENT_BLACK],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [s.trackBorder, TRANSPARENT_BLACK],
    ),
    shadowOpacity: progress.value * 0.75,
  }));

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * s.travel }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [s.offThumb, s.onThumb],
    ),
  }));

  const handlePress = () => {
    if (disabled) return;
    hapticTap();
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={s.hitSlop}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      accessibilityLabel={accessibilityLabel}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View
        style={[
          {
            width: s.width,
            height: s.height,
            borderRadius: s.height / 2,
            padding: s.padding,
            borderWidth: 1,
            justifyContent: "center",
            overflow: "visible",
            shadowColor: SURFACE_GLOW_COLOR,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 4,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: s.height / 2, overflow: "hidden" },
            gradientStyle,
          ]}
        >
          <LinearGradient
            colors={s.gradient}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 1, y: 0.6 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          style={[
            {
              width: s.thumb,
              height: s.thumb,
              borderRadius: s.thumb / 2,
              shadowColor: ICON_MINT_TINT_DARK,
              shadowOffset: { width: -3, height: 0 },
              shadowRadius: 7,
              shadowOpacity: 0.5,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

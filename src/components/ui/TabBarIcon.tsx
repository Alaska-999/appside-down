import {
  reportActiveSlot,
  reportIconFrame,
  TAB_LIGHT_RADIUS,
  TAB_LIGHT_SIZE,
} from "@/src/components/ui/tabLight";
import { ICON_MUTED, ICON_NEAR_BLACK } from "@/src/constants/iconColors";
import {
  EASE_STANDARD,
  TAB_LIGHT_ARRIVE_MS,
  TAB_LIGHT_TINT_MS,
} from "@/src/constants/motion";
import { TAB_ICON_INACTIVE_BG } from "@/src/constants/rawColors";
import { useIsFocused } from "expo-router";
import { ComponentType, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const GLYPH_SIZE = 20;

type TabGlyph = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface TabBarIconProps {
  Icon: TabGlyph;
  index: number;
  count: number;
}

export function TabBarIcon({ Icon, index, count }: TabBarIconProps) {
  const active = useIsFocused();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(active ? 1 : 0);
  const slotRef = useRef<View>(null);

  useEffect(() => {
    if (active) reportActiveSlot(index, count);
  }, [active, index, count]);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = active ? 1 : 0;
      return;
    }
    const tint = { duration: TAB_LIGHT_TINT_MS, easing: EASE_STANDARD };
    progress.value = active
      ? withDelay(TAB_LIGHT_ARRIVE_MS, withTiming(1, tint))
      : withTiming(0, tint);
  }, [active, reducedMotion, progress]);

  const restingStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const mutedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const litStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View
      ref={slotRef}
      style={styles.slot}
      onLayout={() => {
        slotRef.current?.measureInWindow((_x, y) => reportIconFrame(y));
      }}
    >
      <Animated.View style={[styles.fill, styles.resting, restingStyle]} />
      <Animated.View style={[styles.fill, styles.glyph, mutedStyle]}>
        <Icon size={GLYPH_SIZE} color={ICON_MUTED} strokeWidth={1.9} />
      </Animated.View>
      <Animated.View style={[styles.fill, styles.glyph, litStyle]}>
        <Icon size={GLYPH_SIZE} color={ICON_NEAR_BLACK} strokeWidth={2.1} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: TAB_LIGHT_SIZE,
    height: TAB_LIGHT_SIZE,
    marginBottom: 6,
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: TAB_LIGHT_RADIUS,
  },
  resting: {
    backgroundColor: TAB_ICON_INACTIVE_BG,
  },
  glyph: {
    alignItems: "center",
    justifyContent: "center",
  },
});

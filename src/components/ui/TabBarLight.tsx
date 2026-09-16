import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { ICON_MINT } from "@/src/constants/iconColors";
import {
  EASE_STANDARD,
  TAB_LIGHT_MS,
  TAB_LIGHT_STRETCH,
} from "@/src/constants/motion";
import {
  reportBarFrame,
  slotCenterX,
  TAB_LIGHT_RADIUS,
  TAB_LIGHT_SIZE,
  tabLightBarWidth,
  tabLightSlot,
  tabLightSlotCount,
  tabLightTop,
} from "@/src/components/ui/tabLight";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function TabBarLight() {
  const containerRef = useRef<View>(null);
  const reducedMotion = useReducedMotion();

  const from = useSharedValue(0);
  const to = useSharedValue(0);
  const travel = useSharedValue(1);

  useAnimatedReaction(
    () => ({
      slot: tabLightSlot.value,
      count: tabLightSlotCount.value,
      width: tabLightBarWidth.value,
    }),
    (next, previous) => {
      const target = slotCenterX(next.slot, next.width, next.count);
      const settled = previous === null || previous.width !== next.width;

      if (settled || reducedMotion) {
        from.value = target;
        to.value = target;
        travel.value = 1;
        return;
      }

      if (previous.slot === next.slot) return;

      from.value = slotCenterX(previous.slot, next.width, next.count);
      to.value = target;
      travel.value = 0;
      travel.value = withTiming(1, {
        duration: TAB_LIGHT_MS,
        easing: EASE_STANDARD,
      });
    },
    [reducedMotion],
  );

  const lightStyle = useAnimatedStyle(() => ({
    opacity:
      tabLightBarWidth.value === 0 || tabLightSlotCount.value === 0 ? 0 : 1,
    transform: [
      { translateX: from.value + (to.value - from.value) * travel.value },
      { translateY: tabLightTop.value },
      { scaleX: 1 + TAB_LIGHT_STRETCH * Math.sin(travel.value * Math.PI) },
    ],
  }));

  return (
    <View
      ref={containerRef}
      style={StyleSheet.absoluteFill}
      onLayout={() => {
        containerRef.current?.measureInWindow((_x, y, width) => {
          reportBarFrame(y, width);
        });
      }}
    >
      <Animated.View style={[styles.halo, lightStyle]}>
        <View style={styles.light}>
          <LinearGradient
            colors={GRADIENT_PRIMARY}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TAB_LIGHT_SIZE,
    height: TAB_LIGHT_SIZE,
    borderRadius: TAB_LIGHT_RADIUS,
    backgroundColor: ICON_MINT,
    shadowColor: ICON_MINT,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  light: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: TAB_LIGHT_RADIUS,
    overflow: "hidden",
    shadowColor: ICON_MINT,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});

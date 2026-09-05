import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TRACK_W = 46;
const TRACK_H = 27;
const KNOB = 21;
const KNOB_INSET = 3;
const TIMING = { duration: 200, easing: Easing.bezier(0.2, 0.8, 0.3, 1) };

export function Toggle({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel?: string;
}) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, TIMING);
  }, [value, progress]);

  const onStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.7 * progress.value,
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [KNOB_INSET, TRACK_W - KNOB - KNOB_INSET],
        ),
      },
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#8FA8B8", "#EFFDF8"],
    ),
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => {
        hapticTap();
        onChange(!value);
      }}
    >
      <Animated.View
        style={[
          {
            width: TRACK_W,
            height: TRACK_H,
            borderRadius: 999,
            shadowColor: "rgba(45,212,191,1)",
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 6,
          },
          glowStyle,
        ]}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: "rgba(4,8,10,0.55)",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          />
          <Animated.View style={[StyleSheet.absoluteFill, onStyle]}>
            <LinearGradient
              colors={["#0D9488", "#2DD4BF"]}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 1, y: 0.6 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                position: "absolute",
                top: KNOB_INSET,
                width: KNOB,
                height: KNOB,
                borderRadius: KNOB / 2,
              },
              knobStyle,
            ]}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

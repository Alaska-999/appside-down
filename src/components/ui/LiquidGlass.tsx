import { BlurView } from "expo-blur";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

interface LiquidGlassProps {
  intensity?: number;
  tint?: "light" | "dark" | "default";
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function LiquidGlass({
  intensity = 25,
  tint = "dark",
  borderRadius = 0,
  borderWidth = 0,
  borderColor,
  backgroundColor,
  style,
}: LiquidGlassProps) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        StyleSheet.absoluteFillObject,
        {
          borderRadius,
          overflow: "hidden",
          borderWidth,
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

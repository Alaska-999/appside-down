import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Fragment } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface LiquidGlassProps {
  intensity?: number;
  tint?: "light" | "dark" | "default";
  liquid?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function LiquidGlass({
  intensity = 25,
  tint = "dark",
  liquid = false,
  borderRadius = 0,
  borderWidth = 0,
  borderColor,
  backgroundColor,
  style,
}: LiquidGlassProps) {
  if (liquid && isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="clear"
        colorScheme="dark"
        tintColor={backgroundColor}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            overflow: "hidden",
            borderWidth,
            borderColor,
          },
          style,
        ]}
      />
    );
  }

  return (
    <Fragment>
      <BlurView
        intensity={intensity}
        tint={tint}
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            overflow: "hidden",
            borderWidth,
            borderColor,
          },
          style,
        ]}
      />
      {backgroundColor && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius, overflow: "hidden", backgroundColor },
            style,
          ]}
        />
      )}
    </Fragment>
  );
}

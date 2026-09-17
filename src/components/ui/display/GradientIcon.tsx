import { ICON_LIME, ICON_WHITE } from "@/src/constants/iconColors";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentType } from "react";
import { StyleSheet } from "react-native";

export function GradientIcon({
  icon: Icon,
  size,
  strokeWidth = 1.9,
  colors = [ICON_WHITE, ICON_LIME],
  opacity,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  size: number;
  strokeWidth?: number;
  colors?: string[];
  opacity?: number;
}) {
  return (
    <MaskedView
      style={{ width: size, height: size, opacity }}
      maskElement={
        <Icon size={size} color={ICON_WHITE} strokeWidth={strokeWidth} />
      }
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </MaskedView>
  );
}

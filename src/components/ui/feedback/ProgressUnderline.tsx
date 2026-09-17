import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { ICON_MINT_LIGHT } from "@/src/constants/iconColors";
import {
  SURFACE_BORDER,
  SURFACE_GLASS_BORDER_FAINT,
} from "@/src/constants/surfaceAlpha";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export function ProgressUnderline({
  progress,
  dim = false,
}: {
  progress: number;
  dim?: boolean;
}) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 2,
        backgroundColor: SURFACE_GLASS_BORDER_FAINT,
      }}
    >
      {dim ? (
        <View
          style={{
            width: `${clamped * 100}%`,
            height: 2,
            backgroundColor: SURFACE_BORDER,
          }}
        />
      ) : (
        <View
          style={{
            width: `${clamped * 100}%`,
            height: 2,
            shadowColor: ICON_MINT_LIGHT,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 3.5,
            shadowOpacity: 0.6,
          }}
        >
          <LinearGradient
            colors={GRADIENT_PRIMARY}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
    </View>
  );
}

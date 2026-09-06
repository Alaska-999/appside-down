import {
  SCRIM_BASE_HEAVY,
  SCRIM_BASE_SOFT,
  SCRIM_BASE_TRANSPARENT,
} from "@/src/constants/rawColors";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function StatusBarScrim() {
  const insets = useSafeAreaInsets();
  if (insets.top <= 0) return null;

  const height = insets.top + 22;

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[SCRIM_BASE_HEAVY, SCRIM_BASE_SOFT, SCRIM_BASE_TRANSPARENT]}
      locations={[0, 0.55, 1]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height,
        zIndex: 5,
      }}
    />
  );
}

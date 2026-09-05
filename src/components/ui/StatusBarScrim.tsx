import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

export function StatusBarScrim() {
  const insets = useSafeAreaInsets();
  if (insets.top <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor: "rgba(8, 9, 12, 0.7)",
        zIndex: 5,
      }}
    />
  );
}

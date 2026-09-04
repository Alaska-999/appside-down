import { topPaddingBoost } from "@/tamagui.config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SCREEN_BOTTOM_GAP = 24;

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: insets.top + topPaddingBoost,
    bottom: insets.bottom + SCREEN_BOTTOM_GAP,
    insets,
  };
}

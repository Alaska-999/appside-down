import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { FocusRing, useFocusProgress } from "@/src/components/ui/FocusRing";
import { WellInsetShadow } from "@/src/components/ui/InputShell";
import { Children, createContext, ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import { YStack } from "tamagui";

const GROUP_RADIUS = 20;
const GROUP_BG = "rgba(4,8,10,0.5)";
const GROUP_INSET_SHADOW = { dy: 2, blur: 4, color: "rgba(0,0,0,0.6)" };
const GROUP_BOTTOM_LINE = "rgba(220,255,245,0.05)";
const GROUP_BORDER = {
  colors: [
    "rgba(0,0,0,0.1)",
    "rgba(140,161,159,0.14)",
    "rgba(163,187,180,0.18)",
  ],
  positions: [0, 0.8, 1],
};
const DIVIDER = "rgba(220,255,245,0.12)";

export const FieldGroupContext = createContext<
  ((focused: boolean) => void) | null
>(null);

export function FieldGroup({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const [focusCount, setFocusCount] = useState(0);
  const focused = focusCount > 0;
  const onFocusChange = (next: boolean) =>
    setFocusCount((n) => Math.max(0, n + (next ? 1 : -1)));

  const focusProgress = useFocusProgress(focused);

  return (
    <FieldGroupContext.Provider value={onFocusChange}>
      <YStack br={GROUP_RADIUS} pos="relative">
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={GROUP_RADIUS}
          overflow="hidden"
        >
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: GROUP_BG }]}
          />
          <WellInsetShadow radius={GROUP_RADIUS} shadow={GROUP_INSET_SHADOW} />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: GROUP_BOTTOM_LINE,
            }}
          />
        </YStack>
        <GradientBorder
          radius={GROUP_RADIUS}
          angle={180}
          colors={GROUP_BORDER.colors}
          positions={GROUP_BORDER.positions}
        />
        <FocusRing radius={GROUP_RADIUS} progress={focusProgress} />
        <YStack zIndex={2}>
          {items.map((child, index) => (
            <View key={index}>
              {index > 0 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: DIVIDER,
                  }}
                />
              )}
              {child}
            </View>
          ))}
        </YStack>
      </YStack>
    </FieldGroupContext.Provider>
  );
}

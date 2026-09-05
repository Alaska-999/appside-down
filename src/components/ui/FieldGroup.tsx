import { GradientBorder } from "@/src/components/ui/GradientBorder";
import {
  FocusRing,
  useFocusProgress,
  WELL_BORDERS,
  WELL_BOTTOM_LINE,
  WellInsetShadow,
} from "@/src/components/ui/InputShell";
import { Children, createContext, ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import { YStack } from "tamagui";

const GROUP_RADIUS = 20;
const DIVIDER = "rgba(220,255,245,0.1)";

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
  const border = WELL_BORDERS[focused ? "focus" : "default"];

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
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: focused
                  ? "rgba(4,8,10,0.7)"
                  : "rgba(4,8,10,0.5)",
              },
            ]}
          />
          <WellInsetShadow radius={GROUP_RADIUS} />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: WELL_BOTTOM_LINE,
            }}
          />
        </YStack>
        <GradientBorder
          radius={GROUP_RADIUS}
          angle={180}
          colors={border.colors}
          positions={border.positions}
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

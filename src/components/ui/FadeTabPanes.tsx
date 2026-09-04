import {
  Children,
  ReactNode,
  useCallback,
  useState,
  useTransition,
} from "react";
import { StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { YStack } from "tamagui";

export type FadeTabsController = {
  activeSv: SharedValue<number>;
  index: number;
  onChange: (index: number) => void;
};

export function useFadeTabs(initialIndex = 0): FadeTabsController {
  const activeSv = useSharedValue(initialIndex);
  const [index, setIndex] = useState(initialIndex);
  const [, startTransition] = useTransition();

  const onChange = useCallback(
    (i: number) => {
      activeSv.value = i;
      startTransition(() => setIndex(i));
    },
    [activeSv],
  );

  return { activeSv, index, onChange };
}

function Pane({
  index,
  activeSv,
  children,
}: {
  index: number;
  activeSv: SharedValue<number>;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(activeSv.value === index ? 1 : 0, { duration: 150 }),
    pointerEvents: activeSv.value === index ? ("auto" as const) : ("none" as const),
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}

export function FadeTabPanes({
  controller,
  children,
}: {
  controller: FadeTabsController;
  children: ReactNode;
}) {
  return (
    <YStack f={1} position="relative">
      {Children.toArray(children).map((child, i) => (
        <Pane key={i} index={i} activeSv={controller.activeSv}>
          {child}
        </Pane>
      ))}
    </YStack>
  );
}

import {
  Children,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
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

const FADE_DURATION = 150;
const UNMOUNT_DELAY = FADE_DURATION + 60;

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
  active,
  appear,
  children,
}: {
  active: boolean;
  appear: boolean;
  children: ReactNode;
}) {
  const opacity = useSharedValue(appear ? 0 : active ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: FADE_DURATION });
  }, [active, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents={active ? "auto" : "none"}
    >
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
  const activeIndex = controller.index;
  const [mounted, setMounted] = useState<number[]>([activeIndex]);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    firstRenderRef.current = false;
    setMounted((prev) =>
      prev.includes(activeIndex) ? prev : [...prev, activeIndex],
    );
    const timer = setTimeout(() => {
      setMounted((prev) =>
        prev.length === 1 && prev[0] === activeIndex ? prev : [activeIndex],
      );
    }, UNMOUNT_DELAY);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <YStack f={1} position="relative">
      {Children.toArray(children).map((child, i) =>
        mounted.includes(i) ? (
          <Pane
            key={i}
            active={i === activeIndex}
            appear={!firstRenderRef.current}
          >
            {child}
          </Pane>
        ) : null,
      )}
    </YStack>
  );
}

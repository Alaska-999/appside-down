import { KEYBOARD_BAR_HEIGHT } from "@/src/components/ui/KeyboardBar";
import { useRef } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import {
  KeyboardAwareScrollViewRef,
  useKeyboardHandler,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const CARD_KEYBOARD_GAP = 30;

export function useKeyboardCardLift({
  bottomInset = 0,
}: { bottomInset?: number } = {}) {
  const keyboardTail = KEYBOARD_BAR_HEIGHT + bottomInset + CARD_KEYBOARD_GAP;
  const scrollRef = useRef<KeyboardAwareScrollViewRef & ScrollView>(null);
  const scrollInnerRef = useRef<View>(null as unknown as View);
  const viewportHeight = useRef(0);
  const pendingCard = useRef<View | null>(null);
  const keyboardHeight = useRef(0);
  const armed = useSharedValue(0);

  const { height: keyboardOffset, progress: keyboardProgress } =
    useReanimatedKeyboardAnimation();
  const spacerStyle = useAnimatedStyle(() => ({
    height:
      armed.value *
      (-keyboardOffset.value + keyboardProgress.value * keyboardTail),
  }));

  const settleCard = (card: View) => {
    const scroll = scrollRef.current;
    const inner = scrollInnerRef.current;
    if (!scroll || !inner) return;
    card.measureLayout(inner, (_x, y, _w, h) => {
      const visibleBottom =
        viewportHeight.current -
        keyboardHeight.current -
        KEYBOARD_BAR_HEIGHT -
        bottomInset -
        CARD_KEYBOARD_GAP;
      scroll.scrollTo({ y: Math.max(0, y + h - visibleBottom), animated: true });
    });
  };

  const liftCard = (card: View | null) => {
    if (!card) return;
    pendingCard.current = card;
    armed.value = 1;
    if (keyboardHeight.current > 0) settleCard(card);
  };

  const releaseCard = () => {
    pendingCard.current = null;
    armed.value = 0;
  };

  const onKeyboardSettled = (height: number) => {
    keyboardHeight.current = height;
    if (height === 0) releaseCard();
    else if (pendingCard.current) settleCard(pendingCard.current);
  };

  useKeyboardHandler(
    {
      onEnd: (e) => {
        "worklet";
        runOnJS(onKeyboardSettled)(e.height);
      },
    },
    [],
  );

  const onViewportLayout = (e: LayoutChangeEvent) => {
    viewportHeight.current = e.nativeEvent.layout.height;
  };

  return {
    scrollRef,
    scrollInnerRef,
    onViewportLayout,
    spacerStyle,
    liftCard,
    releaseCard,
  };
}

import { ReactNode, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { Gesture, GestureType } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { YStack } from "tamagui";

const GAP = 10;
const EASE = Easing.bezier(0.2, 0.8, 0.3, 1);

type RenderItem = (args: {
  index: number;
  dragGesture: GestureType;
  dragging: boolean;
}) => ReactNode;

export function SortableCardList({
  ids,
  onMove,
  renderItem,
}: {
  ids: string[];
  onMove: (from: number, to: number) => void;
  renderItem: RenderItem;
}) {
  const [slot, setSlot] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragY = useSharedValue(0);
  const activeIndex = useSharedValue(-1);
  const slotSize = useSharedValue(0);

  const onItemLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && Math.abs(h - slot) > 0.5) {
      setSlot(h);
      slotSize.value = h + GAP;
    }
  };

  const finishDrag = (from: number, delta: number) => {
    const to = Math.max(0, Math.min(ids.length - 1, from + delta));
    if (to !== from) onMove(from, to);
    setDragIndex(null);
    activeIndex.value = -1;
    dragY.value = 0;
  };

  return (
    <YStack gap={GAP}>
      {ids.map((id, index) => (
        <SortableRow
          key={id}
          index={index}
          count={ids.length}
          dragY={dragY}
          activeIndex={activeIndex}
          slotSize={slotSize}
          dragging={dragIndex === index}
          onLayout={index === 0 ? onItemLayout : undefined}
          onStart={() => {
            activeIndex.value = index;
            setDragIndex(index);
          }}
          onFinish={finishDrag}
          renderItem={renderItem}
        />
      ))}
    </YStack>
  );
}

function SortableRow({
  index,
  count,
  dragY,
  activeIndex,
  slotSize,
  dragging,
  onLayout,
  onStart,
  onFinish,
  renderItem,
}: {
  index: number;
  count: number;
  dragY: { value: number };
  activeIndex: { value: number };
  slotSize: { value: number };
  dragging: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
  onStart: () => void;
  onFinish: (from: number, delta: number) => void;
  renderItem: RenderItem;
}) {
  const dragGesture = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .onStart(() => {
      runOnJS(onStart)();
    })
    .onUpdate((e) => {
      dragY.value = e.translationY;
    })
    .onEnd(() => {
      const size = slotSize.value || 1;
      const delta = Math.round(dragY.value / size);
      runOnJS(onFinish)(index, delta);
    });

  const style = useAnimatedStyle(() => {
    const size = slotSize.value || 1;
    const active = activeIndex.value;

    if (active === index) {
      return {
        transform: [{ translateY: dragY.value }, { scale: 1.02 }],
        zIndex: 20,
      };
    }
    if (active < 0) {
      return { transform: [{ translateY: 0 }, { scale: 1 }], zIndex: 1 };
    }

    const target = Math.max(
      0,
      Math.min(count - 1, active + Math.round(dragY.value / size)),
    );
    let shift = 0;
    if (active < index && target >= index) shift = -size;
    else if (active > index && target <= index) shift = size;

    return {
      transform: [
        { translateY: withTiming(shift, { duration: 170, easing: EASE }) },
        { scale: 1 },
      ],
      zIndex: 1,
    };
  }, [index, count]);

  return (
    <Animated.View onLayout={onLayout} style={style}>
      {renderItem({ index, dragGesture, dragging })}
    </Animated.View>
  );
}

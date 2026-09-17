import { useState } from "react";
import { LayoutChangeEvent } from "react-native";

export type MeasuredSize = { w: number; h: number };

export function useMeasure() {
  const [size, setSize] = useState<MeasuredSize>({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.w === width && prev.h === height ? prev : { w: width, h: height },
    );
  };
  return { size, onLayout };
}

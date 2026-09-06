import { Canvas, RoundedRect, Shadow } from "@shopify/react-native-skia";
import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

export type WellState = "default" | "focus" | "error" | "good";

export const WELL_FILL = "rgba(4,8,10,0.5)";
export const WELL_FILL_FOCUS = "rgba(4,8,10,0.65)";
export const WELL_FILL_SOFT = "rgba(14,22,26,0.55)";
export const WELL_FILL_SOFT_FOCUS = "rgba(10,17,20,0.7)";

const WELL_INSET_SHADOW = { dy: 2, blur: 4, color: "rgba(0,0,0,0.55)" };

export function WellInsetShadow({
  radius,
  shadow = WELL_INSET_SHADOW,
}: {
  radius: number;
  shadow?: { dy: number; blur: number; color: string };
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height)
      setSize({ width, height });
  };
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
    >
      {size.width > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            r={radius}
            color="black"
          >
            <Shadow
              dx={0}
              dy={shadow.dy}
              blur={shadow.blur}
              color={shadow.color}
              inner
              shadowOnly
            />
          </RoundedRect>
        </Canvas>
      )}
    </View>
  );
}

export const WELL_BORDERS: Record<
  WellState,
  { colors: string[]; positions: number[] }
> = {
  default: {
    colors: [
      "rgba(0, 0, 0, 0.65)",
      "rgba(140, 161, 159, 0.14)",
      "rgba(163, 187, 180, 0.18)",
    ],
    positions: [0, 0.8, 1],
  },
  focus: {
    colors: [
      "rgba(0, 0, 0, 0.65)",
      "rgba(140, 161, 159, 0.14)",
      "rgba(163, 187, 180, 0.18)",
    ],
    positions: [0, 0.8, 1],
  },
  error: {
    colors: ["rgba(239,68,68,0.5)", "rgba(239,68,68,0.2)"],
    positions: [0, 1],
  },
  good: {
    colors: ["rgba(163,230,53,0.4)", "rgba(163,230,53,0.15)"],
    positions: [0, 1],
  },
};

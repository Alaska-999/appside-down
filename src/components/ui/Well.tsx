import { WELL_EDGE_TAIL } from "@/src/constants/focus";
import { ICON_LIME, ICON_STATUS_DANGER } from "@/src/constants/iconColors";
import { WELL_BORDER_TOP, WELL_INSET_SHADOW_COLOR } from "@/src/constants/rawColors";
import {
  SURFACE_ACCENT_BORDER_SOFT,
  SURFACE_WELL,
  SURFACE_WELL_FOCUS,
  SURFACE_WELL_SOFT,
  SURFACE_WELL_SOFT_FOCUS,
} from "@/src/constants/surfaceAlpha";
import { withAlpha } from "@/src/utils/withAlpha";
import { Canvas, RoundedRect, Shadow } from "@shopify/react-native-skia";
import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

export type WellState = "default" | "focus" | "error" | "good";

export const WELL_FILL = SURFACE_WELL;
export const WELL_FILL_FOCUS = SURFACE_WELL_FOCUS;
export const WELL_FILL_SOFT = SURFACE_WELL_SOFT;
export const WELL_FILL_SOFT_FOCUS = SURFACE_WELL_SOFT_FOCUS;

const WELL_INSET_SHADOW = { dy: 2, blur: 4, color: WELL_INSET_SHADOW_COLOR };

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

const WELL_DEFAULT_BORDER = {
  colors: [WELL_BORDER_TOP, ...WELL_EDGE_TAIL.colors],
  positions: [0, ...WELL_EDGE_TAIL.positions],
};

export const WELL_BORDERS: Record<
  WellState,
  { colors: string[]; positions: number[] }
> = {
  default: WELL_DEFAULT_BORDER,
  focus: WELL_DEFAULT_BORDER,
  error: {
    colors: [withAlpha(ICON_STATUS_DANGER, 0.5), withAlpha(ICON_STATUS_DANGER, 0.2)],
    positions: [0, 1],
  },
  good: {
    colors: [SURFACE_ACCENT_BORDER_SOFT, withAlpha(ICON_LIME, 0.15)],
    positions: [0, 1],
  },
};

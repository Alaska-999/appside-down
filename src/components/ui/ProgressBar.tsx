import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Rect,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import { ICON_LIME_LIGHT, ICON_MINT, ICON_MINT_LIGHT } from "@/src/constants/iconColors";
import { SCRIM_BASE_SOFT } from "@/src/constants/rawColors";
import { SURFACE_GLASS_BORDER_FAINT } from "@/src/constants/surfaceAlpha";
import { withAlpha } from "@/src/utils/withAlpha";
import { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

const BAR_HEIGHT = 8;

export function ProgressBar({
  known,
  learning,
  total,
}: {
  known: number;
  learning: number;
  total: number;
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth((prev) => (prev === w ? prev : w));
  };

  const knownW = total > 0 ? (Math.max(known, 0) / total) * width : 0;
  const learningW = total > 0 ? (Math.max(learning, 0) / total) * width : 0;
  const headX = knownW + learningW;

  const clip = useMemo(() => {
    if (width <= 0) return null;
    const path = Skia.Path.Make();
    path.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(0, 4, width, BAR_HEIGHT),
        BAR_HEIGHT / 2,
        BAR_HEIGHT / 2,
      ),
    );
    return path;
  }, [width]);

  return (
    <View style={{ height: BAR_HEIGHT + 8 }} onLayout={onLayout}>
      {width > 0 && clip && (
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect
            x={0}
            y={4}
            width={width}
            height={BAR_HEIGHT}
            r={BAR_HEIGHT / 2}
            color={SURFACE_GLASS_BORDER_FAINT}
          />
          <Group clip={clip}>
            {knownW > 0 && (
              <Rect x={0} y={4} width={knownW} height={BAR_HEIGHT} color={ICON_LIME_LIGHT} />
            )}
            {learningW > 0 && (
              <Rect x={knownW} y={4} width={learningW} height={BAR_HEIGHT} color={ICON_MINT} />
            )}
            {knownW > 0 && learningW > 0 && (
              <Rect x={knownW} y={4} width={1} height={BAR_HEIGHT} color={SCRIM_BASE_SOFT} />
            )}
          </Group>
          {learningW > 0 && (
            <Circle cx={headX} cy={4 + BAR_HEIGHT / 2} r={4} color={withAlpha(ICON_MINT_LIGHT, 0.9)}>
              <BlurMask blur={3} style="normal" />
            </Circle>
          )}
        </Canvas>
      )}
    </View>
  );
}

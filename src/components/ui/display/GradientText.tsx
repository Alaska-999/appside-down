import {
  ICON_LIME_LIGHT,
  ICON_MINT_LIGHT,
} from "@/src/constants/iconColors";
import { Sora_800ExtraBold } from "@expo-google-fonts/sora";
import type { SkFont } from "@shopify/react-native-skia";
import {
  Canvas,
  Group,
  LinearGradient,
  Text as SkiaText,
  rect,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

interface GradientTextProps {
  children: string;
  fontSize: number;
  colors?: string[];
  reveal?: SharedValue<number>;
}

interface CanvasProps extends Omit<GradientTextProps, "colors"> {
  colors: string[];
  font: SkFont;
}

function GradientTextCanvas({
  children,
  colors,
  font,
  reveal,
}: CanvasProps) {
  const advanceWidth = font.getTextWidth(children);
  const width = advanceWidth + 6;
  const metrics = font.getMetrics();
  const height = metrics.descent - metrics.ascent;
  const baseline = -metrics.ascent;

  const clip = useDerivedValue(() =>
    rect(0, 0, reveal ? width * reveal.value : width, height),
  );

  return (
    <Canvas style={{ width, height }}>
      <Group clip={clip}>
        <SkiaText text={children} x={0} y={baseline} font={font}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(advanceWidth, 0)}
            colors={colors}
          />
        </SkiaText>
      </Group>
    </Canvas>
  );
}

export function GradientText({
  children,
  fontSize,
  colors = [ICON_MINT_LIGHT, ICON_LIME_LIGHT],
  reveal,
}: GradientTextProps) {
  const font = useFont(Sora_800ExtraBold, fontSize);

  if (!font) {
    return null;
  }

  return (
    <GradientTextCanvas
      fontSize={fontSize}
      colors={colors}
      font={font}
      reveal={reveal}
    >
      {children}
    </GradientTextCanvas>
  );
}

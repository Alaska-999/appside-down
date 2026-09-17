import {
  ICON_LIME_LIGHT,
  ICON_MINT_LIGHT,
} from "@/src/constants/iconColors";
import { Sora_800ExtraBold } from "@expo-google-fonts/sora";
import {
  Canvas,
  LinearGradient,
  Text as SkiaText,
  useFont,
  vec,
} from "@shopify/react-native-skia";

interface GradientTextProps {
  children: string;
  fontSize: number;
  colors?: string[];
}

export function GradientText({
  children,
  fontSize,
  colors = [ICON_MINT_LIGHT, ICON_LIME_LIGHT],
}: GradientTextProps) {
  const font = useFont(Sora_800ExtraBold, fontSize);

  if (!font) {
    return null;
  }

  const advanceWidth = font.getTextWidth(children);
  const width = advanceWidth + 6;
  const metrics = font.getMetrics();
  const height = metrics.descent - metrics.ascent;
  const baseline = -metrics.ascent;

  return (
    <Canvas style={{ width, height }}>
      <SkiaText text={children} x={0} y={baseline} font={font}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(advanceWidth, 0)}
          colors={colors}
        />
      </SkiaText>
    </Canvas>
  );
}

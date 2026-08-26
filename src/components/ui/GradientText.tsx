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
  colors = ["#5EEAD4", "#BEF264"],
}: GradientTextProps) {
  const font = useFont(Sora_800ExtraBold, fontSize);

  if (!font) {
    return null;
  }

  const width = font.getTextWidth(children);
  const metrics = font.getMetrics();
  const height = metrics.descent - metrics.ascent;
  const baseline = -metrics.ascent;

  return (
    <Canvas style={{ width, height }}>
      <SkiaText text={children} x={0} y={baseline} font={font}>
        <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={colors} />
      </SkiaText>
    </Canvas>
  );
}

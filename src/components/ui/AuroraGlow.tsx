import { View } from "react-native";
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

const MOCKUP_SCALE = 390 / 290;

interface AuroraGlowProps {
  mintOpacity?: number;
  limeOpacity?: number;
}

export function AuroraGlow({
  mintOpacity = 0.2,
  limeOpacity = 0.16,
}: AuroraGlowProps) {
  const bandTop = -90 * MOCKUP_SCALE;
  const bandInset = -40 * MOCKUP_SCALE;
  const bandHeight = 180 * MOCKUP_SCALE;
  const blurStdDeviation = 22 * MOCKUP_SCALE;
  const canvasPadding = blurStdDeviation * 4;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: bandTop - canvasPadding,
        left: bandInset - canvasPadding,
        right: bandInset - canvasPadding,
        height: bandHeight + canvasPadding * 2,
        transform: [{ rotate: "-6deg" }],
      }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id="auroraBand" x1="0%" y1="0%" x2="100%" y2="17.6%">
            <Stop offset="0" stopColor="#2dd4bf" stopOpacity={0} />
            <Stop offset="0.35" stopColor="#2dd4bf" stopOpacity={mintOpacity} />
            <Stop offset="0.55" stopColor="#a3e635" stopOpacity={limeOpacity} />
            <Stop offset="0.8" stopColor="#a3e635" stopOpacity={0} />
          </SvgLinearGradient>
          <Filter id="auroraBlur" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur stdDeviation={blurStdDeviation} />
          </Filter>
        </Defs>
        <Rect
          x="0"
          y={canvasPadding}
          width="100%"
          height={bandHeight}
          fill="url(#auroraBand)"
          filter="url(#auroraBlur)"
        />
      </Svg>
    </View>
  );
}

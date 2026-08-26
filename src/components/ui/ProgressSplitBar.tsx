import { Canvas, Circle, RadialGradient, vec } from "@shopify/react-native-skia";
import { StyleSheet, View } from "react-native";
import { XStack } from "tamagui";

const BAR_HEIGHT = 8;
const GLOW_WIDTH = 8;
const GLOW_HEIGHT = BAR_HEIGHT + 8;

function EdgeGlow() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        right: -1,
        top: -4,
        width: GLOW_WIDTH,
        height: GLOW_HEIGHT,
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle cx={GLOW_WIDTH / 2} cy={GLOW_HEIGHT / 2} r={GLOW_WIDTH / 2}>
          <RadialGradient
            c={vec(GLOW_WIDTH / 2, GLOW_HEIGHT / 2)}
            r={GLOW_WIDTH / 2}
            colors={["rgba(94,234,212,0.9)", "rgba(94,234,212,0)"]}
            positions={[0, 0.75]}
          />
        </Circle>
      </Canvas>
    </View>
  );
}

export function ProgressSplitBar({
  known,
  learning,
  total,
}: {
  known: number;
  learning: number;
  total: number;
}) {
  const safeTotal = total > 0 ? total : 1;
  const knownRatio = Math.max(0, Math.min(1, known / safeTotal));
  const learningRatio = Math.max(0, Math.min(1 - knownRatio, learning / safeTotal));

  return (
    <XStack h={BAR_HEIGHT} br={999} overflow="hidden" bg="rgba(220,255,245,0.07)">
      {knownRatio > 0 && (
        <View style={{ width: `${knownRatio * 100}%`, backgroundColor: "#BEF264" }} />
      )}
      {learningRatio > 0 && (
        <View
          style={{
            width: `${learningRatio * 100}%`,
            backgroundColor: "#2DD4BF",
            position: "relative",
          }}
        >
          {knownRatio > 0 && (
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: "rgba(8,9,12,0.55)",
              }}
            />
          )}
          <EdgeGlow />
        </View>
      )}
    </XStack>
  );
}

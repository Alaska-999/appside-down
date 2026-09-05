import { useEffect } from "react";
import { DimensionValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const MINT = "#5EEAD4";
const LIME = "#BEF264";

interface SparkSpec {
  leftPct: number;
  topPct: number;
  size: number;
  color: string;
  moveDuration: number;
  moveDelay: number;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  fadeDuration: number;
  fadeDelay: number;
}

const SPARKS: SparkSpec[] = [
  { leftPct: 43, topPct: 18, size: 3, color: MINT, moveDuration: 11700, moveDelay: 2500, p1: { x: 11, y: -15 }, p2: { x: -10, y: 12 }, fadeDuration: 3800, fadeDelay: 1300 },
  { leftPct: 40, topPct: 64, size: 3, color: MINT, moveDuration: 8800, moveDelay: 2700, p1: { x: -21, y: -23 }, p2: { x: -13, y: 21 }, fadeDuration: 4200, fadeDelay: 1400 },
  { leftPct: 59, topPct: 10, size: 5, color: LIME, moveDuration: 12000, moveDelay: 2600, p1: { x: -19, y: -20 }, p2: { x: -16, y: 24 }, fadeDuration: 4600, fadeDelay: 1300 },
  { leftPct: 53, topPct: 30, size: 5, color: MINT, moveDuration: 8700, moveDelay: 4400, p1: { x: 14, y: -15 }, p2: { x: 18, y: 15 }, fadeDuration: 5000, fadeDelay: 2200 },
  { leftPct: 90, topPct: 48, size: 5, color: MINT, moveDuration: 7700, moveDelay: 2800, p1: { x: 8, y: -8 }, p2: { x: 10, y: 11 }, fadeDuration: 3400, fadeDelay: 1400 },
  { leftPct: 29, topPct: 30, size: 5, color: LIME, moveDuration: 9600, moveDelay: 4900, p1: { x: -10, y: -8 }, p2: { x: -11, y: 8 }, fadeDuration: 3800, fadeDelay: 2400 },
  { leftPct: 18, topPct: 62, size: 3, color: MINT, moveDuration: 11500, moveDelay: 5600, p1: { x: -5, y: -8 }, p2: { x: 3, y: 9 }, fadeDuration: 4200, fadeDelay: 2800 },
  { leftPct: 53, topPct: 44, size: 5, color: MINT, moveDuration: 9400, moveDelay: 4700, p1: { x: 13, y: -20 }, p2: { x: -2, y: 10 }, fadeDuration: 4600, fadeDelay: 2300 },
  { leftPct: 19, topPct: 23, size: 4, color: LIME, moveDuration: 8900, moveDelay: 3300, p1: { x: 15, y: -23 }, p2: { x: 6, y: 11 }, fadeDuration: 5000, fadeDelay: 1600 },
  { leftPct: 63, topPct: 12, size: 3, color: MINT, moveDuration: 12000, moveDelay: 2400, p1: { x: -12, y: -19 }, p2: { x: -18, y: 13 }, fadeDuration: 3400, fadeDelay: 1200 },
  { leftPct: 13, topPct: 76, size: 4, color: MINT, moveDuration: 13000, moveDelay: 2100, p1: { x: 2, y: -11 }, p2: { x: -6, y: 7 }, fadeDuration: 3800, fadeDelay: 1000 },
  { leftPct: 15, topPct: 41, size: 4, color: LIME, moveDuration: 11400, moveDelay: 4500, p1: { x: 7, y: -17 }, p2: { x: -5, y: 8 }, fadeDuration: 4200, fadeDelay: 2300 },
  { leftPct: 19, topPct: 79, size: 5, color: MINT, moveDuration: 12200, moveDelay: 4100, p1: { x: 13, y: -19 }, p2: { x: -2, y: 9 }, fadeDuration: 4600, fadeDelay: 2100 },
  { leftPct: 59, topPct: 29, size: 3, color: MINT, moveDuration: 10600, moveDelay: 2100, p1: { x: 4, y: -21 }, p2: { x: 8, y: 8 }, fadeDuration: 5000, fadeDelay: 1000 },
  { leftPct: 87, topPct: 38, size: 5, color: LIME, moveDuration: 9400, moveDelay: 2500, p1: { x: 13, y: -9 }, p2: { x: -15, y: 15 }, fadeDuration: 3400, fadeDelay: 1200 },
  { leftPct: 19, topPct: 11, size: 3, color: MINT, moveDuration: 9700, moveDelay: 3400, p1: { x: 5, y: -19 }, p2: { x: -8, y: 8 }, fadeDuration: 3800, fadeDelay: 1700 },
];

function Spark({ spec, reducedMotion }: { spec: SparkSpec; reducedMotion: boolean }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(reducedMotion ? 0.6 : 0.25);

  useEffect(() => {
    if (reducedMotion) return;

    const half = spec.moveDuration / 2;
    const easing = Easing.inOut(Easing.ease);

    tx.value = withDelay(
      spec.moveDelay,
      withRepeat(
        withSequence(
          withTiming(spec.p1.x, { duration: half, easing }),
          withTiming(spec.p2.x, { duration: half, easing }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      spec.moveDelay,
      withRepeat(
        withSequence(
          withTiming(spec.p1.y, { duration: half, easing }),
          withTiming(spec.p2.y, { duration: half, easing }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      spec.fadeDelay,
      withRepeat(withTiming(1, { duration: spec.fadeDuration, easing }), -1, true),
    );
  }, [reducedMotion, spec, tx, ty, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const glowRadius = spec.size * 7;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: `${spec.leftPct}%` as DimensionValue,
          top: `${spec.topPct}%` as DimensionValue,
          width: spec.size,
          height: spec.size,
          borderRadius: 999,
          backgroundColor: spec.color,
          shadowColor: spec.color,
          shadowOpacity: 0.9,
          shadowRadius: glowRadius,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

export function OrbitSparks({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      {SPARKS.map((spec, index) => (
        <Spark key={index} spec={spec} reducedMotion={reducedMotion} />
      ))}
    </>
  );
}

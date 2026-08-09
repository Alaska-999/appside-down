import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

const MOCKUP_SCALE = 390 / 290;

const BEAM_WIDTH = 420 * MOCKUP_SCALE;
const BEAM_HEIGHT = 90 * MOCKUP_SCALE;
const BLUR_STD_DEVIATION = 34 * MOCKUP_SCALE;
const CANVAS_PADDING = BLUR_STD_DEVIATION * 4;
const ROTATION = "-28deg";

interface GradientStop {
  offset: number;
  color: string;
  opacity: number;
}

interface DriftSpec {
  duration: number;
  amplitudeX: number;
  amplitudeY: number;
  minOpacity: number;
}

interface BeamSpec {
  id: string;
  top: number;
  left: number;
  stops: GradientStop[];
  drift: DriftSpec;
  tier: "base" | "extra";
}

const BEAMS: BeamSpec[] = [
  {
    id: "b1",
    top: 30 * MOCKUP_SCALE,
    left: -80 * MOCKUP_SCALE,
    stops: [
      { offset: 0, color: "#2dd4bf", opacity: 0 },
      { offset: 1 / 3, color: "#2dd4bf", opacity: 0.2 },
      { offset: 2 / 3, color: "#a3e635", opacity: 0.1 },
      { offset: 1, color: "#a3e635", opacity: 0 },
    ],
    drift: { duration: 9000, amplitudeX: 20, amplitudeY: 15, minOpacity: 0.88 },
    tier: "base",
  },
  {
    id: "b2",
    top: 110 * MOCKUP_SCALE,
    left: -40 * MOCKUP_SCALE,
    stops: [
      { offset: 0, color: "#6366f1", opacity: 0 },
      { offset: 0.5, color: "#6366f1", opacity: 0.22 },
      { offset: 1, color: "#6366f1", opacity: 0 },
    ],
    drift: { duration: 12500, amplitudeX: 25, amplitudeY: 20, minOpacity: 0.85 },
    tier: "base",
  },
  {
    id: "b3",
    top: 190 * MOCKUP_SCALE,
    left: -100 * MOCKUP_SCALE,
    stops: [
      { offset: 0, color: "#0d9488", opacity: 0 },
      { offset: 0.5, color: "#0d9488", opacity: 0.14 },
      { offset: 1, color: "#0d9488", opacity: 0 },
    ],
    drift: { duration: 14000, amplitudeX: 18, amplitudeY: 18, minOpacity: 0.9 },
    tier: "base",
  },
  {
    id: "b4",
    top: 340 * MOCKUP_SCALE,
    left: 40 * MOCKUP_SCALE,
    stops: [
      { offset: 0, color: "#2dd4bf", opacity: 0 },
      { offset: 1 / 3, color: "#2dd4bf", opacity: 0.18 },
      { offset: 2 / 3, color: "#a3e635", opacity: 0.09 },
      { offset: 1, color: "#a3e635", opacity: 0 },
    ],
    drift: { duration: 11000, amplitudeX: 22, amplitudeY: 17, minOpacity: 0.87 },
    tier: "extra",
  },
  {
    id: "b5",
    top: 460 * MOCKUP_SCALE,
    left: -160 * MOCKUP_SCALE,
    stops: [
      { offset: 0, color: "#6366f1", opacity: 0 },
      { offset: 0.5, color: "#6366f1", opacity: 0.2 },
      { offset: 1, color: "#6366f1", opacity: 0 },
    ],
    drift: { duration: 13500, amplitudeX: 26, amplitudeY: 21, minOpacity: 0.84 },
    tier: "extra",
  },
];

const MOTION_PRESETS: Record<"calm" | "lively", { durationMul: number; amplitudeMul: number }> = {
  calm: { durationMul: 0.75, amplitudeMul: 1.4 },
  lively: { durationMul: 0.55, amplitudeMul: 1.8 },
};

function Beam({
  id,
  top,
  left,
  stops,
  drift,
  reducedMotion,
  intensity,
}: BeamSpec & { reducedMotion: boolean; intensity: number }) {
  const gradientId = `aurora-beam-${id}`;
  const filterId = `aurora-beam-blur-${id}`;

  const progress = useSharedValue(-1);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = -1;
      return;
    }

    progress.value = withRepeat(
      withTiming(1, { duration: drift.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reducedMotion, drift.duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return {};
    }

    const breathe = (progress.value + 1) / 2;

    return {
      transform: [
        { translateX: progress.value * drift.amplitudeX },
        { translateY: progress.value * drift.amplitudeY },
      ],
      opacity: drift.minOpacity + breathe * (1 - drift.minOpacity),
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        top: top - CANVAS_PADDING,
        left: left - CANVAS_PADDING,
        width: BEAM_WIDTH + CANVAS_PADDING * 2,
        height: BEAM_HEIGHT + CANVAS_PADDING * 2,
        transform: [{ rotate: ROTATION }],
      }}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {stops.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                  stopOpacity={Math.min(1, stop.opacity * intensity)}
                />
              ))}
            </SvgLinearGradient>
            <Filter
              id={filterId}
              x={0}
              y={0}
              width={BEAM_WIDTH + CANVAS_PADDING * 2}
              height={BEAM_HEIGHT + CANVAS_PADDING * 2}
              filterUnits="userSpaceOnUse"
            >
              <FeGaussianBlur stdDeviation={BLUR_STD_DEVIATION} />
            </Filter>
          </Defs>
          <Rect
            x={CANVAS_PADDING}
            y={CANVAS_PADDING}
            width={BEAM_WIDTH}
            height={BEAM_HEIGHT}
            fill={`url(#${gradientId})`}
            filter={`url(#${filterId})`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

interface AuroraBeamsProps {
  intensity?: number;
  coverage?: "top" | "full";
  motion?: "calm" | "lively";
}

export function AuroraBeams({
  intensity = 1,
  coverage = "top",
  motion = "calm",
}: AuroraBeamsProps = {}) {
  const reducedMotion = useReducedMotion();
  const motionPreset = MOTION_PRESETS[motion];

  const beams = BEAMS.filter((beam) => coverage === "full" || beam.tier === "base").map(
    (beam) => ({
      ...beam,
      drift: {
        ...beam.drift,
        duration: beam.drift.duration * motionPreset.durationMul,
        amplitudeX: beam.drift.amplitudeX * motionPreset.amplitudeMul,
        amplitudeY: beam.drift.amplitudeY * motionPreset.amplitudeMul,
      },
    }),
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      {beams.map((beam) => (
        <Beam key={beam.id} {...beam} reducedMotion={reducedMotion} intensity={intensity} />
      ))}
    </View>
  );
}

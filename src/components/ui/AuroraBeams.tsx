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

interface BeamSpec {
  id: string;
  top: number;
  left: number;
  stops: GradientStop[];
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
  },
];

function Beam({ id, top, left, stops }: BeamSpec) {
  const gradientId = `aurora-beam-${id}`;
  const filterId = `aurora-beam-blur-${id}`;

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
      <Svg width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {stops.map((stop) => (
              <Stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity={stop.opacity}
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
    </View>
  );
}

export function AuroraBeams() {
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
      {BEAMS.map((beam) => (
        <Beam key={beam.id} {...beam} />
      ))}
    </View>
  );
}

import { View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  RadialGradient,
  Stop,
} from "react-native-svg";

const MOCKUP_SCALE = 390 / 265;

interface AtmosphereBlobSpec {
  id: string;
  width: number;
  height: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  centerX?: boolean;
  color: string;
  opacity: number;
  blur: number;
}

const BLOBS: AtmosphereBlobSpec[] = [
  {
    id: "a1",
    width: 400 * MOCKUP_SCALE,
    height: 400 * MOCKUP_SCALE,
    top: -160 * MOCKUP_SCALE,
    left: -150 * MOCKUP_SCALE,
    color: "rgba(13,148,136,0.42)",
    opacity: 1,
    blur: 48 * MOCKUP_SCALE,
  },
  {
    id: "a2",
    width: 300 * MOCKUP_SCALE,
    height: 300 * MOCKUP_SCALE,
    top: -100 * MOCKUP_SCALE,
    right: -130 * MOCKUP_SCALE,
    color: "rgba(67,56,202,0.35)",
    opacity: 1,
    blur: 46 * MOCKUP_SCALE,
  },
  {
    id: "a3",
    width: 320 * MOCKUP_SCALE,
    height: 240 * MOCKUP_SCALE,
    bottom: -140 * MOCKUP_SCALE,
    left: 60 * MOCKUP_SCALE,
    color: "rgba(45,212,191,0.13)",
    opacity: 1,
    blur: 50 * MOCKUP_SCALE,
  },
];

const HALO_BLOB: AtmosphereBlobSpec = {
  id: "halo",
  width: 320 * MOCKUP_SCALE,
  height: 320 * MOCKUP_SCALE,
  top: 60 * MOCKUP_SCALE,
  centerX: true,
  color: "rgba(45,212,191,0.2)",
  opacity: 1,
  blur: 52 * MOCKUP_SCALE,
};

const DIM_OPACITY: Record<string, number> = {
  a1: 0.55,
  a2: 0.55,
  a3: 0.5,
  halo: 1,
};

function AtmosphereBlob({ spec, dim }: { spec: AtmosphereBlobSpec; dim?: boolean }) {
  const canvasPadding = spec.blur * 3;
  const opacity = spec.opacity * (dim ? (DIM_OPACITY[spec.id] ?? 1) : 1);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: spec.top,
        left: spec.centerX ? "50%" : spec.left,
        right: spec.right,
        bottom: spec.bottom,
        width: spec.width,
        height: spec.height,
        marginLeft: spec.centerX ? -spec.width / 2 : undefined,
        opacity,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -canvasPadding,
          left: -canvasPadding,
          width: spec.width + canvasPadding * 2,
          height: spec.height + canvasPadding * 2,
        }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={spec.id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={spec.color} stopOpacity={1} />
              <Stop offset="0.68" stopColor={spec.color} stopOpacity={0} />
            </RadialGradient>
            <Filter id={`${spec.id}-blur`} x="-40%" y="-40%" width="180%" height="180%">
              <FeGaussianBlur stdDeviation={spec.blur} />
            </Filter>
          </Defs>
          <Ellipse
            cx="50%"
            cy="50%"
            rx={spec.width / 2}
            ry={spec.height / 2}
            fill={`url(#${spec.id})`}
            filter={`url(#${spec.id}-blur)`}
          />
        </Svg>
      </View>
    </View>
  );
}

interface ScreenAtmosphereProps {
  dim?: boolean;
  halo?: boolean;
}

export function ScreenAtmosphere({ dim, halo }: ScreenAtmosphereProps) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {BLOBS.map((spec) => (
        <AtmosphereBlob key={spec.id} spec={spec} dim={dim} />
      ))}
      {halo && <AtmosphereBlob spec={HALO_BLOB} dim={dim} />}
    </View>
  );
}

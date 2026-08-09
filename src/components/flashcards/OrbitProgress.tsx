import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const MOCKUP_SCALE = 390 / 265;
const VIEWBOX = 230;
const CENTER = 115;
const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = VIEWBOX * MOCKUP_SCALE;

function pointOnOrbit(fraction: number) {
  const angle = (-90 + fraction * 360) * (Math.PI / 180);
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

function Planet() {
  const box = 120;
  const r = box / 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: (CENTER - r) * MOCKUP_SCALE,
        left: (CENTER - r) * MOCKUP_SCALE,
        width: box * MOCKUP_SCALE,
        height: box * MOCKUP_SCALE,
        borderRadius: 999,
        shadowColor: "#2dd4bf",
        shadowOpacity: 0.55,
        shadowRadius: 50 * MOCKUP_SCALE,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${box} ${box}`}>
        <Defs>
          <RadialGradient id="planetGrad" cx="34%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#5EEAD4" />
            <Stop offset="0.26" stopColor="#2DD4BF" />
            <Stop offset="0.55" stopColor="#0D9488" />
            <Stop offset="0.82" stopColor="#0c3835" />
            <Stop offset="1" stopColor="#0c3835" />
          </RadialGradient>
          <Filter id="planetHighlightBlur" x="-60%" y="-60%" width="220%" height="220%">
            <FeGaussianBlur stdDeviation={3.5} />
          </Filter>
          <Filter id="planetBandBlur" x="-60%" y="-60%" width="220%" height="220%">
            <FeGaussianBlur stdDeviation={1.5} />
          </Filter>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill="url(#planetGrad)" />
        <Ellipse
          cx={37}
          cy={22}
          rx={19}
          ry={10}
          fill="rgba(255,255,255,0.55)"
          filter="url(#planetHighlightBlur)"
          transform={`rotate(-18 37 22)`}
        />
        <Ellipse
          cx={r}
          cy={46}
          rx={54}
          ry={5}
          fill="rgba(94,234,212,0.14)"
          filter="url(#planetBandBlur)"
        />
        <Ellipse
          cx={r}
          cy={72}
          rx={54}
          ry={5}
          fill="rgba(94,234,212,0.14)"
          opacity={0.6}
          filter="url(#planetBandBlur)"
        />
      </Svg>
    </View>
  );
}

function SaturnRing() {
  const cx = 85;
  const cy = 22;
  const outerRx = 85;
  const outerRy = 22;
  const innerRx = 71;
  const innerRy = 16;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 96 * MOCKUP_SCALE,
        left: 30 * MOCKUP_SCALE,
        width: 170 * MOCKUP_SCALE,
        height: 44 * MOCKUP_SCALE,
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 170 44">
        <Path
          d={`M ${cx - outerRx} ${cy} A ${outerRx} ${outerRy} 0 0 1 ${cx + outerRx} ${cy}`}
          stroke="rgba(163,230,53,0.32)"
          strokeWidth={2}
          fill="none"
          transform={`rotate(-16 ${cx} ${cy})`}
        />
        <Path
          d={`M ${cx - innerRx} ${cy} A ${innerRx} ${innerRy} 0 0 1 ${cx + innerRx} ${cy}`}
          stroke="rgba(94,234,212,0.22)"
          strokeWidth={1}
          fill="none"
          transform={`rotate(-16 ${cx} ${cy})`}
        />
      </Svg>
    </View>
  );
}

interface OrbitProgressProps {
  percent: number;
}

export function OrbitProgress({ percent }: OrbitProgressProps) {
  const clamped = Math.min(1, Math.max(0, percent));
  const dash = CIRCUMFERENCE * clamped;
  const comet = pointOnOrbit(clamped);
  const star = pointOnOrbit(clamped / 2);
  const showStar = clamped > 0.04;

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.3, { duration: 800 }), -1, true);
  }, [pulse]);

  const cometStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const cometSize = 16 * MOCKUP_SCALE;
  const starSize = 6 * MOCKUP_SCALE;

  return (
    <View style={{ width: SIZE, height: SIZE, position: "relative" }}>
      <Svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <SvgLinearGradient id="orbitGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2DD4BF" />
            <Stop offset="1" stopColor="#A3E635" />
          </SvgLinearGradient>
          <SvgLinearGradient id="orbitTrail" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2DD4BF" stopOpacity={0} />
            <Stop offset="1" stopColor="#A3E635" />
          </SvgLinearGradient>
          <Filter id="orbitTrailBlur" x="-40%" y="-40%" width="180%" height="180%">
            <FeGaussianBlur stdDeviation={4} />
          </Filter>
        </Defs>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(220,255,245,0.08)"
          strokeWidth={3}
          strokeDasharray="4 8"
        />
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="url(#orbitTrail)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          opacity={0.35}
          filter="url(#orbitTrailBlur)"
        />
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
        />
      </Svg>

      <Planet />
      <SaturnRing />

      {showStar && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: star.y * MOCKUP_SCALE - starSize / 2,
            left: star.x * MOCKUP_SCALE - starSize / 2,
            width: starSize,
            height: starSize,
            borderRadius: 999,
            backgroundColor: "#5EEAD4",
            shadowColor: "rgba(94,234,212,0.9)",
            shadowOpacity: 1,
            shadowRadius: 8 * MOCKUP_SCALE,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: comet.y * MOCKUP_SCALE - cometSize / 2,
            left: comet.x * MOCKUP_SCALE - cometSize / 2,
            width: cometSize,
            height: cometSize,
            borderRadius: 999,
            backgroundColor: "#A3E635",
            shadowColor: "rgba(163,230,53,1)",
            shadowOpacity: 1,
            shadowRadius: 20 * MOCKUP_SCALE,
            shadowOffset: { width: 0, height: 0 },
          },
          cometStyle,
        ]}
      />
    </View>
  );
}

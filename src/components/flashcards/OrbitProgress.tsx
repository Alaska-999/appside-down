import {
  ICON_ACCENT,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
} from "@/src/constants/iconColors";
import {
  Blur,
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  LinearGradient as SkiaLinearGradient,
  Path as SkiaPath,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

const ORB_SIZE = 262;
const CENTER = 131;
const RADIUS = 116;
const PLANET_SIZE = 130;
const PLANET_OFFSET = (ORB_SIZE - PLANET_SIZE) / 2;

export type OrbitTone = "default" | "cold" | "warm";

const PLANET_TONES: Record<
  OrbitTone,
  { stops: [number, string][]; glowColor: string }
> = {
  default: {
    stops: [
      [0, "#4FDCC9"],
      [0.24, "#1FA495"],
      [0.54, "#0A625B"],
      [0.84, "#051E1D"],
    ],
    glowColor: "rgba(45,212,191,0.34)",
  },
  cold: {
    stops: [
      [0, "#4FDCC9"],
      [0.24, "#1FA495"],
      [0.54, "#0A625B"],
      [0.84, "#051E1D"],
    ],
    glowColor: "rgba(45,212,191,0.34)",
  },
  warm: {
    stops: [
      [0, "#B9F27A"],
      [0.22, "#6BB84A"],
      [0.52, "#2C6E4E"],
      [0.84, "#06201A"],
    ],
    glowColor: "rgba(163,230,53,0.3)",
  },
};

const COMET_TONES: Record<
  OrbitTone,
  { stops: [number, string][]; glow1: string; glow2: string; tail: string }
> = {
  default: {
    stops: [
      [0, "#FBFFF4"],
      [0.55, ICON_LIME_LIGHT],
      [0.8, ICON_LIME],
    ],
    glow1: "rgba(190,242,100,1)",
    glow2: "rgba(163,230,53,0.55)",
    tail: ICON_LIME_LIGHT,
  },
  cold: {
    stops: [
      [0, "#FBFFF4"],
      [0.55, ICON_LIME_LIGHT],
      [0.8, ICON_LIME],
    ],
    glow1: "rgba(190,242,100,1)",
    glow2: "rgba(163,230,53,0.55)",
    tail: ICON_LIME_LIGHT,
  },
  warm: {
    stops: [
      [0, "#FBFFFE"],
      [0.55, ICON_ACCENT],
      [0.8, ICON_MINT],
    ],
    glow1: "rgba(94,234,212,1)",
    glow2: "rgba(45,212,191,0.55)",
    tail: ICON_ACCENT,
  },
};

function Planet({
  hot,
  tone,
  reducedMotion,
}: {
  hot: boolean;
  tone: OrbitTone;
  reducedMotion: boolean;
}) {
  const box = PLANET_SIZE;
  const highlightW = box * 0.3;
  const highlightH = box * 0.16;
  const highlightCx = box * 0.15 + highlightW / 2;
  const highlightCy = box * 0.11 + highlightH / 2;
  const { stops, glowColor } = PLANET_TONES[tone];

  const breathe = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.028, {
          duration: 3250,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, { duration: 3250, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, breathe]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: PLANET_OFFSET,
          left: PLANET_OFFSET,
          width: box,
          height: box,
          borderRadius: box / 2,
          overflow: "hidden",
          shadowColor: hot ? "rgba(190,242,100,0.45)" : glowColor,
          shadowOpacity: 1,
          shadowRadius: hot ? 74 : 44,
          shadowOffset: { width: 0, height: 0 },
        },
        breatheStyle,
      ]}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${box} ${box}`}>
        <Defs>
          <RadialGradient id="finishPlanet" cx="34%" cy="30%" r="75%">
            {stops.map(([offset, color]) => (
              <Stop key={offset} offset={offset} stopColor={color} />
            ))}
          </RadialGradient>
          <LinearGradient id="finishTerm" x1="80%" y1="10%" x2="20%" y2="90%">
            <Stop offset="0" stopColor="#01080A" stopOpacity={0.72} />
            <Stop offset="0.54" stopColor="#01080A" stopOpacity={0} />
          </LinearGradient>
          <Filter
            id="finishHighlightBlur"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <FeGaussianBlur stdDeviation={4} />
          </Filter>
        </Defs>
        <Rect x={0} y={0} width={box} height={box} fill="url(#finishPlanet)" />
        <Ellipse
          cx={highlightCx}
          cy={highlightCy}
          rx={highlightW / 2}
          ry={highlightH / 2}
          fill="rgba(255,255,255,0.42)"
          filter="url(#finishHighlightBlur)"
          transform={`rotate(-18 ${highlightCx} ${highlightCy})`}
        />
        <Rect x={0} y={0} width={box} height={box} fill="url(#finishTerm)" />
      </Svg>
    </Animated.View>
  );
}

function SaturnRing() {
  const width = 190;
  const height = 48;
  const cx = width / 2;
  const cy = height / 2;
  const outerRx = width / 2;
  const outerRy = height / 2;
  const innerRx = (width - 32) / 2;
  const innerRy = (height - 12) / 2;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 110,
        left: 36,
        width,
        height,
        transform: [{ rotate: "-16deg" }],
      }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={`M ${cx - outerRx} ${cy} A ${outerRx} ${outerRy} 0 0 1 ${cx + outerRx} ${cy}`}
          stroke="rgba(163,230,53,0.26)"
          strokeWidth={2}
          fill="none"
        />
        <Path
          d={`M ${cx - innerRx} ${cy} A ${innerRx} ${innerRy} 0 0 1 ${cx + innerRx} ${cy}`}
          stroke="rgba(94,234,212,0.18)"
          strokeWidth={1}
          fill="none"
        />
      </Svg>
    </View>
  );
}

function Shell({
  delay,
  color,
  reducedMotion,
}: {
  delay: number;
  color: string;
  reducedMotion: boolean;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(reducedMotion ? 0 : 0.85);

  useEffect(() => {
    if (reducedMotion) return;
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.55, {
          duration: 4200,
          easing: Easing.bezier(0.2, 0.7, 0.3, 1),
        }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, {
          duration: 4200,
          easing: Easing.bezier(0.2, 0.7, 0.3, 1),
        }),
        -1,
        false,
      ),
    );
  }, [reducedMotion, delay, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: PLANET_OFFSET,
          left: PLANET_OFFSET,
          width: PLANET_SIZE,
          height: PLANET_SIZE,
          borderRadius: PLANET_SIZE / 2,
          borderWidth: 1,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

function Shells({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <Shell
        delay={0}
        color="rgba(94,234,212,0.5)"
        reducedMotion={reducedMotion}
      />
      <Shell
        delay={1400}
        color="rgba(190,242,100,0.42)"
        reducedMotion={reducedMotion}
      />
      <Shell
        delay={2800}
        color="rgba(94,234,212,0.3)"
        reducedMotion={reducedMotion}
      />
    </>
  );
}

function Flare({
  delay,
  color,
  reducedMotion,
}: {
  delay: number;
  color: string;
  reducedMotion: boolean;
}) {
  const scale = useSharedValue(0.52);
  const opacity = useSharedValue(reducedMotion ? 0 : 0.9);

  useEffect(() => {
    if (reducedMotion) return;
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.28, {
          duration: 2600,
          easing: Easing.bezier(0.2, 0.7, 0.3, 1),
        }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, {
          duration: 2600,
          easing: Easing.bezier(0.2, 0.7, 0.3, 1),
        }),
        -1,
        false,
      ),
    );
  }, [reducedMotion, delay, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: PLANET_OFFSET,
          left: PLANET_OFFSET,
          width: PLANET_SIZE,
          height: PLANET_SIZE,
          borderRadius: PLANET_SIZE / 2,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

function Flares({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <Flare
        delay={2600}
        color="rgba(190,242,100,0.85)"
        reducedMotion={reducedMotion}
      />
      <Flare
        delay={3500}
        color="rgba(94,234,212,0.6)"
        reducedMotion={reducedMotion}
      />
    </>
  );
}

function CometDot({ tone }: { tone: OrbitTone }) {
  const size = 20;
  const { stops, glow1 } = COMET_TONES[tone];
  return (
    <View
      style={{
        position: "absolute",
        top: -size / 2,
        left: "50%",
        marginLeft: -size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        shadowColor: glow1,
        shadowOpacity: 1,
        shadowRadius: size * 2.7,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="cometGrad" cx="35%" cy="35%" r="70%">
            {stops.map(([offset, color]) => (
              <Stop key={offset} offset={offset} stopColor={color} />
            ))}
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill="url(#cometGrad)" />
      </Svg>
    </View>
  );
}

function TailDot({
  offsetDeg,
  opacity,
  color,
}: {
  offsetDeg: number;
  opacity: number;
  color: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ rotate: `${offsetDeg}deg` }] },
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: -4,
          left: "50%",
          marginLeft: -4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          opacity,
          shadowColor: color,
          shadowOpacity: 1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

function Comet({
  progress,
  fraction,
  hot,
  tone,
  reducedMotion,
}: {
  progress: SharedValue<number>;
  fraction: number;
  hot: boolean;
  tone: OrbitTone;
  reducedMotion: boolean;
}) {
  const pulse = useSharedValue(1);
  const { tail } = COMET_TONES[tone];

  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(withTiming(1.26, { duration: 1800 }), -1, true);
  }, [reducedMotion, pulse]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * fraction * 360}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, rotateStyle]}>
      <Animated.View style={pulseStyle}>
        <CometDot tone={tone} />
      </Animated.View>
      {hot && (
        <>
          <TailDot offsetDeg={-7} opacity={0.55} color={tail} />
          <TailDot offsetDeg={-14} opacity={0.34} color={tail} />
          <TailDot offsetDeg={-22} opacity={0.18} color={tail} />
        </>
      )}
    </Animated.View>
  );
}

function Arc({
  progress,
  fraction,
}: {
  progress: SharedValue<number>;
  fraction: number;
}) {
  const circlePath = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(CENTER, CENTER, RADIUS);
    return path;
  }, []);

  const end = useDerivedValue(() => progress.value * fraction);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group
        transform={[{ rotate: -Math.PI / 2 }]}
        origin={vec(CENTER, CENTER)}
      >
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          style="stroke"
          strokeWidth={3}
          color="rgba(220,255,245,0.07)"
        >
          <DashPathEffect intervals={[3, 9]} />
        </Circle>
        <SkiaPath
          path={circlePath}
          start={0}
          end={end}
          style="stroke"
          strokeWidth={10}
          strokeCap="round"
          opacity={0.55}
        >
          <Blur blur={6} />
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(ORB_SIZE, ORB_SIZE)}
            colors={[ICON_MINT, ICON_LIME_LIGHT]}
          />
        </SkiaPath>
        <SkiaPath
          path={circlePath}
          start={0}
          end={end}
          style="stroke"
          strokeWidth={5.5}
          strokeCap="round"
        >
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(ORB_SIZE, ORB_SIZE)}
            colors={[ICON_MINT, ICON_LIME_LIGHT]}
          />
        </SkiaPath>
      </Group>
    </Canvas>
  );
}

interface OrbitProgressProps {
  progress: SharedValue<number>;
  fraction: number;
  hot?: boolean;
  tone?: OrbitTone;
}

export function OrbitProgress({
  progress,
  fraction,
  hot = false,
  tone = "default",
}: OrbitProgressProps) {
  const reducedMotion = useReducedMotion();

  return (
    <View style={{ width: ORB_SIZE, height: ORB_SIZE }}>
      <Arc progress={progress} fraction={fraction} />
      <Shells reducedMotion={reducedMotion} />
      <Planet hot={hot} tone={tone} reducedMotion={reducedMotion} />
      <SaturnRing />
      {hot && <Flares reducedMotion={reducedMotion} />}
      <Comet
        progress={progress}
        fraction={fraction}
        hot={hot}
        tone={tone}
        reducedMotion={reducedMotion}
      />
    </View>
  );
}

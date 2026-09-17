import { CENTER, RADIUS } from "@/src/components/flashcards/orbit/orbitLayout";
import {
  TWO_PI,
  toRad,
} from "@/src/components/flashcards/orbit/orbitMath";
import {
  MOON_DIM_GLOW,
  MOON_DIM_RIM,
  MOON_DIM_STOPS,
  ORBIT_STATE_STYLES,
  OrbitState,
} from "@/src/components/flashcards/orbit/orbitState";
import { EASE_STANDARD } from "@/src/constants/motion";
import {
  Blur,
  Circle,
  Group,
  RadialGradient as SkiaRadialGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import {
  Easing,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SPIN_MS = 44000;
const MOON_ANGLES = [-90, -18, 54, 126, 198];
const MOON_COUNT = MOON_ANGLES.length;
const MOON_LIT_MS = 320;

const LIT_R = 8;
const LIT_GRADIENT_R = 12;
const LIT_HIGHLIGHT_X = -2.56;
const LIT_HIGHLIGHT_Y = -3.52;
const LIT_NEAR_BLUR = 8;
const LIT_FAR_BLUR = 17;

const DIM_R = 6.5;
const DIM_GRADIENT_R = 10;
const DIM_HIGHLIGHT_X = -2.08;
const DIM_HIGHLIGHT_Y = -2.86;
const DIM_RIM_R = 6;
const DIM_RIM_WIDTH = 1;
const DIM_BLUR = 4.5;

interface GradientStops {
  colors: string[];
  positions: number[];
}

function splitStops(stops: [number, string][]): GradientStops {
  return {
    colors: stops.map((stop) => stop[1]),
    positions: stops.map((stop) => stop[0]),
  };
}

const LIT_GRADIENT: Record<OrbitState, GradientStops> = {
  cool: splitStops(ORBIT_STATE_STYLES.cool.moonStops),
  green: splitStops(ORBIT_STATE_STYLES.green.moonStops),
};

const DIM_GRADIENT = splitStops(MOON_DIM_STOPS);

interface MoonSlot {
  angle: number;
  x: number;
  y: number;
}

const MOON_SLOTS: MoonSlot[] = MOON_ANGLES.map((angle) => ({
  angle,
  x: CENTER + RADIUS * Math.cos(toRad(angle)),
  y: CENTER + RADIUS * Math.sin(toRad(angle)),
}));

function Moon({
  slot,
  index,
  litCount,
  spin,
  state,
  reducedMotion,
}: {
  slot: MoonSlot;
  index: number;
  litCount: SharedValue<number>;
  spin: SharedValue<number>;
  state: OrbitState;
  reducedMotion: boolean;
}) {
  const style = ORBIT_STATE_STYLES[state];
  const gradient = LIT_GRADIENT[state];
  const lit = useSharedValue(0);

  useAnimatedReaction(
    () => index < litCount.value,
    (isLit, wasLit) => {
      if (wasLit === null) {
        lit.value = isLit ? 1 : 0;
        return;
      }
      if (isLit === wasLit) return;
      lit.value = withTiming(isLit ? 1 : 0, {
        duration: reducedMotion ? 0 : MOON_LIT_MS,
        easing: EASE_STANDARD,
      });
    },
    [index, reducedMotion],
  );

  const dim = useDerivedValue(() => 1 - lit.value);
  const unspin = useDerivedValue(() => [{ rotate: -spin.value }]);

  return (
    <Group transform={unspin} origin={vec(slot.x, slot.y)}>
      <Group opacity={dim}>
        <Group>
          <Blur blur={DIM_BLUR} />
          <Circle cx={slot.x} cy={slot.y} r={DIM_R} color={MOON_DIM_GLOW} />
        </Group>
        <Circle cx={slot.x} cy={slot.y} r={DIM_R}>
          <SkiaRadialGradient
            c={vec(slot.x + DIM_HIGHLIGHT_X, slot.y + DIM_HIGHLIGHT_Y)}
            r={DIM_GRADIENT_R}
            colors={DIM_GRADIENT.colors}
            positions={DIM_GRADIENT.positions}
          />
        </Circle>
        <Circle
          cx={slot.x}
          cy={slot.y}
          r={DIM_RIM_R}
          style="stroke"
          strokeWidth={DIM_RIM_WIDTH}
          color={MOON_DIM_RIM}
        />
      </Group>

      <Group opacity={lit}>
        <Group>
          <Blur blur={LIT_FAR_BLUR} />
          <Circle cx={slot.x} cy={slot.y} r={LIT_R} color={style.moonGlowFar} />
        </Group>
        <Group>
          <Blur blur={LIT_NEAR_BLUR} />
          <Circle
            cx={slot.x}
            cy={slot.y}
            r={LIT_R}
            color={style.moonGlowNear}
          />
        </Group>
        <Circle cx={slot.x} cy={slot.y} r={LIT_R}>
          <SkiaRadialGradient
            c={vec(slot.x + LIT_HIGHLIGHT_X, slot.y + LIT_HIGHLIGHT_Y)}
            r={LIT_GRADIENT_R}
            colors={gradient.colors}
            positions={gradient.positions}
          />
        </Circle>
      </Group>
    </Group>
  );
}

interface OrbitMoonsProps {
  progress: SharedValue<number>;
  fraction: number;
  state: OrbitState;
  reducedMotion: boolean;
}

export function OrbitMoons({
  progress,
  fraction,
  state,
  reducedMotion,
}: OrbitMoonsProps) {
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    spin.value = withRepeat(
      withTiming(TWO_PI, { duration: SPIN_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reducedMotion, spin]);

  const litCount = useDerivedValue(() =>
    Math.floor(progress.value * fraction * MOON_COUNT),
  );
  const ringSpin = useDerivedValue(() => [{ rotate: spin.value }]);

  return (
    <Group transform={ringSpin} origin={vec(CENTER, CENTER)}>
      {MOON_SLOTS.map((slot, index) => (
        <Moon
          key={slot.angle}
          slot={slot}
          index={index}
          litCount={litCount}
          spin={spin}
          state={state}
          reducedMotion={reducedMotion}
        />
      ))}
    </Group>
  );
}

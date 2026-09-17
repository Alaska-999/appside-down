import { OrbitState } from "@/src/components/flashcards/orbitState";
import {
  ICON_CYAN_LIGHT,
  ICON_HERO_LIME,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_TEXT,
} from "@/src/constants/iconColors";
import { SPARK_CORE } from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";
import { Blur, Canvas, Circle, Group, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const BOX = 64;
const MID = BOX / 2;
const HALO_R = 5;
const TINT_R = 6;
const CORE_R = 2.6;
const SPARK_R = 2.1;
const PULSE_SCALE = 1.12;
const PULSE_MS = 1800;

const BEAD_HALO: Record<
  OrbitState,
  { lead: string; trail: string; tint: string }
> = {
  cool: { lead: ICON_CYAN_LIGHT, trail: ICON_MINT, tint: ICON_LIME },
  green: { lead: ICON_LIME, trail: ICON_HERO_LIME, tint: ICON_LIME_LIGHT },
};

interface OrbitBeadProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  opacity: SharedValue<number>;
  state: OrbitState;
  reducedMotion: boolean;
}

export function OrbitBead({
  x,
  y,
  opacity,
  state,
  reducedMotion,
}: OrbitBeadProps) {
  const pulse = useSharedValue(1);
  const halo = BEAD_HALO[state];

  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(
      withTiming(PULSE_SCALE, {
        duration: PULSE_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [reducedMotion, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value - MID }, { translateY: y.value - MID }],
  }));

  const starTransform = useDerivedValue(() => [{ scale: pulse.value }]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", top: 0, left: 0, width: BOX, height: BOX },
        style,
      ]}
    >
      <Canvas style={{ width: BOX, height: BOX }}>
        <Group transform={starTransform} origin={vec(MID, MID)}>
          <Group>
            <Blur blur={3} />
            <Circle
              cx={MID - 1.4}
              cy={MID - 1}
              r={HALO_R}
              color={withAlpha(halo.lead, 0.7)}
            />
            <Circle
              cx={MID + 2.6}
              cy={MID + 2}
              r={HALO_R}
              color={withAlpha(halo.trail, 0.22)}
            />
            <Circle
              cx={MID + 0.8}
              cy={MID + 1.2}
              r={TINT_R}
              color={withAlpha(halo.tint, 0.26)}
            />
          </Group>

          <Group>
            <Blur blur={3} />
            <Circle
              cx={MID}
              cy={MID}
              r={CORE_R}
              color={withAlpha(ICON_TEXT, 0.6)}
            />
          </Group>
          <Group>
            <Blur blur={1} />
            <Circle
              cx={MID}
              cy={MID}
              r={SPARK_R}
              color={withAlpha(SPARK_CORE, 0.9)}
            />
          </Group>
        </Group>
      </Canvas>
    </Animated.View>
  );
}

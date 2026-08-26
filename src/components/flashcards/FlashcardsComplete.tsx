import { AppButton } from "@/src/components/ui/Button";
import { GradientText } from "@/src/components/ui/GradientText";
import { ScreenAtmosphere } from "@/src/components/ui/ScreenAtmosphere";
import { OrbitProgress } from "@/src/components/flashcards/OrbitProgress";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { useGameStore } from "@/src/store/useGameStore";
import { useEffect } from "react";
import { DimensionValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 265;

interface FlashcardsCompleteProps {
  total: number;
  known: number;
  stillLearning: number;
}

interface SparkSpec {
  size: number;
  top: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  color: string;
  delay: number;
}

const SPARKS: SparkSpec[] = [
  { size: 4, top: "10%", left: "14%", color: "#A3E635", delay: 0 },
  { size: 5, top: "18%", right: "12%", color: "#5EEAD4", delay: 700 },
  { size: 3, top: "46%", left: "8%", color: "#A3E635", delay: 1300 },
];

function Spark({ spark }: { spark: SparkSpec }) {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      spark.delay,
      withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [opacity, spark.delay]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: spark.top,
          left: spark.left,
          right: spark.right,
          width: spark.size * MOCKUP_SCALE,
          height: spark.size * MOCKUP_SCALE,
          borderRadius: 999,
          backgroundColor: spark.color,
          shadowColor: spark.color,
          shadowOpacity: 0.8,
          shadowRadius: 8 * MOCKUP_SCALE,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

export function FlashcardsComplete({
  total,
  known,
  stillLearning,
}: FlashcardsCompleteProps) {
  const restart = useGameStore((state) => state.restart);
  const insets = useSafeAreaInsets();
  const pct = total > 0 ? known / total : 0;

  return (
    <YStack f={1} pt={insets.top} pb={insets.bottom + 16}>
      <ScreenAtmosphere halo />

      {SPARKS.map((spark, index) => (
        <Spark key={index} spark={spark} />
      ))}

      <YStack alignItems="center" pt={30 * MOCKUP_SCALE}>
        <OrbitProgress percent={pct} />
      </YStack>

      <YStack alignItems="center" mt={12 * MOCKUP_SCALE} gap={2}>
        <GradientText fontSize={50 * MOCKUP_SCALE}>
          {`${Math.round(pct * 100)}%`}
        </GradientText>
        <Text fontSize={11 * MOCKUP_SCALE} color="$colorMuted" mt={3 * MOCKUP_SCALE}>
          of orbit travelled
        </Text>
        <Text fontSize={19 * MOCKUP_SCALE} fontWeight="800" color="$color" mt={8 * MOCKUP_SCALE}>
          Nice run! 🎉
        </Text>
      </YStack>

      <XStack alignItems="center" jc="center" gap="$2" mt={12 * MOCKUP_SCALE}>
        <StatusPill tone="known" count={known} label="known" />
        <StatusPill tone="learning" count={stillLearning} label="learning" />
      </XStack>

      <View f={1} />

      <YStack px="$5" gap="$3">
        {stillLearning > 0 && (
          <AppButton variant="primary" onPress={() => restart(true)}>
            Keep reviewing {stillLearning}
          </AppButton>
        )}

        <AppButton variant="secondary" onPress={() => restart()}>
          Restart deck
        </AppButton>
      </YStack>
    </YStack>
  );
}

import { OrbitProgress } from "@/src/components/flashcards/OrbitProgress";
import { OrbitSparks } from "@/src/components/flashcards/OrbitSparks";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { AnimatedNumber } from "@/src/components/ui/AnimatedNumber";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import {
  BackgroundMesh,
  BackgroundPreset,
} from "@/src/components/ui/ScreenBackground";
import {
  ICON_ACCENT,
  ICON_LIME_LIGHT,
  ICON_ON_GLASS,
} from "@/src/constants/iconColors";
import { EASE_STANDARD } from "@/src/constants/motion";
import { TEXT_MINT_MED } from "@/src/constants/surfaceAlpha";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useGameStore } from "@/src/store/useGameStore";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Text, View, XStack, YStack } from "tamagui";

interface FlashcardsCompleteProps {
  total: number;
  known: number;
  stillLearning: number;
  onClose?: () => void;
}

export function finishToneForHour(hour: number): {
  preset: BackgroundPreset;
  tone: "default" | "cold" | "warm";
} {
  if (hour >= 6 && hour < 12) return { preset: "finishWarm", tone: "warm" };
  if (hour >= 12 && hour < 20) return { preset: "finish", tone: "default" };
  return { preset: "finishCold", tone: "cold" };
}

export function FlashcardsComplete({
  total,
  known,
  stillLearning,
  onClose,
}: FlashcardsCompleteProps) {
  const restart = useGameStore((state) => state.restart);
  const router = useRouter();
  const screen = useScreenInsets();
  const reducedMotion = useReducedMotion();

  const fraction = total > 0 ? known / total : 0;
  const isFull = fraction >= 1;
  const targetPct = Math.round(fraction * 100);
  const duration = isFull ? 2400 : 1700;

  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const { preset, tone } = useMemo(
    () => finishToneForHour(new Date().getHours()),
    [],
  );

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(
      350,
      withTiming(1, { duration, easing: EASE_STANDARD }),
    );
  }, [reducedMotion, duration, progress]);

  return (
    <YStack f={1} pos="relative">
      <BackgroundMesh preset={preset} />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <OrbitSparks reducedMotion={reducedMotion} />
      </View>

      <YStack f={1} pt={screen.top} pb={screen.bottom}>
        <XStack px={16}>
          <IconButton
            variant="liquidGlass"
            icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
            onPress={onClose ?? (() => router.back())}
            accessibilityLabel="Close"
          />
        </XStack>
        <YStack f={1} ai="center" jc="center">
          <OrbitProgress
            progress={progress}
            fraction={fraction}
            hot={isFull}
            tone={tone}
          />
        </YStack>

        <YStack ai="center">
          <AnimatedNumber
            progress={progress}
            from={0}
            to={targetPct}
            suffix="%"
            gradientColors={[ICON_ACCENT, ICON_LIME_LIGHT]}
            width={210}
            height={76}
            style={{
              fontSize: 76,
              fontWeight: "800",
              letterSpacing: -3.04,
              textAlign: "center",
            }}
          />
          <Text
            fontSize={12}
            fontWeight="700"
            letterSpacing={2.4}
            textTransform="uppercase"
            color={TEXT_MINT_MED}
            mt={8}
          >
            {isFull ? "orbit closed" : "of the orbit"}
          </Text>
        </YStack>

        <XStack jc="center" gap={10} mt={15}>
          <StatusPill kind="moon" tone="known" count={known} label="known" />
          {!isFull && (
            <StatusPill
              kind="moon"
              tone="learning"
              count={stillLearning}
              label="learning"
            />
          )}
        </XStack>

        <YStack px={22} gap={10} pt={20}>
          {isFull ? (
            <>
              <AppButton variant="primary" size="lg" onPress={() => restart()}>
                Practise all again
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
              >
                Back to module
              </AppButton>
            </>
          ) : (
            <>
              <AppButton
                variant="primary"
                size="md"
                onPress={() => restart(true)}
              >
                Practise {stillLearning} cards
              </AppButton>
              <AppButton
                variant="secondary"
                size="md"
                onPress={() => restart()}
              >
                Restart game
              </AppButton>
              <AppButton
                variant="ghost"
                size="md"
                onPress={() => router.back()}
              >
                Back to module
              </AppButton>
            </>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}

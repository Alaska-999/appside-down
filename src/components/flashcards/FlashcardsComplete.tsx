import {
  OrbitProgress,
  OrbitTone,
} from "@/src/components/flashcards/orbit/OrbitProgress";
import { OrbitRingHero } from "@/src/components/flashcards/orbit/OrbitRingHero";
import { OrbitSparks } from "@/src/components/flashcards/orbit/OrbitSparks";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import {
  BackgroundMesh,
  BackgroundPreset,
} from "@/src/components/ui/background/ScreenBackground";
import { AppButton } from "@/src/components/ui/controls/Button";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { AnimatedNumber } from "@/src/components/ui/display/AnimatedNumber";
import { StaggerIn } from "@/src/components/ui/motion/StaggerIn";
import { FINISH_HERO, FinishHeroVariant } from "@/src/constants/finishHero";
import {
  ICON_ACCENT,
  ICON_LIME_LIGHT,
  ICON_ON_GLASS,
} from "@/src/constants/iconColors";
import {
  EASE_STANDARD,
  FINISH_PROGRESS_DELAY_MS,
  FINISH_STAGGER_MS,
} from "@/src/constants/motion";
import { TEXT_MINT_MED } from "@/src/constants/surfaceAlpha";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useGameStore } from "@/src/store/useGameStore";
import { ratio } from "@/src/utils/progress";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  SharedValue,
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
  heroVariant?: FinishHeroVariant;
}

export function finishToneForHour(hour: number): {
  preset: BackgroundPreset;
  tone: "default" | "warm";
} {
  if (hour >= 6 && hour < 12) return { preset: "finishWarm", tone: "warm" };
  return { preset: "finish", tone: "default" };
}

export function finishToneForHourBright(hour: number): {
  preset: BackgroundPreset;
  tone: "default" | "warm";
} {
  if (hour >= 6 && hour < 12) return { preset: "finishWarm2", tone: "warm" };
  return { preset: "finish2", tone: "default" };
}

function Hero({
  variant,
  progress,
  fraction,
  hot,
  tone,
}: {
  variant: FinishHeroVariant;
  progress: SharedValue<number>;
  fraction: number;
  hot: boolean;
  tone: OrbitTone;
}) {
  if (variant === "ring") {
    return <OrbitRingHero progress={progress} fraction={fraction} hot={hot} />;
  }
  return (
    <OrbitProgress
      progress={progress}
      fraction={fraction}
      hot={hot}
      tone={tone}
    />
  );
}

export function FlashcardsComplete({
  total,
  known,
  stillLearning,
  onClose,
  heroVariant = FINISH_HERO,
}: FlashcardsCompleteProps) {
  const restart = useGameStore((state) => state.restart);
  const router = useRouter();
  const screen = useScreenInsets();
  const reducedMotion = useReducedMotion();

  const fraction = ratio(known, total);
  const isFull = fraction >= 1;
  const hasStillLearning = stillLearning > 0;
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
      FINISH_PROGRESS_DELAY_MS,
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
        <StaggerIn delay={FINISH_STAGGER_MS * 4}>
          <XStack px={16}>
            <IconButton
              variant="liquidGlass"
              icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
              onPress={onClose ?? (() => router.back())}
              accessibilityLabel="Close"
            />
          </XStack>
        </StaggerIn>
        <StaggerIn
          variant="bloom"
          delay={FINISH_STAGGER_MS}
          style={{ flex: 1 }}
        >
          <YStack f={1} ai="center" jc="center">
            <Hero
              variant={heroVariant}
              progress={progress}
              fraction={fraction}
              hot={isFull}
              tone={tone}
            />
          </YStack>
        </StaggerIn>

        <StaggerIn delay={FINISH_STAGGER_MS * 2}>
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
        </StaggerIn>

        <StaggerIn delay={FINISH_STAGGER_MS * 3}>
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
        </StaggerIn>

        <StaggerIn delay={FINISH_STAGGER_MS * 4}>
          <YStack px={22} gap={10} pt={20}>
            {hasStillLearning ? (
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
                  Practise all again
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="md"
                  onPress={onClose ?? (() => router.back())}
                >
                  Back to module
                </AppButton>
              </>
            ) : (
              <>
                <AppButton
                  variant="primary"
                  size="md"
                  onPress={onClose ?? (() => router.back())}
                >
                  Back to module
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="md"
                  onPress={() => restart()}
                >
                  Practise all again
                </AppButton>
              </>
            )}
          </YStack>
        </StaggerIn>
      </YStack>
    </YStack>
  );
}

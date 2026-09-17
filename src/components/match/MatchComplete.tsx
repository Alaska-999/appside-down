import { OrbitSparks } from "@/src/components/flashcards/orbit/OrbitSparks";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { BeamCraft } from "@/src/components/match/BeamCraft";
import { formatElapsed } from "@/src/components/match/MatchTimer";
import { BackgroundPreset } from "@/src/components/ui/background/backgroundPresets";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { AppButton } from "@/src/components/ui/controls/Button";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { AnimatedNumber } from "@/src/components/ui/display/AnimatedNumber";
import { GlassPill } from "@/src/components/ui/display/GlassPill";
import { StaggerIn } from "@/src/components/ui/motion/StaggerIn";
import {
  ICON_ACCENT,
  ICON_LIME,
  ICON_ON_GLASS,
} from "@/src/constants/iconColors";
import {
  EASE_STANDARD,
  FINISH_PROGRESS_DELAY_MS,
  FINISH_STAGGER_MS,
} from "@/src/constants/motion";
import { TEXT_MINT_STRONG } from "@/src/constants/surfaceAlpha";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { withAlpha } from "@/src/utils/withAlpha";
import { ArrowUp, X } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Text, View, XStack, YStack } from "tamagui";

interface MatchCompleteProps {
  elapsedMs: number;
  totalPairs: number;
  mistakes: number;
  bestMs: number | null;
  isRecord: boolean;
  onRestart: () => void;
  onClose: () => void;
}

const COUNT_DURATION_MS = 1400;
const HERO_WIDTH = 260;
const HERO_HEIGHT = 86;
const MAX_FONT_SCALE = 1.2;
const CAPTION_GLOW_RADIUS = 24;
const SCENE_TOP_GAP = 6;
const EVENING_HOUR = 17;
const MORNING_HOUR = 9;

function finishPresetForHour(hour: number): BackgroundPreset {
  return hour >= EVENING_HOUR || hour < MORNING_HOUR ? "finish2" : "finishWarm";
}

export function MatchComplete({
  elapsedMs,
  totalPairs,
  mistakes,
  bestMs,
  isRecord,
  onRestart,
  onClose,
}: MatchCompleteProps) {
  const screen = useScreenInsets();
  const reducedMotion = useReducedMotion();

  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const progress = useSharedValue(reducedMotion ? 1 : 0);

  const preset = useMemo(() => finishPresetForHour(new Date().getHours()), []);
  const cleanPairs = Math.max(0, totalPairs - mistakes);

  const deltaSeconds =
    bestMs === null ? 0 : Math.round(Math.abs(elapsedMs - bestMs) / 1000);
  const deltaLabel =
    bestMs === null
      ? "First record"
      : isRecord
        ? `${deltaSeconds}s faster than ${formatElapsed(bestMs)}`
        : deltaSeconds === 0
          ? `Even with ${formatElapsed(bestMs)}`
          : `${deltaSeconds}s to beat ${formatElapsed(bestMs)}`;

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(
      FINISH_PROGRESS_DELAY_MS,
      withTiming(1, { duration: COUNT_DURATION_MS, easing: EASE_STANDARD }),
    );
  }, [reducedMotion, progress]);

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
              onPress={onClose}
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
            <AnimatedNumber
              progress={progress}
              from={0}
              to={seconds}
              prefix={`${minutes}:`}
              pad={2}
              gradientColors={[ICON_ACCENT, ICON_LIME]}
              width={HERO_WIDTH}
              height={HERO_HEIGHT}
              style={{
                fontSize: 80,
                fontWeight: "800",
                letterSpacing: 3.04,
                textAlign: "center",
              }}
            />
            <Text
              fontSize={12}
              fontWeight="700"
              letterSpacing={2.4}
              textTransform="uppercase"
              color={isRecord ? "$limeLight" : TEXT_MINT_STRONG}
              textShadowColor={
                isRecord ? withAlpha(ICON_LIME, 0.55) : undefined
              }
              textShadowRadius={isRecord ? CAPTION_GLOW_RADIUS : undefined}
              mt={8}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              accessibilityLabel={`${
                isRecord ? "New record" : "Your time"
              } ${formatElapsed(elapsedMs)}`}
            >
              {isRecord ? "new record" : "your time"}
            </Text>

            <YStack mt={SCENE_TOP_GAP}>
              <BeamCraft
                tone={isRecord ? "record" : "chase"}
                pairs={totalPairs}
                clean={cleanPairs}
              />
            </YStack>
          </YStack>
        </StaggerIn>

        <StaggerIn delay={FINISH_STAGGER_MS * 2}>
          <XStack jc="center" gap={10} mt={15}>
            <StatusPill
              kind="moon"
              tone="mistakes"
              count={mistakes}
              label={mistakes === 1 ? "mistake" : "mistakes"}
            />
            <StatusPill
              kind="moon"
              tone="pairs"
              count={totalPairs}
              label={totalPairs === 1 ? "pair" : "pairs"}
            />
          </XStack>
        </StaggerIn>

        <StaggerIn delay={FINISH_STAGGER_MS * 3}>
          <XStack jc="center" pt={12}>
            <GlassPill
              tone={isRecord ? "delta" : "deltaCool"}
              size="sm"
              icon={isRecord && bestMs !== null ? ArrowUp : undefined}
              label={deltaLabel}
              tabularNums
            />
          </XStack>
        </StaggerIn>

        <StaggerIn delay={FINISH_STAGGER_MS * 4}>
          <YStack px={22} gap={10} pt={20}>
            <AppButton variant="primary" size="md" onPress={onRestart}>
              Match again
            </AppButton>
            <AppButton variant="secondary" size="md" onPress={onClose}>
              Back to module
            </AppButton>
          </YStack>
        </StaggerIn>
      </YStack>
    </YStack>
  );
}

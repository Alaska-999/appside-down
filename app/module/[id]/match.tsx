import { MatchCombo } from "@/src/components/match/MatchCombo";
import { MatchComplete } from "@/src/components/match/MatchComplete";
import { MatchGrid } from "@/src/components/match/MatchGrid";
import { MatchProgressDots } from "@/src/components/match/MatchProgressDots";
import { MatchTimer } from "@/src/components/match/MatchTimer";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import {
  EASE_STANDARD,
  FINISH_HOLD_MS,
  FINISH_INTRO_MS,
  FINISH_OUTRO_MS,
} from "@/src/constants/motion";
import { TEXT_MINT_MED } from "@/src/constants/surfaceAlpha";
import {
  SCREEN_BOTTOM_GAP,
  useScreenInsets,
} from "@/src/hooks/useScreenInsets";
import { useMatchStore } from "@/src/store/useMatchStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import { hapticComplete } from "@/src/utils/haptics";
import { soundComplete } from "@/src/utils/sounds";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const WRONG_HOLD_MS = 400;
const HEADER_TOP_GAP = 6;
const HEADER_HEIGHT = 44;
const HEADER_GRID_GAP = 22;
const COMBO_SLOT_WIDTH = 40;
const HINT_HEIGHT = 34;
const HINT_FADE_MS = 200;
const MAX_FONT_SCALE = 1.2;

interface RoundSummary {
  elapsedMs: number;
  previousBest: number | null;
  isRecord: boolean;
}

const INSTANT_MS = 0;

const EMPTY_SUMMARY: RoundSummary = {
  elapsedMs: 0,
  previousBest: null,
  isRecord: false,
};

export default function MatchGame() {
  const router = useRouter();
  const screen = useScreenInsets();

  const currentModule = useMatchStore((state) => state.currentModule);
  const tiles = useMatchStore((state) => state.tiles);
  const totalPairs = useMatchStore((state) => state.totalPairs);
  const matchedPairs = useMatchStore((state) => state.matchedPairs);
  const combo = useMatchStore((state) => state.combo);
  const locked = useMatchStore((state) => state.locked);
  const startedAt = useMatchStore((state) => state.startedAt);
  const finishedAt = useMatchStore((state) => state.finishedAt);
  const mistakes = useMatchStore((state) => state.mistakes);
  const selectTile = useMatchStore((state) => state.selectTile);
  const resolveWrong = useMatchStore((state) => state.resolveWrong);
  const startTimer = useMatchStore((state) => state.startTimer);
  const finish = useMatchStore((state) => state.finish);
  const restart = useMatchStore((state) => state.restart);
  const addEvent = useStudyQueueStore((state) => state.addEvent);

  const readElapsedRef = useRef<() => number>(() => 0);
  const touchedCardIdsRef = useRef<Set<string>>(new Set());
  const pendingFirstTryRef = useRef(true);
  const lastTapAtRef = useRef(0);
  const [summary, setSummary] = useState<RoundSummary>(EMPTY_SUMMARY);

  const reducedMotion = useReducedMotion();
  const gameFade = useSharedValue(1);
  const finishFade = useSharedValue(0);
  const [outroDone, setOutroDone] = useState(false);

  const gameLayerStyle = useAnimatedStyle(() => ({
    opacity: gameFade.value,
    transform: [
      { scale: 0.98 + gameFade.value * 0.02 },
      { translateY: (1 - gameFade.value) * 8 },
    ],
  }));

  const finishLayerStyle = useAnimatedStyle(() => ({
    opacity: finishFade.value,
  }));

  const hintFade = useSharedValue(1);

  useEffect(() => {
    hintFade.value = withTiming(startedAt === null ? 1 : 0, {
      duration: reducedMotion ? INSTANT_MS : HINT_FADE_MS,
      easing: EASE_STANDARD,
    });
  }, [startedAt, reducedMotion, hintFade]);

  const hintStyle = useAnimatedStyle(() => ({ opacity: hintFade.value }));

  useEffect(() => {
    if (!locked) return;
    const timeout = setTimeout(resolveWrong, WRONG_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [locked, resolveWrong]);

  useEffect(() => {
    if (totalPairs === 0) return;
    if (matchedPairs < totalPairs) return;
    if (finishedAt !== null) return;
    const elapsedMs = readElapsedRef.current();
    const moduleId = useMatchStore.getState().currentModule?.id;
    const previousBest =
      moduleId === undefined
        ? null
        : (useMatchStore.getState().bestTimes[moduleId] ?? null);
    hapticComplete();
    soundComplete();
    const isRecord = finish(elapsedMs);
    setSummary({ elapsedMs, previousBest, isRecord });
  }, [matchedPairs, totalPairs, finishedAt, finish]);

  const isComplete = finishedAt !== null;

  const [wasComplete, setWasComplete] = useState(isComplete);
  if (wasComplete !== isComplete) {
    setWasComplete(isComplete);
    if (!isComplete) setOutroDone(false);
  }

  const phase = !isComplete
    ? "game"
    : outroDone || reducedMotion
      ? "finish"
      : "outro";

  useEffect(() => {
    const hold = isComplete && !reducedMotion ? FINISH_HOLD_MS : 0;

    gameFade.value = withDelay(
      hold,
      withTiming(isComplete ? 0 : 1, {
        duration: reducedMotion ? INSTANT_MS : FINISH_OUTRO_MS,
        easing: EASE_STANDARD,
      }),
    );
    finishFade.value = withDelay(
      hold,
      withTiming(isComplete ? 1 : 0, {
        duration: reducedMotion
          ? INSTANT_MS
          : FINISH_OUTRO_MS + FINISH_INTRO_MS,
        easing: EASE_STANDARD,
      }),
    );

    if (!isComplete || reducedMotion) return;

    const timer = setTimeout(
      () => setOutroDone(true),
      FINISH_HOLD_MS + FINISH_OUTRO_MS,
    );
    return () => clearTimeout(timer);
  }, [isComplete, reducedMotion, gameFade, finishFade]);

  const handleRestart = useCallback(() => {
    setSummary(EMPTY_SUMMARY);
    touchedCardIdsRef.current = new Set();
    pendingFirstTryRef.current = true;
    lastTapAtRef.current = 0;
    restart();
  }, [restart]);

  const handleSelect = useCallback(
    (tileId: string) => {
      if (locked) return;
      const tile = tiles.find((t) => t.tileId === tileId);
      if (!tile || tile.state === "matched") return;

      const previousSelectedId = useMatchStore.getState().selectedTileId;
      const now = readElapsedRef.current();

      if (previousSelectedId === null) {
        pendingFirstTryRef.current = !touchedCardIdsRef.current.has(
          tile.cardId,
        );
        touchedCardIdsRef.current.add(tile.cardId);
        startTimer();
        selectTile(tileId);
        lastTapAtRef.current = now;
        return;
      }

      touchedCardIdsRef.current.add(tile.cardId);

      startTimer();
      selectTile(tileId);

      if (previousSelectedId !== tileId && currentModule) {
        const previousTile = tiles.find((t) => t.tileId === previousSelectedId);
        const resolvedTile = useMatchStore
          .getState()
          .tiles.find((t) => t.tileId === tileId);

        if (previousTile && resolvedTile) {
          const matched = resolvedTile.state === "matched";
          const answeredAt = new Date().toISOString();
          const responseMs = matched
            ? Math.max(0, now - lastTapAtRef.current)
            : undefined;

          const cardIds = matched
            ? [resolvedTile.cardId]
            : Array.from(new Set([previousTile.cardId, resolvedTile.cardId]));

          for (const cardId of cardIds) {
            addEvent({
              flashcardId: cardId,
              moduleId: currentModule.id,
              mode: "MATCH",
              correct: matched,
              firstTry: matched ? pendingFirstTryRef.current : false,
              responseMs,
              answeredAt,
            });
          }
        }
      }

      lastTapAtRef.current = now;
    },
    [locked, tiles, currentModule, startTimer, selectTile, addEvent],
  );

  const bottomInset = Math.max(screen.insets.bottom, SCREEN_BOTTOM_GAP);

  return (
    <YStack f={1} bg="$background">
      {phase !== "finish" && (
        <Animated.View style={[styles.layer, gameLayerStyle]}>
          <BackgroundMesh preset="auth" />

          <YStack px="$screenX" pt={screen.top + HEADER_TOP_GAP}>
            <XStack h={HEADER_HEIGHT} ai="center" pos="relative">
              <IconButton
                icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
                variant="liquidGlass"
                onPress={() => router.back()}
                accessibilityLabel="Close match"
              />
              <XStack f={1} />
              <MatchProgressDots total={totalPairs} matched={matchedPairs} />
              <XStack
                pos="absolute"
                l={0}
                r={0}
                t={0}
                b={0}
                ai="center"
                jc="center"
                gap={8}
                pointerEvents="none"
              >
                <YStack w={COMBO_SLOT_WIDTH} />
                <MatchTimer
                  running={startedAt !== null && finishedAt === null}
                  readerRef={readElapsedRef}
                />
                <YStack w={COMBO_SLOT_WIDTH} ai="flex-start">
                  <MatchCombo combo={combo} />
                </YStack>
              </XStack>
            </XStack>
          </YStack>

          <YStack f={1} pt={HEADER_GRID_GAP} pb={bottomInset}>
            <MatchGrid tiles={tiles} onSelect={handleSelect} />
            <Animated.View
              style={[styles.hint, hintStyle]}
              pointerEvents="none"
            >
              <Text
                fontSize={12.5}
                fontWeight="500"
                color={TEXT_MINT_MED}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                Tap a term and its definition
              </Text>
            </Animated.View>
          </YStack>
        </Animated.View>
      )}

      {phase !== "game" && (
        <Animated.View
          style={[StyleSheet.absoluteFill, finishLayerStyle]}
          pointerEvents={phase === "finish" ? "auto" : "none"}
        >
          <MatchComplete
            elapsedMs={summary.elapsedMs}
            totalPairs={totalPairs}
            mistakes={mistakes}
            bestMs={summary.previousBest}
            isRecord={summary.isRecord}
            onRestart={handleRestart}
            onClose={() => router.back()}
          />
        </Animated.View>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1 },
  hint: {
    height: HINT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});

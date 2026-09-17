import { API_BASE_URL } from "@/src/api/config";
import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { FlashcardLg } from "@/src/components/flashcards/Flashcard-lg";
import { FlashcardsComplete } from "@/src/components/flashcards/FlashcardsComplete";
import { FlashcardsSettingsSheet } from "@/src/components/flashcards/FlashcardsSettingsSheet";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { SyncingPill } from "@/src/components/ui/feedback/SyncingPill";
import { AppToast } from "@/src/components/ui/feedback/Toast";
import { ICON_MUTED, ICON_ON_GLASS } from "@/src/constants/iconColors";
import {
  EASE_STANDARD,
  FINISH_HOLD_MS,
  FINISH_INTRO_MS,
  FINISH_OUTRO_MS,
} from "@/src/constants/motion";
import { useOptimisticPatch } from "@/src/hooks/useOptimisticPatch";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { SwipeDecision } from "@/src/hooks/useSwipeCard";
import { useGameStore } from "@/src/store/useGameStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import { hapticComplete, hapticSwipe } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { soundComplete } from "@/src/utils/sounds";
import { useRouter } from "expo-router";
import { RotateCcw, Settings2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { AppState, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { PortalProvider, YStack } from "tamagui";

export default function FlashcardsGame() {
  const activeCards = useGameStore((state) => state.activeCards);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const knownPiles = useGameStore((state) => state.knownPiles);
  const stillLearningPiles = useGameStore((state) => state.stillLearningPiles);
  const settings = useGameStore((state) => state.settings);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  const swipeRight = useGameStore((state) => state.swipeRight);
  const swipeLeft = useGameStore((state) => state.swipeLeft);
  const revertSwipe = useGameStore((state) => state.revertSwipe);
  const restart = useGameStore((state) => state.restart);
  const toggleStar = useGameStore((state) => state.toggleStar);
  const addEvent = useStudyQueueStore((state) => state.addEvent);
  const flush = useStudyQueueStore((state) => state.flush);
  const flushing = useStudyQueueStore((state) => state.flushing);
  const router = useRouter();
  const screen = useScreenInsets();

  const [revertCount, setRevertCount] = useState(0);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<
    "left" | "right"
  >("right");
  const [decision, setDecision] = useState<SwipeDecision>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [outroDone, setOutroDone] = useState(false);

  const patch = useOptimisticPatch(setToast);

  const reducedMotion = useReducedMotion();
  const gameFade = useSharedValue(1);
  const finishFade = useSharedValue(0);

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

  const litSide =
    decision === "know" || decision === "dragRight"
      ? "known"
      : decision === "learning" || decision === "dragLeft"
        ? "learning"
        : null;

  const handleSwipeRight = useCallback(() => {
    setLastSwipeDirection("right");
    hapticSwipe();
    const card = activeCards[currentIndex];
    if (card) {
      addEvent({
        flashcardId: card.id,
        moduleId: card.moduleId,
        mode: "FLASHCARDS",
        correct: true,
        answeredAt: new Date().toISOString(),
      });
    }
    swipeRight();
  }, [swipeRight, activeCards, currentIndex, addEvent]);

  const handleSwipeLeft = useCallback(() => {
    setLastSwipeDirection("left");
    hapticSwipe();
    const card = activeCards[currentIndex];
    if (card) {
      addEvent({
        flashcardId: card.id,
        moduleId: card.moduleId,
        mode: "FLASHCARDS",
        correct: false,
        answeredAt: new Date().toISOString(),
      });
    }
    swipeLeft();
  }, [swipeLeft, activeCards, currentIndex, addEvent]);

  const handleRevert = useCallback(() => {
    if (currentIndex <= 0) return;

    revertSwipe();
    setRevertCount((c) => c + 1);
  }, [currentIndex, revertSwipe]);

  const handleToggleStar = useCallback(async () => {
    const card = activeCards[currentIndex];
    if (!card) return;
    const newValue = !card.isStarred;
    await patch({
      onLog: "FlashcardsGame",
      errorMessage: "Couldn't update star. Try again",
      apply: () => toggleStar(card.id),
      revert: () => toggleStar(card.id),
      request: () =>
        protectedFetch(`${API_BASE_URL}/flashcards/${card.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isStarred: newValue }),
        }),
    });
  }, [activeCards, currentIndex, toggleStar, patch]);

  const isComplete = currentIndex >= activeCards.length;

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
    if (isComplete && activeCards.length > 0) {
      hapticComplete();
      soundComplete();
      flush();
    }
  }, [isComplete, activeCards.length, flush]);

  useEffect(() => {
    if (!isComplete || activeCards.length === 0) {
      gameFade.value = 1;
      finishFade.value = 0;
      return;
    }

    if (reducedMotion) {
      gameFade.value = 0;
      finishFade.value = 1;
      return;
    }

    gameFade.value = withDelay(
      FINISH_HOLD_MS,
      withTiming(0, { duration: FINISH_OUTRO_MS, easing: EASE_STANDARD }),
    );
    finishFade.value = withDelay(
      FINISH_HOLD_MS,
      withTiming(1, {
        duration: FINISH_OUTRO_MS + FINISH_INTRO_MS,
        easing: EASE_STANDARD,
      }),
    );

    const timer = setTimeout(
      () => setOutroDone(true),
      FINISH_HOLD_MS + FINISH_OUTRO_MS,
    );
    return () => clearTimeout(timer);
  }, [isComplete, activeCards.length, reducedMotion, gameFade, finishFade]);

  useEffect(() => {
    const timer = setInterval(() => flush(), 10000);
    return () => clearInterval(timer);
  }, [flush]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") flush();
    });
    return () => subscription.remove();
  }, [flush]);

  return (
    <PortalProvider>
      <YStack f={1} bg="$background">
        {phase !== "finish" && (
          <Animated.View style={[styles.layer, gameLayerStyle]}>
            <BackgroundMesh preset="auth" animated />

            <ScreenHeaderFlashcards
              known={knownPiles.length}
              learning={stillLearningPiles.length}
              litSide={litSide}
              showPiles={settings.sortByPiles}
              position={Math.min(currentIndex + 1, activeCards.length)}
              deckSize={activeCards.length}
              rightAction={
                <IconButton
                  icon={
                    <Settings2
                      size={22}
                      color={ICON_ON_GLASS}
                      strokeWidth={1.9}
                    />
                  }
                  variant="liquidGlass"
                  onPress={() => setSettingsSheetOpen(true)}
                />
              }
            />

            {flushing && !isComplete && (
              <SyncingPill
                pos="absolute"
                top={screen.top + 84}
                right={19}
                zIndex={10}
              />
            )}

            <YStack f={1} px={18} pt={20} pb={20} ai="center" jc="center">
              {!isComplete && (
                <YStack width="100%" f={1} maxHeight={730}>
                  <FlashcardLg
                    card={activeCards[currentIndex]}
                    revertDirection={lastSwipeDirection}
                    showDefinitionFirst={
                      settings.cardOrientation === "definition_first"
                    }
                    showStamps={settings.sortByPiles}
                    onStar={handleToggleStar}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onDecisionChange={setDecision}
                    revertKey={revertCount}
                  />
                </YStack>
              )}
            </YStack>

            <YStack
              alignItems="center"
              pt={8}
              pb={screen.insets.bottom + 16}
              zIndex={3}
            >
              <IconButton
                icon={
                  <RotateCcw
                    size={22}
                    color={currentIndex === 0 ? ICON_MUTED : ICON_ON_GLASS}
                    strokeWidth={1.9}
                    opacity={currentIndex === 0 ? 0.45 : 0.85}
                  />
                }
                variant="liquidGlass"
                size={55}
                disabled={currentIndex === 0}
                onPress={handleRevert}
              />
            </YStack>
          </Animated.View>
        )}

        {phase !== "game" && (
          <Animated.View
            style={[StyleSheet.absoluteFill, finishLayerStyle]}
            pointerEvents={phase === "finish" ? "auto" : "none"}
          >
            <FlashcardsComplete
              onClose={() => {
                restart(true);
                router.back();
              }}
              total={activeCards.length}
              known={knownPiles.length}
              stillLearning={stillLearningPiles.length}
              heroVariant="ring"
              // heroVariant="duo"
              // heroVariant="orbit"
            />
          </Animated.View>
        )}

        <FlashcardsSettingsSheet
          open={settingsSheetOpen}
          onOpenChange={setSettingsSheetOpen}
        />

        <AppToast
          open={!!toast}
          message={toast ?? ""}
          onDismiss={() => setToast(null)}
        />
      </YStack>
    </PortalProvider>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1 },
});

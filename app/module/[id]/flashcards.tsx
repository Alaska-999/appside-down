import { API_BASE_URL } from "@/src/api/config";
import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { FlashcardLg } from "@/src/components/flashcards/Flashcard-lg";
import { FlashcardsComplete } from "@/src/components/flashcards/FlashcardsComplete";
import { FlashcardsSettingsSheet } from "@/src/components/flashcards/FlashcardsSettingsSheet";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { AuroraGlow } from "@/src/components/ui/AuroraGlow";
import { IconButton } from "@/src/components/ui/IconButton";
import { useGameStore } from "@/src/store/useGameStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { hapticComplete, hapticSwipe } from "@/src/utils/haptics";
import { soundComplete } from "@/src/utils/sounds";
import { Check, RotateCcw, Settings2, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { PortalProvider, Text, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

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
  const router = useRouter();

  const [revertCount, setRevertCount] = useState(0);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<
    "left" | "right"
  >("right");

  const handleSwipeRight = useCallback(() => {
    setLastSwipeDirection("right");
    hapticSwipe();
    const card = activeCards[currentIndex];
    if (card) {
      addEvent({
        flashcardId: card.id,
        moduleId: card.moduleId,
        status: "KNOWN",
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
        status: "STILL_LEARNING",
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
    toggleStar(card.id);
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/flashcards/${card.id}`,
        { method: "PATCH", body: JSON.stringify({ isStarred: newValue }) },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[FlashcardsGame] star error:", err);
      toggleStar(card.id);
    }
  }, [activeCards, currentIndex, toggleStar]);

  const isComplete = currentIndex >= activeCards.length;

  useEffect(() => {
    if (isComplete && activeCards.length > 0) {
      hapticComplete();
      soundComplete();
      flush();
    }
  }, [isComplete, activeCards.length, flush]);

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
        <AuroraGlow mintOpacity={0.11} limeOpacity={0.09} />
        <ScreenHeaderFlashcards
          rightAction={
            <IconButton
              icon={<Settings2 size="$1.5" color="$color" />}
              variant="liquidGlass"
              onPress={() => {
                setSettingsSheetOpen(true);
              }}
            />
          }
          total={activeCards.length.toString()}
          progress={currentIndex.toString()}
          onClose={
            isComplete
              ? () => {
                  restart(true);
                  router.back();
                }
              : undefined
          }
        />

        <FlashcardsSettingsSheet
          open={settingsSheetOpen}
          onOpenChange={setSettingsSheetOpen}
        />

        {isComplete ? (
          <FlashcardsComplete
            total={activeCards.length}
            known={knownPiles.length}
            stillLearning={stillLearningPiles.length}
          />
        ) : (
          <YStack f={1} mt={12 * MOCKUP_SCALE} overflow="hidden">
            {settings.sortByPiles && (
              <XStack justifyContent="space-between" px="$5" mt="$3">
                <StatusPill
                  icon={<X size={13 * MOCKUP_SCALE} color="#EF4444" />}
                  text={stillLearningPiles.length.toString()}
                  variant="danger"
                />
                <StatusPill
                  icon={<Check size={13 * MOCKUP_SCALE} color="#10B981" />}
                  text={knownPiles.length.toString()}
                  variant="success"
                />
              </XStack>
            )}

            <FlashcardLg
              card={activeCards[currentIndex]}
              revertDirection={lastSwipeDirection}
              showDefinitionFirst={
                settings.cardOrientation === "definition_first"
              }
              onStar={handleToggleStar}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              revertKey={revertCount}
            />

            <YStack alignItems="center" mb="$5" gap={8 * MOCKUP_SCALE}>
              <Text fontSize={10 * MOCKUP_SCALE} color="$colorMuted" textAlign="center">
                ← still learning · know it →
              </Text>
              <IconButton
                icon={<RotateCcw size="$1.5" color="$colorSecondary" />}
                variant="glass"
                size={40 * MOCKUP_SCALE}
                disabled={currentIndex === 0}
                opacity={currentIndex === 0 ? 0.3 : 1}
                onPress={handleRevert}
              />
            </YStack>
          </YStack>
        )}
      </YStack>
    </PortalProvider>
  );
}

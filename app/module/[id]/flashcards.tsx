import { API_BASE_URL } from "@/src/api/config";
import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { FlashcardLg } from "@/src/components/flashcards/Flashcard-lg";
import { FlashcardsComplete } from "@/src/components/flashcards/FlashcardsComplete";
import { FlashcardsSettingsSheet } from "@/src/components/flashcards/FlashcardsSettingsSheet";
import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { SyncingPill } from "@/src/components/ui/SyncingPill";
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
import { AppState } from "react-native";
import { PortalProvider, YStack } from "tamagui";

export default function FlashcardsGame() {
  const currentModule = useGameStore((state) => state.currentModule);
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
        {!isComplete && <BackgroundMesh preset="flash" animated />}

        {!isComplete && (
          <ScreenHeaderFlashcards
            title={currentModule?.name ?? ""}
            known={knownPiles.length}
            learning={stillLearningPiles.length}
            litSide={litSide}
            rightAction={
              <IconButton
                icon={<Settings2 size={22} color="#EAF7FF" strokeWidth={1.9} />}
                variant="liquidGlass"
                onPress={() => setSettingsSheetOpen(true)}
              />
            }
          />
        )}

        <FlashcardsSettingsSheet
          open={settingsSheetOpen}
          onOpenChange={setSettingsSheetOpen}
        />

        {flushing && !isComplete && (
          <SyncingPill
            pos="absolute"
            top={screen.top + 84}
            right={19}
            zIndex={10}
          />
        )}

        {isComplete ? (
          <FlashcardsComplete
            onClose={() => {
              restart(true);
              router.back();
            }}
            total={activeCards.length}
            known={knownPiles.length}
            stillLearning={stillLearningPiles.length}
          />
        ) : (
          <YStack f={1} px={18} pt={20} pb={20} ai="center" jc="center">
            <YStack width="100%" f={1} maxHeight={730}>
              <FlashcardLg
                card={activeCards[currentIndex]}
                revertDirection={lastSwipeDirection}
                showDefinitionFirst={
                  settings.cardOrientation === "definition_first"
                }
                onStar={handleToggleStar}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onDecisionChange={setDecision}
                revertKey={revertCount}
              />
            </YStack>
          </YStack>
        )}

        {!isComplete && (
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
                  color={currentIndex === 0 ? "#2E3A44" : "#EAF7FF"}
                  strokeWidth={2}
                />
              }
              variant="liquidGlass"
              size={52}
              disabled={currentIndex === 0}
              onPress={handleRevert}
            />
          </YStack>
        )}
      </YStack>
    </PortalProvider>
  );
}

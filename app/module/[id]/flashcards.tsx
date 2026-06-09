import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { FlashcardLg } from "@/src/components/flashcards/Flashcard-lg";
import { FlashcardsSettingsSheet } from "@/src/components/flashcards/FlashcardsSettingsSheet";
import { useGameStore } from "@/src/store/useGameStore";
import { Check, RotateCcw, Settings2, X } from "@tamagui/lucide-icons";
import { useCallback, useState } from "react";
import { Button, PortalProvider, Text, XStack, YStack } from "tamagui";

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

  const [revertCount, setRevertCount] = useState(0);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<
    "left" | "right"
  >("right");

  const handleSwipeRight = useCallback(() => {
    setLastSwipeDirection("right");
    swipeRight();
  }, [swipeRight]);

  const handleSwipeLeft = useCallback(() => {
    setLastSwipeDirection("left");
    swipeLeft();
  }, [swipeLeft]);

  const handleRevert = useCallback(() => {
    if (currentIndex <= 0) return;

    revertSwipe();
    setRevertCount((c) => c + 1);
  }, [currentIndex, revertSwipe]);

  return (
    <PortalProvider>
      <YStack f={1} bg="$background">
        <ScreenHeaderFlashcards
          rightAction={
            <Button
              icon={<Settings2 size="$1.5" color="$color" />}
              circular
              onPress={() => setSettingsSheetOpen(true)}
              ml="$-3"
            />
          }
          total={activeCards.length.toString()}
          progress={currentIndex.toString()}
        />

        <FlashcardsSettingsSheet
          open={settingsSheetOpen}
          onOpenChange={setSettingsSheetOpen}
        />

        <YStack f={1} mt={20} overflow="hidden">
          {settings.sortByPiles && (
            <XStack
              justifyContent="space-between"
              px="$5"
              alignItems="flex-start"
            >
              <YStack alignItems="center" gap={4}>
                <XStack
                  bg="$statusDanger"
                  br={20}
                  px="$3"
                  py="$2"
                  alignItems="center"
                  gap="$1"
                >
                  <Text color="white" fontWeight="700" fontSize="$4">
                    {stillLearningPiles.length}
                  </Text>
                  <X size="$1" color="white" />
                </XStack>
                <Text fontSize="$1" color="$colorMuted">
                  Learning
                </Text>
              </YStack>
              <YStack alignItems="center" gap={4}>
                <XStack
                  bg="$statusSuccess"
                  br={20}
                  px="$3"
                  py="$2"
                  alignItems="center"
                  gap="$1"
                >
                  <Check size="$1" color="white" />
                  <Text color="white" fontWeight="700" fontSize="$4">
                    {knownPiles.length}
                  </Text>
                </XStack>
                <Text fontSize="$1" color="$colorMuted">
                  Known
                </Text>
              </YStack>
            </XStack>
          )}

          <FlashcardLg
            card={activeCards[currentIndex]}
            revertDirection={lastSwipeDirection}
            showDefinitionFirst={settings.cardOrientation === "definition_first"}
            onTts={() => {}}
            onStar={() => {}}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            revertKey={revertCount}
          />

          <XStack justifyContent="center" alignItems="center" mb="$5">
            <Button
              icon={<RotateCcw size="$1.5" color="$color" />}
              circular
              size="$3"
              bg="transparent"
              disabled={currentIndex === 0}
              opacity={currentIndex === 0 ? 0.3 : 1}
              onPress={handleRevert}
            />
          </XStack>
        </YStack>
      </YStack>
    </PortalProvider>
  );
}

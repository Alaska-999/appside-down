import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { FlashcardLg } from "@/src/components/flashcards/Flashcard-lg";
import { useGameStore } from "@/src/store/useGameStore";
import { Play, RotateCcw } from "@tamagui/lucide-icons";
import { Button, Text, XStack, YStack } from "tamagui";

export default function FlashcardsGame() {
  const currentModule = useGameStore((state) => state.currentModule);
  const activeCards = useGameStore((state) => state.activeCards);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const knownPiles = useGameStore((state) => state.knownPiles);
  const stillLearningPiles = useGameStore((state) => state.stillLearningPiles);

  const swipeRight = useGameStore((state) => state.swipeRight);
  const swipeLeft = useGameStore((state) => state.swipeLeft);
const revertSwipe = useGameStore((state) => state.revertSwipe);

  return (
    <YStack f={1} bg="$background">
      <ScreenHeaderFlashcards
        onRight={() => {}}
        total={activeCards.length.toString()}
        progress={currentIndex.toString()}
      />

      <YStack f={1} mt={20} overflow="hidden">
        <XStack justifyContent="space-between" px="$5" alignItems="center">
          <XStack
            w={40}
            h={40}
            br={22}
            bg="$statusSuccess"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontWeight="700">
              {knownPiles.length}
            </Text>
          </XStack>
          <XStack
            w={40}
            h={40}
            br={22}
            bg="$statusDanger"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontWeight="700">
              {stillLearningPiles.length}
            </Text>
          </XStack>
        </XStack>
        <FlashcardLg
          card={activeCards[currentIndex]}
          onTts={() => {}}
          onStar={() => {}}
        />

        <XStack
          justifyContent="space-between"
          px="$5"
          alignItems="center"
          mb="$5"
        >
          <Button
            icon={<RotateCcw size="$1.5" color="$color" />}
            circular
            size="$3"
            bg="transparent"
            disabled={currentIndex === 0}
            opacity={currentIndex === 0 ? 0.3 : 1}
            onPress={revertSwipe}
          />
          <Button
            icon={<Play size="$1.5" color="$color" />}
            circular
            size="$3"
            bg="transparent"
          />
        </XStack>
      </YStack>
    </YStack>
  );
}

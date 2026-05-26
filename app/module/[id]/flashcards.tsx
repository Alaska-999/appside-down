import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { YStack } from "tamagui";

export default function FlashcardsGame() {
  return (
    <YStack f={1} bg="$background">
      <ScreenHeaderFlashcards onRight={() => {}} />
    </YStack>
  );
}

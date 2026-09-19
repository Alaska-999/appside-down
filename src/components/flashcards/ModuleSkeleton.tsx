import {
  DECK_CARD_RADIUS,
  useDeckMetrics,
} from "@/src/components/flashcards/ModuleDeck";
import { Skeleton } from "@/src/components/ui/feedback/Skeleton";
import { XStack, YStack } from "tamagui";

export function ModuleSkeleton() {
  const deck = useDeckMetrics();

  return (
    <YStack gap={22}>
      <YStack ai="center">
        <Skeleton
          width={deck.cardWidth}
          height={deck.cardHeight}
          borderRadius={DECK_CARD_RADIUS}
        />
      </YStack>
      <YStack px="$screenX" gap={12}>
        <Skeleton height={31} width="72%" borderRadius={8} />
        <Skeleton height={17} width="90%" borderRadius={6} />
        <Skeleton height={8} borderRadius={999} />
        <XStack gap={9}>
          <Skeleton height={62} f={1} borderRadius="$control" />
          <Skeleton height={62} f={1} borderRadius="$control" />
          <Skeleton height={62} f={1} borderRadius="$control" />
        </XStack>
      </YStack>
    </YStack>
  );
}

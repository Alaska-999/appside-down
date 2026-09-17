import { Skeleton } from "@/src/components/ui/Skeleton";
import { XStack, YStack } from "tamagui";

export function ModuleSkeleton() {
  return (
    <YStack gap={22}>
      <YStack ai="center">
        <Skeleton width={294} height={182} borderRadius={24} />
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

import { ReactNode } from "react";
import { YStack } from "tamagui";

export function ScreenBackground({ children }: { children: ReactNode }) {
  return (
    <YStack f={1} bg="$background">
      <YStack f={1} w="100%" maxWidth={560} als="center">
        {children}
      </YStack>
    </YStack>
  );
}

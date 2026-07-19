import { ReactNode } from "react";
import { YStack } from "tamagui";

// затверджений мокап (home-bento-v7) використовує рівний однотонний фон,
// без плям/blur — попередні спроби "оживити" фон кольоровими плямами під
// BlurView давали хаос і рендер-баги, тому свідомо лишили просто $background
export function ScreenBackground({ children }: { children: ReactNode }) {
  return (
    <YStack f={1} bg="$background">
      {children}
    </YStack>
  );
}

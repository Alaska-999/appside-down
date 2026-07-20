import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { ReactNode } from "react";
import { Sheet, Text, YStack } from "tamagui";

interface GlassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  snapPoints?: number[];
  children: ReactNode;
}

export function GlassSheet({
  open,
  onOpenChange,
  title,
  snapPoints = [40],
  children,
}: GlassSheetProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay bg="$pureBlack" opacity={0.25} />

      <Sheet.Frame
        bg="transparent"
        btlr={35}
        btrr={35}
        pt={14}
        px={24}
        pb={32}
        overflow="hidden"
        pos="relative"
      >
        <LiquidGlass
          intensity={65}
          borderRadius={35}
          borderWidth={1}
          borderColor="rgba(220, 255, 245, 0.15)"
          backgroundColor="rgba(19, 21, 32, 0.45)"
        />

        <Sheet.Handle
          bg="rgba(220, 255, 245, 0.35)"
          w={54}
          h={5}
          br={4}
          mb={18}
          alignSelf="center"
        />

        <Text
          color="$color"
          fontSize={24}
          fontWeight="800"
          mb={19}
          pos="relative"
          zIndex={1}
        >
          {title}
        </Text>

        <YStack f={1} pos="relative" zIndex={1}>
          {children}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

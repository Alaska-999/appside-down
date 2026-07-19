import { X } from "@tamagui/lucide-icons";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Sheet, Text, XStack } from "tamagui";

interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  snapPoints?: number[];
  children: ReactNode;
  plain?: boolean;
}

export function AppSheet({
  open,
  onOpenChange,
  title,
  snapPoints = [90],
  children,
  plain = false,
}: AppSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={snapPoints} dismissOnSnapToBottom>
      <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
      <Sheet.Handle bg="$glassBorder" w={49} h={5} br={3} />
      <Sheet.Frame
        bg="$sheetBg"
        borderTopWidth={1}
        borderColor="$glassBorder"
        btlr={30}
        btrr={30}
        pb={insets.bottom}
      >
        {plain ? (
          title && (
            <Text px="$4" pt="$2" pb="$3" fontSize="$6" fontWeight="700" color="$color">
              {title}
            </Text>
          )
        ) : (
          <XStack
            px="$4"
            pt="$3"
            pb="$3"
            ai="center"
            jc="space-between"
            borderBottomWidth={1}
            borderColor="$glassBorder"
          >
            <Pressable hitSlop={8} onPress={() => onOpenChange(false)}>
              <X size={20} color="$colorMuted" />
            </Pressable>
            {title && (
              <Text fontSize="$6" fontWeight="700" color="$color">
                {title}
              </Text>
            )}
            <Button size="$3" chromeless disabled opacity={0}>
              <X size={20} />
            </Button>
          </XStack>
        )}
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}

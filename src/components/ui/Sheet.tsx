import { X } from "@tamagui/lucide-icons";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { Button, Sheet, Text, XStack } from "tamagui";

interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  snapPoints?: number[];
  children: ReactNode;
}

export function AppSheet({
  open,
  onOpenChange,
  title,
  snapPoints = [90],
  children,
}: AppSheetProps) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={snapPoints} dismissOnSnapToBottom>
      <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
      <Sheet.Handle />
      <Sheet.Frame bg="$glassBg" borderTopWidth={1} borderColor="$glassBorder">
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
            <Text fontSize="$5" fontWeight="bold" color="$color">
              {title}
            </Text>
          )}
          <Button size="$3" chromeless disabled opacity={0}>
            <X size={20} />
          </Button>
        </XStack>
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}

import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { X } from "@tamagui/lucide-icons";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Sheet, Text, XStack } from "tamagui";

type SheetVariant = "solid" | "glass";

interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  snapPoints?: number[];
  children: ReactNode;
  plain?: boolean;
  variant?: SheetVariant;
}

const VARIANT_STYLES: Record<
  SheetVariant,
  { overlayOpacity: number; cornerRadius: number; handleColor: string }
> = {
  solid: { overlayOpacity: 0.5, cornerRadius: 30, handleColor: "$glassBorder" },
  glass: { overlayOpacity: 0.25, cornerRadius: 35, handleColor: "rgba(220,255,245,0.35)" },
};

export function AppSheet({
  open,
  onOpenChange,
  title,
  snapPoints = [90],
  children,
  plain = false,
  variant = "solid",
}: AppSheetProps) {
  const insets = useSafeAreaInsets();
  const { overlayOpacity, cornerRadius, handleColor } = VARIANT_STYLES[variant];

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={snapPoints} dismissOnSnapToBottom>
      <Sheet.Overlay bg="$pureBlack" opacity={overlayOpacity} />
      <Sheet.Handle bg={handleColor} w={49} h={5} br={3} />
      <Sheet.Frame
        bg={variant === "glass" ? "transparent" : "$sheetBg"}
        borderTopWidth={variant === "glass" ? 0 : 1}
        borderColor="$glassBorder"
        btlr={cornerRadius}
        btrr={cornerRadius}
        pb={insets.bottom}
        overflow="hidden"
        pos="relative"
      >
        {variant === "glass" && (
          <LiquidGlass
            intensity={65}
            borderWidth={1}
            borderColor="rgba(220, 255, 245, 0.15)"
            backgroundColor="rgba(19, 21, 32, 0.45)"
          />
        )}
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

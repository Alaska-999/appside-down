import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { ChevronRight } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { Sheet, Text, XStack, YStack } from "tamagui";

export interface GlassActionSheetAction {
  key: string;
  label: string;
  description: string;
  icon: ReactNode;
  gradient: [string, string];
  onPress: () => void;
}

interface GlassActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  actions: GlassActionSheetAction[];
}

export function GlassActionSheet({
  open,
  onOpenChange,
  title,
  actions,
}: GlassActionSheetProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[40]}
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

        <YStack gap={14} pos="relative" zIndex={1}>
          {actions.map((action) => (
            <Pressable key={action.key} onPress={action.onPress}>
              <XStack
                ai="center"
                gap={16}
                bg="$glassBgSubtle"
                borderWidth={1}
                borderColor="rgba(220,255,245,0.08)"
                br={22}
                px={19}
                py={16}
              >
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 57,
                    height: 57,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {action.icon}
                </LinearGradient>
                <YStack f={1} gap={2}>
                  <Text color="$color" fontSize={20} fontWeight="700">
                    {action.label}
                  </Text>
                  <Text color="$colorMuted" fontSize={15.5}>
                    {action.description}
                  </Text>
                </YStack>
                <ChevronRight size={20} color="$colorMuted" opacity={0.5} />
              </XStack>
            </Pressable>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

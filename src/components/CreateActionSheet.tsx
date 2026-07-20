import { ChevronRight, FilePlus, Folder } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Sheet, Text, XStack, YStack, useTheme } from "tamagui";

export function CreateActionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const theme = useTheme();

  const handleNavigate = (path: Href) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[40]}
      dismissOnSnapToBottom
    >
      {/* 1. Послабили оверлей, щоб контент ззаду не ставав занадто темним */}
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
        <BlurView
          // 2. Збільшили інтенсивність розмиття — це дає глибокий ефект матового скла
          intensity={65}
          tint="dark"
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 35,
            borderWidth: 1,
            // 3. Зробили тонкий неоновий бордер, що пасує до твоїх кнопок
            borderColor: "rgba(220, 255, 245, 0.15)",
            // 4. Замість темної заливки — глибокий колір твого інтерфейсу з мінімальною непрозорістю
            backgroundColor: "rgba(19, 21, 32, 0.45)",
          }}
        />

        <Sheet.Handle
          // 5. Зробили хендл трохи яскравішим у тон апки
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
          Create New
        </Text>

        <YStack gap={14} pos="relative" zIndex={1}>
          <Pressable onPress={() => handleNavigate("/folder/create")}>
            <XStack
              ai="center"
              gap={16}
              bg="rgba(220,255,245,0.04)"
              borderWidth={1}
              borderColor="rgba(220,255,245,0.08)"
              br={22}
              px={19}
              py={16}
            >
              <LinearGradient
                colors={["#2dd4bf", "#a3e635"]}
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
                <Folder size={26} color="white" />
              </LinearGradient>
              <YStack f={1} gap={2}>
                <Text color="$color" fontSize={20} fontWeight="700">
                  Folder
                </Text>
                <Text color="$colorMuted" fontSize={15.5}>
                  Group modules together
                </Text>
              </YStack>
              <ChevronRight size={20} color="$colorMuted" opacity={0.5} />
            </XStack>
          </Pressable>

          <Pressable onPress={() => handleNavigate("/module/create")}>
            <XStack
              ai="center"
              gap={16}
              bg="rgba(220,255,245,0.04)"
              borderWidth={1}
              borderColor="rgba(220,255,245,0.08)"
              br={22}
              px={19}
              py={16}
            >
              <LinearGradient
                colors={["#4338ca", "#65a30d"]}
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
                <FilePlus size={26} color="white" />
              </LinearGradient>
              <YStack f={1} gap={2}>
                <Text color="$color" fontSize={20} fontWeight="700">
                  Module
                </Text>
                <Text color="$colorMuted" fontSize={15.5}>
                  A new set of flashcards
                </Text>
              </YStack>
              <ChevronRight size={20} color="$colorMuted" opacity={0.5} />
            </XStack>
          </Pressable>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

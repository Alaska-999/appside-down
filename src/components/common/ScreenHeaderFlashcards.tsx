import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { IconButton } from "@/src/components/ui/IconButton";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

export function ScreenHeaderFlashcards({
  title,
  rightAction,
  known,
  learning,
  litSide,
  showPiles = true,
  onClose,
}: {
  title: string;
  rightAction?: React.ReactNode;
  known: number;
  learning: number;
  litSide?: "known" | "learning" | null;
  showPiles?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const screen = useScreenInsets();

  return (
    <XStack ai="center" gap={12} px="$4" pt={screen.top + 6} pb={8}>
      <IconButton
        icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
        variant="liquidGlass"
        onPress={() => (onClose ? onClose() : router.back())}
      />
      <YStack f={1} ai="center" gap={7}>
        <Text
          fontFamily="$heading"
          fontSize={15}
          fontWeight="700"
          letterSpacing={0.02}
          color="$color"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {showPiles && (
          <XStack ai="center" gap={12}>
            <StatusPill
              kind="game"
              tone="learning"
              count={learning}
              lit={litSide === "learning"}
              dim={litSide === "known"}
            />
            <StatusPill
              kind="game"
              tone="known"
              count={known}
              lit={litSide === "known"}
              dim={litSide === "learning"}
            />
          </XStack>
        )}
      </YStack>
      {rightAction}
    </XStack>
  );
}

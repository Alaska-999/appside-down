import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { ProgressSplitBar } from "@/src/components/ui/feedback/ProgressSplitBar";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { TEXT_MINT_META } from "@/src/constants/surfaceAlpha";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

const DECK_ROW_GAP = 10;
const DECK_TEXT_SIZE = 12;
const DECK_LETTER_SPACING = 0.3;
const MAX_FONT_SCALE = 1.2;

export function ScreenHeaderFlashcards({
  rightAction,
  known,
  learning,
  litSide,
  showPiles = true,
  position,
  deckSize = 0,
  onClose,
}: {
  rightAction?: React.ReactNode;
  known: number;
  learning: number;
  litSide?: "known" | "learning" | null;
  showPiles?: boolean;
  position?: number;
  deckSize?: number;
  onClose?: () => void;
}) {
  const router = useRouter();
  const screen = useScreenInsets();

  const showDeck = deckSize > 0 && position !== undefined;

  return (
    <YStack px="$4" pt={screen.top + 6} pb={8} gap={DECK_ROW_GAP}>
      {showDeck && (
        <XStack ai="center" gap={DECK_ROW_GAP} mb={8}>
          <YStack f={1}>
            <ProgressSplitBar
              size="sm"
              variant="plain"
              mastered={known}
              learning={learning}
              total={deckSize}
            />
          </YStack>
          <Text
            fontSize={DECK_TEXT_SIZE}
            fontWeight="700"
            letterSpacing={DECK_LETTER_SPACING}
            color={TEXT_MINT_META}
            fontVariant={["tabular-nums"]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            accessibilityLabel={`Card ${position} of ${deckSize}`}
          >
            {position}/{deckSize}
          </Text>
        </XStack>
      )}
      <XStack ai="center" gap={12}>
        <IconButton
          icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
          variant="liquidGlass"
          onPress={() => (onClose ? onClose() : router.back())}
        />
        <YStack f={1} ai="center">
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
    </YStack>
  );
}

import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { Toggle } from "@/src/components/common/Toggle";
import { useGameStore } from "@/src/store/useGameStore";
import { Button, Sheet, Text, XStack, YStack } from "tamagui";

interface FlashcardsSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlashcardsSettingsSheet({
  open,
  onOpenChange,
}: FlashcardsSettingsSheetProps) {
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const restart = useGameStore((state) => state.restart);

  const handleRestart = () => {
    restart(false);
    onOpenChange(false);
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[65]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
      <Sheet.Handle />
      <Sheet.Frame p="$4" bg="$background" gap="$4">
        <Text fontSize="$6" fontWeight="bold">
          Settings
        </Text>

        <YStack gap="$2">
          <XStack bg="$buttonSecondaryBg" br="$4" px="$4" py="$3" ai="center">
            <Text f={1} fontSize="$5" color="$color">
              Shuffle cards
            </Text>
            <Toggle
              value={settings.shuffle}
              onToggle={() => updateSettings({ shuffle: !settings.shuffle })}
            />
          </XStack>
          <XStack bg="$buttonSecondaryBg" br="$4" px="$4" py="$3" ai="center">
            <Text f={1} fontSize="$5" color="$color">
              Text to speech
            </Text>
            <Toggle
              value={settings.ttsEnabled}
              onToggle={() =>
                updateSettings({ ttsEnabled: !settings.ttsEnabled })
              }
            />
          </XStack>
          <XStack bg="$buttonSecondaryBg" br="$4" px="$4" py="$3" ai="center">
            <Text f={1} fontSize="$5" color="$color">
              Sort into piles
            </Text>
            <Toggle
              value={settings.sortByPiles}
              onToggle={() =>
                updateSettings({ sortByPiles: !settings.sortByPiles })
              }
            />
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$3" color="$colorMuted" px="$1">
            Card orientation
          </Text>
          <SegmentedControl
            options={["Term", "Definition"]}
            selected={settings.cardOrientation === "term_first" ? 0 : 1}
            onChange={(i) =>
              updateSettings({
                cardOrientation: i === 0 ? "term_first" : "definition_first",
              })
            }
          />
        </YStack>

        <Button
          size="$5"
          bg="$buttonSecondaryBg"
          br="$4"
          onPress={handleRestart}
        >
          <Text f={1} fontSize="$5" color="$statusDanger">
            Restart game
          </Text>
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
}

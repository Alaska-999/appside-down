import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { Toggle } from "@/src/components/common/Toggle";
import { AppButton } from "@/src/components/ui/Button";
import { AppSheet } from "@/src/components/ui/Sheet";
import { useGameStore } from "@/src/store/useGameStore";
import { RotateCcw } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

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
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Settings"
    >
      <YStack gap="$4">
        <YStack gap="$2">
          <XStack
            bg="$glassBg"
            borderWidth={1}
            borderColor="$glassBorder"
            br={16}
            height={59}
            px="$4"
            ai="center"
          >
            <Text f={1} color="$color" fontWeight="600">
              Shuffle cards
            </Text>
            <Toggle
              value={settings.shuffle}
              onToggle={() => updateSettings({ shuffle: !settings.shuffle })}
            />
          </XStack>
          <XStack
            bg="$glassBg"
            borderWidth={1}
            borderColor="$glassBorder"
            br={16}
            height={59}
            px="$4"
            ai="center"
          >
            <Text f={1} color="$color" fontWeight="600">
              Text to speech
            </Text>
            <Toggle
              value={settings.ttsEnabled}
              onToggle={() =>
                updateSettings({ ttsEnabled: !settings.ttsEnabled })
              }
            />
          </XStack>
          <XStack
            bg="$glassBg"
            borderWidth={1}
            borderColor="$glassBorder"
            br={16}
            height={59}
            px="$4"
            ai="center"
          >
            <Text f={1} color="$color" fontWeight="600">
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
          <Text
            fontSize="$3"
            color="$colorMuted"
            fontWeight="600"
            tt="uppercase"
            px="$1"
          >
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

        <AppButton
          variant="secondary"
          icon={<RotateCcw size={18} color="$statusDanger" />}
          onPress={handleRestart}
        >
          <Text color="$statusDanger" fontWeight="600">
            Restart game
          </Text>
        </AppButton>
      </YStack>
    </AppSheet>
  );
}

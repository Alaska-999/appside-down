import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { AppButton } from "@/src/components/ui/Button";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Toggle } from "@/src/components/ui/Toggle";
import { ICON_DANGER } from "@/src/constants/iconColors";
import { useGameStore } from "@/src/store/useGameStore";
import { Layers, RotateCcw, Shuffle, Volume2 } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

interface FlashcardsSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SoonBadge() {
  return (
    <XStack
      br={999}
      px={8}
      py={3}
      borderWidth={1}
      borderColor="rgba(220,255,245,0.18)"
    >
      <Text
        fontSize={9.5}
        fontWeight="800"
        letterSpacing={0.76}
        tt="uppercase"
        color="$colorMuted"
      >
        soon
      </Text>
    </XStack>
  );
}

export function FlashcardsSettingsSheet({
  open,
  onOpenChange,
}: FlashcardsSettingsSheetProps) {
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const restart = useGameStore((state) => state.restart);

  const toggleShuffle = () => updateSettings({ shuffle: !settings.shuffle });
  const togglePiles = () =>
    updateSettings({ sortByPiles: !settings.sortByPiles });

  const handleRestart = () => {
    restart(false);
    onOpenChange(false);
  };

  return (
    <AppSheet open={open} onOpenChange={onOpenChange} title="Settings">
      <YStack gap={12}>
        <SheetRows>
          <SheetRow
            icon={Shuffle}
            label="Shuffle cards"
            right={
              <Toggle
                size="md"
                value={settings.shuffle}
                onToggle={toggleShuffle}
              />
            }
            onPress={toggleShuffle}
          />
          <SheetRow
            icon={Layers}
            label="Sort into piles"
            right={
              <Toggle
                size="md"
                value={settings.sortByPiles}
                onToggle={togglePiles}
              />
            }
            onPress={togglePiles}
          />
          <SheetRow
            icon={Volume2}
            label="Text to speech"
            disabled
            right={<SoonBadge />}
          />
        </SheetRows>

        <YStack gap={9} mt={2}>
          <Text
            fontSize={10.5}
            fontWeight="800"
            letterSpacing={1.47}
            tt="uppercase"
            color="$mutedDim"
            ml={4}
          >
            Front side
          </Text>
          <SegmentedControl
            options={["Term", "Definition"]}
            selected={settings.cardOrientation === "term_first" ? 0 : 1}
            onChange={(i) =>
              updateSettings({
                cardOrientation: i === 0 ? "term_first" : "definition_first",
              })
            }
            tone="glass"
          />
        </YStack>

        <AppButton
          variant="danger"
          size="md"
          icon={<RotateCcw size={20} color={ICON_DANGER} strokeWidth={2} />}
          onPress={handleRestart}
        >
          Restart game
        </AppButton>
      </YStack>
    </AppSheet>
  );
}

import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { AppButton } from "@/src/components/ui/controls/Button";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/overlays/Sheet";
import { Toggle } from "@/src/components/ui/controls/Toggle";
import { ICON_DANGER } from "@/src/constants/iconColors";
import { BLACK_SCRIM_FAINT } from "@/src/constants/rawColors";
import { useGameStore } from "@/src/store/useGameStore";
import { Layers, RotateCcw, Shuffle, Volume2 } from "lucide-react-native";
import { Text, View, YStack } from "tamagui";
import { SoonBadge } from "@/src/components/ui/display/SoonBadge";

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

        <View bg={BLACK_SCRIM_FAINT} br={"50%"}>
          <AppButton
            variant="danger"
            size="md"
            icon={<RotateCcw size={20} color={ICON_DANGER} strokeWidth={2} />}
            onPress={handleRestart}
          >
            Restart game
          </AppButton>
        </View>
      </YStack>
    </AppSheet>
  );
}

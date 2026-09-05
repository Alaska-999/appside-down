import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { Toggle } from "@/src/components/common/Toggle";
import { AppButton } from "@/src/components/ui/Button";
import { AppSheet } from "@/src/components/ui/Sheet";
import { useGameStore } from "@/src/store/useGameStore";
import { RotateCcw } from "lucide-react-native";
import { ReactNode } from "react";
import { Text, View, XStack, YStack } from "tamagui";

interface FlashcardsSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SettingsRow({
  label,
  disabled,
  right,
}: {
  label: string;
  disabled?: boolean;
  right: ReactNode;
}) {
  return (
    <XStack
      ai="center"
      gap={12}
      height={56}
      px={16}
      opacity={disabled ? 0.45 : 1}
    >
      <Text f={1} fontSize={15} fontWeight="600" color="$color">
        {label}
      </Text>
      {right}
    </XStack>
  );
}

function RowDivider() {
  return (
    <View
      pos="absolute"
      top={0}
      left={16}
      right={0}
      height={1}
      bg="rgba(220,255,245,0.08)"
    />
  );
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

  const handleRestart = () => {
    restart(false);
    onOpenChange(false);
  };

  return (
    <AppSheet open={open} onOpenChange={onOpenChange} title="Settings">
      <YStack gap={12}>
        <YStack
          br={20}
          overflow="hidden"
          bg="rgba(220,255,245,0.05)"
          borderWidth={1}
          borderColor="rgba(220,255,245,0.1)"
        >
          <SettingsRow
            label="Shuffle cards"
            right={
              <Toggle
                size="md"
                value={settings.shuffle}
                onToggle={() => updateSettings({ shuffle: !settings.shuffle })}
              />
            }
          />
          <View pos="relative">
            <RowDivider />
            <SettingsRow
              label="Sort into piles"
              right={
                <Toggle
                  size="md"
                  value={settings.sortByPiles}
                  onToggle={() =>
                    updateSettings({ sortByPiles: !settings.sortByPiles })
                  }
                />
              }
            />
          </View>
          <View pos="relative">
            <RowDivider />
            <SettingsRow
              label="Text to speech"
              disabled
              right={<SoonBadge />}
            />
          </View>
        </YStack>

        <YStack gap={9} mt={2}>
          <Text
            fontSize={10.5}
            fontWeight="800"
            letterSpacing={1.47}
            tt="uppercase"
            color="#5A6B7A"
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
          icon={<RotateCcw size={19} color="#FCA5A5" strokeWidth={1.9} />}
          onPress={handleRestart}
        >
          Restart game
        </AppButton>
      </YStack>
    </AppSheet>
  );
}

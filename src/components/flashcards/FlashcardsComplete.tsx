import { AppButton } from "@/src/components/ui/Button";
import { AuroraGlow } from "@/src/components/ui/AuroraGlow";
import { ProgressRing } from "@/src/components/ui/ProgressRing";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { useGameStore } from "@/src/store/useGameStore";
import { Check, X } from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

interface FlashcardsCompleteProps {
  total: number;
  known: number;
  stillLearning: number;
}

export function FlashcardsComplete({
  total,
  known,
  stillLearning,
}: FlashcardsCompleteProps) {
  const restart = useGameStore((state) => state.restart);
  const insets = useSafeAreaInsets();
  const pct = total > 0 ? known / total : 0;

  return (
    <YStack f={1} pt={insets.top} pb={insets.bottom + 16}>
      <AuroraGlow mintOpacity={0.16} limeOpacity={0.13} />

      <YStack alignItems="center" pt="$5" gap="$1">
        <Text fontSize={20 * MOCKUP_SCALE} fontWeight="800" color="$color">
          Nice run! 🎉
        </Text>
        <Text fontSize="$3" color="$colorMuted">
          You&apos;re getting there
        </Text>
      </YStack>

      <YStack alignItems="center" pt="$5" pb="$4">
        <ProgressRing
          progress={pct}
          size={110 * MOCKUP_SCALE}
          strokeWidth={12}
          label={`${Math.round(pct * 100)}%`}
          labelFontSize={20 * MOCKUP_SCALE}
          caption="known"
          animated
        />
      </YStack>

      <XStack alignItems="center" jc="center" gap="$3">
        <StatusPill
          icon={<Check size={13 * MOCKUP_SCALE} color="#10B981" />}
          text={`${known} known`}
          variant="success"
        />
        <StatusPill
          icon={<X size={13 * MOCKUP_SCALE} color="#EF4444" />}
          text={`${stillLearning} learning`}
          variant="danger"
        />
      </XStack>

      <YStack f={1} />

      <YStack px="$5" gap="$3">
        {stillLearning > 0 && (
          <AppButton variant="primary" onPress={() => restart(true)}>
            Keep reviewing {stillLearning}
          </AppButton>
        )}

        <AppButton variant="secondary" onPress={() => restart()}>
          Restart deck
        </AppButton>
      </YStack>
    </YStack>
  );
}

import { useGameStore } from "@/src/store/useGameStore";
import { Check, RotateCcw, X } from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Button, Text, XStack, YStack } from "tamagui";

interface FlashcardsCompleteProps {
  total: number;
  known: number;
  stillLearning: number;
}

function CircularProgress({ pct }: { pct: number }) {
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * pct;

  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      width={size}
      height={size}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1A1A1B"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
        />
      </Svg>
      <Text fontSize="$9" fontWeight="800" color="$color">
        {Math.round(pct * 100)}%
      </Text>
    </YStack>
  );
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
    <YStack f={1} bg="$background" pt={insets.top} pb={insets.bottom + 16}>
      {/* Header */}
      <YStack px="$5" pt="$5" pb="$4" gap="$1">
        <Text fontSize="$9" fontWeight="700" color="$color" lineHeight={40}>
          Round{"\n"}complete!
        </Text>
        <Text fontSize="$4" color="$colorMuted" pt="$1">
          {known} of {total} cards known
        </Text>
      </YStack>

      {/* Progress ring */}
      <YStack alignItems="center" pt="$4" pb="$5">
        <CircularProgress pct={pct} />
      </YStack>

      {/* Stat pills */}
      <XStack px="$5" gap="$3" justifyContent="center">
        <XStack
          bg="$statusSuccess"
          br={100}
          px="$4"
          py="$2.5"
          alignItems="center"
          gap="$2"
        >
          <Check size="$1" color="white" />
          <Text color="white" fontWeight="700" fontSize="$5">
            {known}
          </Text>
          <Text color="white" fontSize="$3" opacity={0.85}>
            Got it
          </Text>
        </XStack>

        <XStack
          bg="$backgroundHover"
          br={100}
          px="$4"
          py="$2.5"
          alignItems="center"
          gap="$2"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <X size="$1" color="$colorMuted" />
          <Text color="$color" fontWeight="700" fontSize="$5">
            {stillLearning}
          </Text>
          <Text color="$colorMuted" fontSize="$3">
            In progress
          </Text>
        </XStack>
      </XStack>

      <YStack f={1} />

      <YStack px="$5" gap="$3">
        {stillLearning > 0 && (
          <Button
            size="$5"
            br={100}
            bg="$colorSecondary"
            pressStyle={{ opacity: 0.85 }}
            // onPress={() => restart(true)}
          >
            <Text color="white" fontWeight="700" fontSize="$5">
              Practice with questions
            </Text>
          </Button>
        )}

        <Button
          size="$5"
          br={100}
          bg="$backgroundHover"
          pressStyle={{ opacity: 0.85 }}
          onPress={() => restart(true)}
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text color="$color" fontWeight="600" fontSize="$5">
            Repeat missed cards {stillLearning}
          </Text>
        </Button>

        <Button
          size="$5"
          br={100}
          bg="transparent"
          icon={<RotateCcw size="$1" color="$colorMuted" />}
          pressStyle={{ opacity: 0.7 }}
          onPress={() => restart()}
        >
          <Text color="$colorMuted" fontWeight="500" fontSize="$4">
            Start over
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}

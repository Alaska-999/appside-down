import { RotateCcw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Button, Text, XStack, YStack } from "tamagui";

interface FlashcardsCompleteProps {
  total: number;
  known: number;
  stillLearning: number;
}

function CircularProgress({ pct }: { pct: number }) {
  const size = 120;
  const strokeWidth = 10;
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
          stroke="#2D3748"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F6AD55"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
        />
      </Svg>
      <Text fontSize="$7" fontWeight="700" color="$color">
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pct = total > 0 ? known / total : 0;

  return (
    <YStack f={1} bg="$background" pt={insets.top} pb={insets.bottom + 16}>
      <YStack px="$5" pt="$5" pb="$4" gap="$2">
        <Text fontSize="$9" fontWeight="700" color="$color" lineHeight={40}>
          Round complete!{"\n"}See how many{"\n"}you've got down.
        </Text>
      </YStack>

      <XStack height={1} bg="$backgroundCard" mx="$5" />

      <YStack px="$5" pt="$5" gap="$4">
        <Text fontSize="$5" fontWeight="600" color="$color">
          Session results
        </Text>

        <XStack alignItems="center" gap="$6">
          <CircularProgress pct={pct} />

          <YStack gap="$3" f={1}>
            <XStack
              bg="$statusSuccess"
              br={20}
              px="$4"
              py="$2.5"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text color="white" fontWeight="600" fontSize="$4">
                Got it
              </Text>
              <Text color="white" fontWeight="700" fontSize="$5">
                {known}
              </Text>
            </XStack>

            <XStack
              bg="$statusWarning"
              br={20}
              px="$4"
              py="$2.5"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text color="white" fontWeight="600" fontSize="$4">
                In progress
              </Text>
              <Text color="white" fontWeight="700" fontSize="$5">
                {stillLearning}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </YStack>

      {/* Spacer */}
      <YStack f={1} />

      {/* Actions */}
      <YStack px="$5" gap="$3">
        {stillLearning > 0 && (
          <Button
            size="$5"
            br={100}
            bg="$accentColor"
            pressStyle={{ opacity: 0.85 }}
          >
            <Text color="white" fontWeight="700" fontSize="$5">
              Repeat missed cards ({stillLearning})
            </Text>
          </Button>
        )}

        <Button
          size="$5"
          br={100}
          bg="$backgroundCard"
          pressStyle={{ opacity: 0.85 }}
        >
          <Text color="$color" fontWeight="600" fontSize="$5">
            Review all {total} cards
          </Text>
        </Button>

        <Button
          size="$5"
          br={100}
          bg="transparent"
          icon={<RotateCcw size="$1" color="$colorMuted" />}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text color="$colorMuted" fontWeight="500" fontSize="$4">
            Start over
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}

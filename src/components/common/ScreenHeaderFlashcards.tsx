import { IconButton } from "@/src/components/ui/IconButton";
import { X } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Text, View, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 235;
const SEGMENT_HEIGHT = 5 * MOCKUP_SCALE;
const SEGMENT_GAP = 5 * MOCKUP_SCALE;

export function ScreenHeaderFlashcards({
  rightAction,
  progress,
  total,
  onClose,
}: {
  title?: string;
  rightAction?: React.ReactNode;
  progress: string;
  total: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const screen = useScreenInsets();

  const totalCount = Number(total);
  const filledCount = Math.min(totalCount, Math.max(0, Number(progress) + 1));

  return (
    <YStack>
      <XStack
        ai="center"
        p="$4"
        pb={0}
        pt={screen.top}
        justifyContent="space-between"
      >
        <IconButton
          icon={<X size="$1.5" color="$color" />}
          variant="liquidGlass"
          onPress={() => (onClose ? onClose() : router.back())}
        />
        <Text>
          <Text fontSize={17.5} fontWeight="800" color="$color">
            {progress}
          </Text>
          <Text fontSize={17.5} fontWeight="600" color="$colorMuted">
            {" "}
            / {total}
          </Text>
        </Text>
        {rightAction}
      </XStack>
      <XStack mx="$4" mt={10 * MOCKUP_SCALE} gap={SEGMENT_GAP}>
        {Array.from({ length: totalCount }).map((_, index) => {
          const on = index < filledCount;
          return (
            <View
              key={index}
              f={1}
              height={SEGMENT_HEIGHT}
              br={SEGMENT_HEIGHT / 2}
              overflow="hidden"
              bg="rgba(220,255,245,0.1)"
            >
              {on && (
                <LinearGradient
                  colors={["#2DD4BF", "#A3E635"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    borderRadius: SEGMENT_HEIGHT / 2,
                    shadowColor: "#A3E635",
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                />
              )}
            </View>
          );
        })}
      </XStack>
    </YStack>
  );
}

import { IconButton } from "@/src/components/ui/IconButton";
import { X } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;
const BAR_HEIGHT = 4 * MOCKUP_SCALE;

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
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const theme = useTheme();

  const progressPct = Number(total) > 0 ? Number(progress) / Number(total) : 0;
  const barWidth = useSharedValue(progressPct * screenWidth);

  useEffect(() => {
    barWidth.value = withTiming(progressPct * screenWidth, { duration: 300 });
  }, [progressPct, screenWidth]);

  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));

  return (
    <YStack>
      <XStack
        ai="center"
        p="$4"
        pb={0}
        pt={insets.top}
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
      <XStack
        mx="$4"
        mt={10 * MOCKUP_SCALE}
        bg="rgba(220,255,245,0.1)"
        height={BAR_HEIGHT}
        br={999}
        overflow="hidden"
      >
        <Animated.View style={[{ height: "100%" }, barStyle]}>
          <LinearGradient
            colors={[theme.accentGradientStart.get(), theme.accentGradientEnd.get()]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 999 }}
          />
        </Animated.View>
      </XStack>
    </YStack>
  );
}

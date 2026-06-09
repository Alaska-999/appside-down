import { X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";

export function ScreenHeaderFlashcards({
  title,
  rightAction,
  progress,
  total,
}: {
  title?: string;
  rightAction?: React.ReactNode;
  progress: string;
  total: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

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
        pb="$2"
        pt={insets.top}
        bg="$background"
        justifyContent="space-between"
      >
        <Button
          icon={<X size="$2" color="$color" />}
          circular
          onPress={() => router.back()}
          ml="$-3"
        />
        <Text>
          {progress}/{total}
        </Text>
        {rightAction}
      </XStack>
      <XStack
        position="absolute"
        bottom={0}
        bg="$backgroundCard"
        width="100%"
        height={3}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            height: 3,
            backgroundColor: "#94A3B8",
          },
          barStyle,
        ]}
      />
    </YStack>
  );
}

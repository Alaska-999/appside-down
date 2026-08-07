import { ChevronLeft, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { ReactNode, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";

type ScreenHeaderVariant = "default" | "create" | "flashcards";

interface ScreenHeaderProps {
  variant?: ScreenHeaderVariant;
  title?: string;
  right?: ReactNode;
  onCreate?: () => void;
  progress?: string;
  total?: string;
  rightAction?: ReactNode;
  onClose?: () => void;
}

export function ScreenHeader({
  variant = "default",
  title,
  right,
  onCreate,
  progress,
  total,
  rightAction,
  onClose,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const progressPct =
    variant === "flashcards" && total && Number(total) > 0
      ? Number(progress) / Number(total)
      : 0;
  const barWidth = useSharedValue(progressPct * screenWidth);

  useEffect(() => {
    if (variant === "flashcards") {
      barWidth.value = withTiming(progressPct * screenWidth, { duration: 300 });
    }
  }, [progressPct, screenWidth, variant]);

  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));

  if (variant === "create") {
    return (
      <XStack
        jc="space-between"
        ai="center"
        width="100%"
        px="$screenX"
        pt={insets.top + 10}
        bg="$background"
      >
        <Button
          chromeless
          onPress={() => router.back()}
          p={0}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text color="$colorMuted" fontWeight="600" fontSize={16}>
            Cancel
          </Text>
        </Button>

        <Button chromeless onPress={onCreate} p={0} pressStyle={{ opacity: 0.7 }}>
          <Text color="$accentGradientEnd" fontWeight="700" fontSize={16}>
            Create
          </Text>
        </Button>
      </XStack>
    );
  }

  if (variant === "flashcards") {
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
            onPress={() => (onClose ? onClose() : router.back())}
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

  return (
    <XStack ai="center" p="$4" pt={insets.top} bg="$background">
      <Button
        icon={<ChevronLeft size="$2" color="$color" />}
        circular
        onPress={() => router.back()}
        ml="$-3"
      />

      {title && (
        <Text color="$color" fontSize="$6" fow="bold" ml="$2">
          {title}
        </Text>
      )}

      {right && <XStack f={1} jc="flex-end">{right}</XStack>}
    </XStack>
  );
}

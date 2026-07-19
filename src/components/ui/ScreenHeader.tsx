import { ChevronLeft, X } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
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

function HeaderShell({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <YStack pos="relative" overflow="hidden">
      <BlurView
        intensity={30}
        tint="light"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack pt={insets.top}>{children}</YStack>
    </YStack>
  );
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
      <HeaderShell>
        <XStack jc="space-between" width="100%" p="$2">
          <Button chromeless onPress={() => router.back()}>
            Cancel
          </Button>
          <Button chromeless onPress={onCreate}>
            Create
          </Button>
        </XStack>
      </HeaderShell>
    );
  }

  if (variant === "flashcards") {
    return (
      <HeaderShell>
        <XStack ai="center" p="$4" pb="$2" jc="space-between">
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
        <XStack pos="relative" width="100%" height={3}>
          <XStack pos="absolute" bottom={0} bg="$backgroundCard" width="100%" height={3} />
          <Animated.View
            style={[
              { position: "absolute", bottom: 0, height: 3, backgroundColor: "#6366F1" },
              barStyle,
            ]}
          />
        </XStack>
      </HeaderShell>
    );
  }

  return (
    <HeaderShell>
      <XStack ai="center" p="$4">
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
    </HeaderShell>
  );
}

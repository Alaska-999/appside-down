import { Settings2, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";

export function ScreenHeaderFlashcards({
  title,
  onRight,
  progress,
  total,
}: {
  title?: string;
  onRight: () => void;
  progress: string;
  total: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        <Button
          icon={<Settings2 size="$1.5" color="$color" />}
          circular
          onPress={onRight}
          ml="$-3"
        />
      </XStack>
      <XStack
        position="absolute"
        bottom={0}
        bg="$backgroundCard"
        width="100%"
        height={3}
      />
      <XStack
        position="absolute"
        bg="$darkGrey"
        width={`${(Number(progress) / Number(total)) * 100}%`}
        bottom={0}
        height={3}
      />
    </YStack>
  );
}

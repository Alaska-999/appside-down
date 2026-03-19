import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, XStack } from "tamagui";

export function ScreenHeaderCreate({
  title,
  onCreate,
}: {
  title?: string;
  onCreate: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <XStack
      jc="space-between"
      width="100%"
      p="$2"
      pt={insets.top}
      bg="$background"
    >
      <Button chromeless onPress={() => router.back()}>
        Cancel
      </Button>

      <Button chromeless onPress={onCreate}>
        Create
      </Button>
    </XStack>
  );
}

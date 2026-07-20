import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack } from "tamagui";

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
